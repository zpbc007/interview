import { AnyAction, Action } from "./action";

export type Reducer<S = any, A extends Action = AnyAction> = (
    state: S | undefined,
    action: A
) => S

export type ReducersMapObject<S = any, A extends Action = Action> = {
    [K in keyof S]: Reducer<S[K], A>
}

export type StateFromReducersMapObject<M> = M extends ReducersMapObject<
    any,
    any
>
    ? { [P in keyof M]: M[P] extends Reducer<infer S, any> ? S : never}
    : never

export type ReducerFromReducersMapObject<M> = M extends {
    [P in keyof M] : infer R
}
    ? R extends Reducer<any, any>
        ? R
        : never
    : never

export type ActionFromReducer<R> = R extends Reducer<any, infer A> ? A : never

export type ActionFromReducersMapObject<M> = M extends ReducersMapObject<
    any,
    any
>
    ? ActionFromReducer<ReducerFromReducersMapObject<M>>
    : never