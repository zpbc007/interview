import { Lane, Lanes, NoLanes } from "./ReactFiberLane";
import { SuspenseConfig, requestCurrentSuspenseConfig } from "./ReactFiberSuspenseConfig";
import { ReactPriorityLevel, Fiber, Dispatcher } from "./ReactInternalTypes";
import { HookEffectTag } from "./ReactHookEffectTags";
import ReactCurrentDispatcher from "../../react/src/ReactCurrentDispatcher";
import {
    Update as UpdateEffect,
    Passive as PassiveEffect,
    SideEffectTag
  } from './ReactSideEffectTags';
  import {
    HasEffect as HookHasEffect,
    Layout as HookLayout,
    Passive as HookPassive,
  } from './ReactHookEffectTags';
import is from '../../shared/objectIs';


type Update<S, A> = {
    // TODO: Temporary field. Will remove this by storing a map of
    // transition -> start time on the root.
    eventTime: number,
    lane: Lane,
    suspenseConfig: null | SuspenseConfig,
    action: A,
    eagerReducer: ((S, A) => S) | null,
    eagerState: S | null,
    next: Update<S, A>,
    priority?: ReactPriorityLevel,
};
  
type UpdateQueue<S, A> = {
    pending: Update<S, A> | null,
    dispatch: ((action: A)=> any) | null,
    lastRenderedReducer: ((s: S, a: A) => S) | null,
    lastRenderedState: S | null,
};

export type HookType =
  | 'useState'
  | 'useReducer'
  | 'useContext'
  | 'useRef'
  | 'useEffect'
  | 'useLayoutEffect'
  | 'useCallback'
  | 'useMemo'
  | 'useImperativeHandle'
  | 'useDebugValue'
  | 'useResponder'
  | 'useDeferredValue'
  | 'useTransition'
  | 'useMutableSource'
  | 'useOpaqueIdentifier';

export type Hook = {
    memoizedState: any,
    baseState: any,
    baseQueue: Update<any, any> | null,
    queue: UpdateQueue<any, any> | null,
    next: Hook | null,
};

export type Effect = {
    tag: HookEffectTag,
    create: () => (() => void) | void,
    destroy: (() => void) | void,
    deps: Array<any> | null,
    next: Effect,
};

export type FunctionComponentUpdateQueue = {lastEffect: Effect | null};

type TimeoutConfig = {
  timeoutMs: number,
};

type BasicStateAction<S> = ((s: S) => S) | S;

type Dispatch<A> = (a: A) => void;

// These are set right before calling the component.
let renderLanes: Lanes = NoLanes;
// The work-in-progress fiber. I've named it differently to distinguish it from
// the work-in-progress hook.
let currentlyRenderingFiber: Fiber | null = null

// Hooks 保存在 fiber 的 memoizedState 字段中
// currentHook 属于 current fiber 节点
// workInProgressHook 将会添加到 work-in-progress fiber 中
// Hooks are stored as a linked list on the fiber's memoizedState field. The
// current hook list is the list that belongs to the current fiber. The
// work-in-progress hook list is a new list that will be added to the
// work-in-progress fiber.
let currentHook: Hook | null = null;
let workInProgressHook: Hook | null = null;

// Whether an update was scheduled at any point during the render phase. This
// does not get reset if we do another render pass; only when we're completely
// finished evaluating this component. This is an optimization so we know
// whether we need to clear render phase updates after a throw.
let didScheduleRenderPhaseUpdate: boolean = false;
// Where an update was scheduled only during the current render pass. This
// gets reset after each attempt.
// TODO: Maybe there's some way to consolidate this with
// `didScheduleRenderPhaseUpdate`. Or with `numberOfReRenders`.
let didScheduleRenderPhaseUpdateDuringThisPass: boolean = false;

const RE_RENDER_LIMIT = 25;

export function renderWithHooks<Props, SecondArg>(
    current: Fiber | null,
    workInProgress: Fiber,
    Component: (p: Props, arg: SecondArg) => any,
    props: Props,
    secondArg: SecondArg,
    nextRenderLanes: Lanes
){
    renderLanes = nextRenderLanes
    currentlyRenderingFiber = workInProgress

    workInProgress.memoizedState = null
    workInProgress.updateQueue = null
    workInProgress.lanes = NoLanes

    // 根据 memoizedState 是否为空来判断当前是 mount 阶段还是 update 阶段
    ReactCurrentDispatcher.current = current === null || current.memoizedState === null 
        ? HooksDispatcherOnMount
        : HooksDispatcherOnUpdate
    
    // 执行函数，获取组件子节点
    let children = Component(props, secondArg)

    // 检查是否是 render 阶段的更新
    if (didScheduleRenderPhaseUpdateDuringThisPass) {
        // 只要在 render 阶段有新的更新，就在循环中不断的渲染
        // 使用一个计数器防止无限循环
        let numberOfReRenders = 0
        do {
            didScheduleRenderPhaseUpdateDuringThisPass = false

            if (numberOfReRenders >= RE_RENDER_LIMIT) {
                throw '渲染次数太多'
            }
            numberOfReRenders +=1

            currentHook = null
            workInProgressHook = null

            workInProgress.updateQueue = null

            ReactCurrentDispatcher.current = HooksDispatcherOnRerender

            children = Component(props, secondArg)
        } while(didScheduleRenderPhaseUpdateDuringThisPass)
    }

    ReactCurrentDispatcher.current = ContextOnlyDispatcher

    // 还有未渲染的 hooks
    const didRenderTooFewHooks = currentHook !== null && currentHook.next !== null

    renderLanes = NoLanes
    currentlyRenderingFiber = null

    currentHook = null
    workInProgressHook = null

    didScheduleRenderPhaseUpdate = false

    if (didRenderTooFewHooks) {
        throw '提前 return 导致某些 hook 没有被执行'
    }

    return children
}

