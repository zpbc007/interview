import { Fiber } from "./ReactInternalTypes";
import { isSubsetOfLanes, Lanes, NoLanes, mergeLanes, NoLane, Lane } from "./ReactFiberLane";
import { markRenderEventTimeAndConfig } from "./ReactFiberWorkLoop.new";
import { SuspenseConfig } from "./ReactFiberSuspenseConfig";
import { ShouldCapture, DidCapture, Callback } from "./ReactSideEffectTags";

/**
 * 单向链表，代表着每个更新
 */
export interface Update<State> {
    eventTime: number
    lane: Lane
    suspenseConfig: null | SuspenseConfig
    tag: 0 | 1 | 2 | 3
    payload: State | ((preState: State, nextProps: any) => State)
    callback: (() => void) | null

    // 下一个更新
    next: Update<State> | null
}

export interface SharedQueue<State> {
    pending: Update<State> | null
}

export type UpdateQueue<State> = {
    // 应用更新前的基础状态
    baseState: State
    // 第一个更新（链表头结点）
    firstBaseUpdate: Update<State> | null
    // 最后一个更新（链表尾结点）
    lastBaseUpdate: Update<State> | null
    shared: SharedQueue<State>
    effects: Array<Update<State>> | null
}

export const UpdateState = 0;
export const ReplaceState = 1;
export const ForceUpdate = 2;
export const CaptureUpdate = 3;

let hasForceUpdate = false

// 初始化 fiber 节点上的更新队列
export function initializeUpdateQueue<State>(fiber: Fiber) {
    const queue: UpdateQueue<State> = {
        baseState: fiber.memoizedState,
        firstBaseUpdate: null,
        lastBaseUpdate: null,
        shared: {
            pending: null
        },
        effects: null
    }

    fiber.updateQueue = queue
}

// 从当前队列 clone 一份到 workInProgress 中
export function cloneUpdateQueue<State>(current: Fiber, workInProgress: Fiber) {
    const queue = workInProgress.updateQueue
    const currentQueue = current.updateQueue

    if (queue === currentQueue) {
        const clone: UpdateQueue<State> = {
            baseState: currentQueue.baseState,
            firstBaseUpdate: currentQueue.firstBaseUpdate,
            lastBaseUpdate: currentQueue.lastBaseUpdate,
            shared: currentQueue.shared,
            effects: currentQueue.effects
        }

        workInProgress.updateQueue = clone
    }
}

export function createUpdate(eventTime: number, lane: Lane, suspenseConfig: null | SuspenseConfig): Update<any> {
    return {
        eventTime,
        lane,
        suspenseConfig,

        tag: UpdateState,
        payload: null,
        callback: null,

        next: null
    }
}

/**
 * 将更新插入到队列中
 * 
 * pending -> 5 -> 4 -> 3 -> 2 -> 1 -> 5.....
 */
export function enqueueUpdate<State>(fiber: Fiber, update: Update<State>) {
    const updateQueue = fiber.updateQueue

    if (updateQueue === null) {
        // 只有在 fiber 卸载时才会进入
        return 
    }

    const sharedQueue = updateQueue.shared
    const pending = sharedQueue.pending

    if (pending === null) {
        // 第一个更新，创建一个环链接
        update.next = update
    } else {
        update.next = pending.next
        pending.next = update
    }

    // 指向最后插入的更新
    sharedQueue.pending = update
}

/**
 * 从 update 中获取新的状态
 */
function getStateFromUpdate<State>(
    workInProgress: Fiber, 
    queue: UpdateQueue<State>,
    update: Update<State>,
    prevState: State,
    nextProps: any,
    instance: any
): any {
    switch (update.tag) {
        case ReplaceState: {
            const payload = update.payload
            if (typeof payload === 'function') {
                const nextState = payload.call(instance, prevState, nextProps)
                return nextState
            }

            return payload
        }
        case CaptureUpdate: {
            workInProgress.effectTag = (workInProgress.effectTag & ~ShouldCapture) | DidCapture
        }
        case UpdateState: {
            const payload = update.payload
            let partialState: State;
            if (typeof payload === 'function') {
                partialState = payload.call(instance, prevState, nextProps)
            } else {
                partialState  = payload
            }
            if (partialState === null || partialState === undefined) {
                return prevState
            }

            return Object.assign({}, prevState, partialState)
        }
        case ForceUpdate: {
            hasForceUpdate = true
            return prevState
        }
    }

    return prevState
}

