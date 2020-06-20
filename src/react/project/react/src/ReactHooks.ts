import { Dispatch, BasicStateAction } from "../../react-reconciler/src/ReactInternalTypes"
import ReactCurrentDispatcher from './ReactCurrentDispatcher'

function resolveDispatcher() {
    const dispatcher = ReactCurrentDispatcher.current
    return dispatcher
}

export function useContext<T>(
    Context: ReactContext<T>,
): T {
    const dispatcher = resolveDispatcher()
    return dispatcher.useContext(Context)
}

export function useState<S>(
    initialState: (() => S) | S
): [S, Dispatch<BasicStateAction<S>>] {
    const dispatcher = resolveDispatcher()
    return dispatcher.useState(initialState)
}

export function useReducer<S, I, A>(
    reducer: (s: S, a: A) => S,
    initialArg: I,
    init?: (i: I) => S
) {
    const dispatcher = resolveDispatcher()
    return dispatcher.useReducer(reducer, initialArg, init)
}