/** 创建 hook */
function mountWorkInProgressHook(): Hook {
    const hook: Hook = {
        memoizedState: null,

        baseState: null,
        baseQueue: null,
        queue: null,

        next: null
    }

    if (workInProgressHook === null) {
        // 第一个 hook
        currentlyRenderingFiber.memoizedState = workInProgressHook = hook
    } else {
        // 添加到队列的末尾
        workInProgressHook = workInProgressHook.next = hook
    }

    return workInProgressHook
}

/**
 * 由渲染阶段的更新触发，用于更新、重新渲染
 * 
 * 
 */
function updateWorkInProgressHook(): Hook {
    // 获取 current fiber 上的 hook
    let nextCurrentHook: null | Hook
    if (currentHook === null) {
        // 第一个 current fiber 上的 hook
        const current = currentlyRenderingFiber.alternate
        if (current !== null) {
            nextCurrentHook = current.memoizedState
        } else {
            nextCurrentHook = null
        }
    } else {
        nextCurrentHook = currentHook.next
    }

    // 获取 wip fiber 上的 hook
    let nextWorkInProgressHook: null | Hook
    if (workInProgressHook === null) {
        nextWorkInProgressHook = currentlyRenderingFiber.memoizedState
    } else {
        nextWorkInProgressHook = workInProgressHook.next
    }

    if (nextWorkInProgressHook !== null) {
        // 重用
        workInProgressHook = nextWorkInProgressHook
        nextWorkInProgressHook = workInProgressHook.next

        currentHook = nextCurrentHook
    } else {
        if (nextCurrentHook === null) {
            throw '比上次渲染多出了一些 hooks'
        }
        currentHook = nextCurrentHook

        const newHook: Hook = {
            memoizedState: currentHook.memoizedState,

            baseState: currentHook.baseState,
            baseQueue: currentHook.baseQueue,
            queue: currentHook.queue,

            next: null
        }

        if (workInProgressHook === null) {
            // 头结点
            currentlyRenderingFiber.memoizedState = workInProgressHook = newHook
        } else {
            // 添加到队尾
            workInProgressHook = workInProgressHook.next = newHook
        }
    }

    return workInProgressHook
}

function createFunctionComponentUpdateQueue(): FunctionComponentUpdateQueue {
    return {
        lastEffect: null
    }
}

/**
 * 比较数组元素
 */
function areHookInputsEqual(
    nextDeps: any[],
    prevDeps: any[] | null
) {
    if (prevDeps === null) {
        return false
    }

    for (let i = 0; i < prevDeps.length && i < nextDeps.length; i++) {
        if (is(nextDeps[i], prevDeps[i])) {
            continue
        }
        return false
    }

    return true
}

/**
 * 创建 hook ，将 callback 与 deps 绑定在 hook 上
 */
function mountCallback<T>(
    callback: T, 
    deps: Array<any> | void | null
): T {
    const hook = mountWorkInProgressHook()
    const nextDeps = deps === undefined ? null : deps
    hook.memoizedState = [callback, nextDeps]

    return callback
}

function updateCallback<T>(
    callback: T,
    deps: any[] | null
): T {
    const hook = updateWorkInProgressHook()
    const nextDeps = deps === undefined ? null : deps
    const prevState = hook.memoizedState
    if (prevState !== null) {
        if (nextDeps !== null) {
            const prevDeps = prevState[1]
            // 依赖未更新，使用缓存
            if (areHookInputsEqual(nextDeps, prevDeps)) {
                return prevState[0]
            }
        }
    }

    // 更新缓存
    hook.memoizedState = [callback, nextDeps]
    return callback
}

function pushEffect(
    tag: number,
    create: () => (() => void) | null,
    destroy,
    deps?: any[] | null
) {
    const effect: Effect = {
        tag,
        create,
        destroy,
        deps,
        next: null
    }

    let componentUpdateQueue: null | FunctionComponentUpdateQueue = currentlyRenderingFiber.updateQueue
    if (componentUpdateQueue === null) {
        componentUpdateQueue = createFunctionComponentUpdateQueue()
        currentlyRenderingFiber.updateQueue = componentUpdateQueue
        componentUpdateQueue.lastEffect = effect.next = effect
    } else {
        const lastEffect = componentUpdateQueue.lastEffect
        if (lastEffect === null) {
            componentUpdateQueue.lastEffect = effect.next = effect
        } else {
            const firstEffect = lastEffect.next
            lastEffect.next = effect
            effect.next = firstEffect
            componentUpdateQueue.lastEffect = effect
        }
    }

    return effect
}