// 处理更新队列
export function processUpdateQueue<State>(
    workInProgress: Fiber,
    props: any,
    instance: any,
    renderLanes: Lanes
) {
    // 更新队列
    const queue = workInProgress.updateQueue

    hasForceUpdate = false

    // 队列头结点
    let firstBaseUpdate = queue.firstBaseUpdate
    // 队列尾结点
    let lastBaseUpdate = queue.lastBaseUpdate

    let pendingQueue = queue.shared.pending
    // 检查是否有 pending 的更新，如果有将他转移到 base 队列中
    if (pendingQueue !== null) {
        queue.shared.pending = null

        // 最后一个更新
        const lastPendingUpdate = pendingQueue
        // 第一个更新
        const firstPendingUpdate = lastPendingUpdate.next
        // 打断循环关系
        lastBaseUpdate.next = null

        if (lastBaseUpdate === null) {
            firstBaseUpdate = firstPendingUpdate
        } else {
            // 添加到队尾
            lastBaseUpdate.next = firstPendingUpdate
        }
        // 更新尾结点
        lastBaseUpdate = lastPendingUpdate

        // 如果有 current 队列，并且与 base 队列不同，我们也需要将更新添加到 current 队列中。（跟上面一样的操作）
        const current = workInProgress.alternate
        if (current !== null) {
            const currentQueue = current.updateQueue
            const currentLastBaseUpdate = currentQueue.lastBaseUpdate
            if (currentLastBaseUpdate !== lastBaseUpdate) {
                if (currentLastBaseUpdate === null) {
                    currentQueue.firstBaseUpdate = firstPendingUpdate
                } else {
                    currentLastBaseUpdate.next = firstPendingUpdate
                }

                currentQueue.lastBaseUpdate = lastPendingUpdate
            }
        }
    }

    if (firstBaseUpdate !== null) {
        let newState = queue.baseState
        let newLanes = NoLanes

        let newBaseState = null
        let newFirstBaseUpdate: Update<State> | null= null
        let newLastBaseUpdate: Update<State> | null = null

        // 从头结点开始更新
        let update = firstBaseUpdate
        do {
            const updateLane = update.lane
            const updateEventTime = update.eventTime

            if (!isSubsetOfLanes(renderLanes, updateLane)) {
                // 当前更新的优先级不够，需要跳过。
                const clone: Update<State> = {
                    eventTime: updateEventTime,
                    lane: updateLane,
                    suspenseConfig: update.suspenseConfig,
                    
                    tag: update.tag,
                    payload: update.payload,
                    callback: update.callback,
                    
                    next: null
                }
                
                if (newLastBaseUpdate === null) {
                    // 如果这是第一个被跳过的更新，之前的 更新、状态 将作为新的 基础的更新、状态
                    newFirstBaseUpdate = newLastBaseUpdate = clone
                    newBaseState = newState
                } else {
                    newLastBaseUpdate = newLastBaseUpdate.next = clone
                }

                newLanes = mergeLanes(newLanes, updateLane)
            } else {
                // 当前更新有足够的优先级

                // 之前的跟新被跳过了，之后的所有更新都需要再来一遍
                if (newLastBaseUpdate !== null) {
                    const clone: Update<State> = {
                        eventTime: updateEventTime,
                        // 这次更新将会被提交。使用 NoLane 的原因是 0 是任何 bit 标记的子集。因此这次更新将不会被跳过
                        lane: NoLane,
                        suspenseConfig: update.suspenseConfig,

                        tag: update.tag,
                        payload: update.payload,
                        callback: update.callback,

                        next: null
                    }
                    newLastBaseUpdate = newLastBaseUpdate.next = clone
                }

                markRenderEventTimeAndConfig(updateEventTime, update.suspenseConfig)

                // 执行这次更新
                newState = getStateFromUpdate(
                    workInProgress,
                    queue,
                    update,
                    newState,
                    props,
                    instance
                )
                const callback = update.callback
                if (callback !== null) {
                    workInProgress.effectTag |= Callback
                    const effects = queue.effects
                    if (effects === null) {
                        queue.effects = [update]
                    } else {
                        effects.push(update)
                    }
                }
            }

            update = update.next

            // 没有新的更新
            if (update === null) {
                pendingQueue = queue.shared.pending
                // 没有处理中的更新
                if (pendingQueue === null) {
                    break
                } else {
                    // 处理过程中出现了新的更新
                    const lastPendingUpdate = pendingQueue
                    const firstPendingUpdate = lastPendingUpdate.next
                    lastBaseUpdate.next = null
                    update = firstPendingUpdate
                    queue.lastBaseUpdate = lastPendingUpdate
                    queue.shared.pending = null 
                }
            }

        } while(true)

        if (newLastBaseUpdate === null) {
            newBaseState = newState
        }

        queue.baseState = newBaseState
        queue.firstBaseUpdate = newFirstBaseUpdate
        queue.lastBaseUpdate = newLastBaseUpdate
    }
}

function callCallback(callback:() => void, context: any) {
    callback.call(context)
}

export function resetHasForceUpdateBeforeProcessing() {
    hasForceUpdate = false;
}

export function checkHasForceUpdateAfterProcessing(): boolean {
    return hasForceUpdate;
}

/** 
 * 提交阶段只调用回调函数？
 */
export function commitUpdateQueue<State>(
    finishedWork: Fiber,
    finishedQueue: UpdateQueue<State>,
    instance: any
) {
    const effects = finishedQueue.effects
    finishedQueue.effects = null

    if (effects !== null) {
        for (let i = 0; i < effects.length; i++) {
            const effect = effects[i];
            const callback = effect.callback
            if (callback !== null) {
                effect.callback = null
                callCallback(callback, instance)
            }
        }
    }
}