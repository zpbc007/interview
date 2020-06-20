export interface Action<T = any> {
    type: T
}

export interface AnyAction extends Action {
    [extraProps: string]: any
}

export interface ActionCreator<A> {
    (...args: any[]): A
}

export interface ActionCreatorsMapObject<A = any> {
    [key: string]: ActionCreator<A>
}