function mountEffectImpl(fiberEffectTag: SideEffectTag, hookEffectTag: HookEffectTag, create: () => (() => void) | null, deps?: any[]) {
    const hook = mountWorkInProgressHook()
    const nextDeps = deps === undefined ? null : deps
    currentlyRenderingFiber.effectTag |= fiberEffectTag
    hook.memoizedState = pushEffect(
        HookHasEffect | hookEffectTag,
        create,
        undefined,
        nextDeps
    )
}

function updateEffectImpl(fiberEffectTag: SideEffectTag, hookEffectTag: HookEffectTag, create: () => (() => void) | null, deps?: any[]) {
    const hook = updateWorkInProgressHook()
    const nextDeps = deps === undefined ? null : deps
    let destroy = undefined

    if (currentHook !== null) {
        const prevEffect = currentHook.memoizedState
        destroy = prevEffect.destroy
        if (nextDeps !== null) {
            const prevDeps = prevEffect.deps
            if (areHookInputsEqual(nextDeps, prevDeps)) {
                pushEffect(hookEffectTag, create, destroy, nextDeps)

                return 
            }
        }
    }

    currentlyRenderingFiber.effectTag |= fiberEffectTag

    hook.memoizedState = pushEffect(
        HookHasEffect | hookEffectTag,
        create,
        destroy,
        nextDeps
    )
}

function mountEffect(
    create: () => (() => void) | null,
    deps: Array<any> | null
) {
    return mountEffectImpl(
        UpdateEffect | PassiveEffect,
        HookPassive,
        create,
        deps
    )
}

function updateEffect(
    create: () => (() => void) | void,
    deps: any[] | null
) {
    return updateEffectImpl(
        UpdateEffect | PassiveEffect,
        HookPassive,
        create,
        deps
    )
}

function mountMemo<T>(
    nextCreate: () => T,
    deps: any[] | null
) {
    const hook = mountWorkInProgressHook()
    const nextDeps = deps === undefined ? null : deps
    const nextValue = nextCreate()
    hook.memoizedState = [nextValue, nextDeps]
    return nextValue
}

function updateMemo<T>(
    nextCreate: () => T,
    deps: any[] | null
): T {
    const hook = updateWorkInProgressHook()
    const nextDeps = deps === undefined ? null : deps
    const prevState = hook.memoizedState

    if (prevState !== null) {
        if (nextDeps !== null) {
            const prevDeps = prevState[1]
            if (areHookInputsEqual(nextDeps, prevDeps)){
                return prevState[0]
            }
        }
    }
    const nextValue = nextCreate()
    hook.memoizedState = [nextValue, nextDeps]
    return nextValue
}

function dispatchAction<S, A>(
    fiber: Fiber,
    queue: UpdateQueue<S, A>,
    action: A
) {
    const eventTime = requestEventTime()
    const suspenseConfig = requestCurrentSuspenseConfig()
    const lane = requestUpdateLane(fiber, suspenseConfig)

    const update: Update<S, A> = {
        eventTime,
        lane,
        suspenseConfig,
        action,
        eagerReducer: null,
        eagerState: null,
        next: null
    }

    const pending = queue.pending
    if (pending === null) {
        update.next = update
    } else {
        update.next = pending.next
        pending.next = update
    }
    queue.pending = update

    const alternate = fiber.alternate
    if (
        fiber === currentlyRenderingFiber ||
        (alternate !== null && alternate === currentlyRenderingFiber)
    ) {
        // 渲染阶段的更新
        didScheduleRenderPhaseUpdateDuringThisPass = didScheduleRenderPhaseUpdate = true
    } else {
        if (
            fiber.lanes ==
        )
    }
}

function mountReducer<S, I, A>(
    reducer: (s: S, a: A) => S,
    initialArg: I,
    init?: (i: I) => S
): [S, Dispatch<A>] {
    const hook = mountWorkInProgressHook()
    let initialState
    if (init !== undefined) {
        initialState = init(initialArg)
    } else {
        initialState = initialArg
    }

    hook.memoizedState = hook.baseState = initialState
    const queue = (hook.queue = {
        pending: null,
        dispatch: null,
        lastRenderedReducer: reducer,
        lastRenderedState: initialState
    })
    const dispatch = (queue.dispatch = (dispatchAction.bind(
        null,
        currentlyRenderingFiber,
        queue
    )))

    return [hook.memoizedState, dispatch]
}

const HooksDispatcherOnMount: Dispatcher = {
    readContext,

    useCallback: mountCallback,
    useContext: readContext,
    useEffect: mountEffect,
    useMemo: mountMemo,
    useReducer: mountReducer,
}

const HooksDispatcherOnUpdate: Dispatcher = {
    readContext,

    useCallback: updateCallback,
    useContext: readContext,
    useEffect: updateEffect,
    useMemo: updateMemo,
    useReducer: updateReducer,
}