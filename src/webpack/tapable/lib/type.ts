// 固定长度的数组
export type FixedSizeArray<T extends number, U> = T extends 0
    ? void[]
    : ReadonlyArray<U> & {
        0: U;
        length: T
    }

// 取出固定位置的类型
export type Measure<T extends number> = T extends 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
    ? T
    : never

// 像数组添加对应的类型
export type Append<T extends any[], U> = {
    0: [U];
	1: [T[0], U];
	2: [T[0], T[1], U];
	3: [T[0], T[1], T[2], U];
	4: [T[0], T[1], T[2], T[3], U];
	5: [T[0], T[1], T[2], T[3], T[4], U];
	6: [T[0], T[1], T[2], T[3], T[4], T[5], U];
	7: [T[0], T[1], T[2], T[3], T[4], T[5], T[6], U];
	8: [T[0], T[1], T[2], T[3], T[4], T[5], T[6], T[7], U];
}[Measure<T['length']>]

// 将泛型转为数组
export type AsArray<T> = T extends any[] ? T : [T]

export type Callback<E, T> = (error: E | null, result?: T) => void

// 参数列表（不能更改长度）
export type ArgumentNames<T extends any[]> = FixedSizeArray<T['length'], string>

export type TapOptions = {
    before?: string
    stage?: number
}

export type Tap = TapOptions & {
    name: string
    context?: any
}

export interface HookType<T, R> {
    name?: string;
	intercept(interceptor: HookInterceptor<T, R>): void;
	isUsed(): boolean;
	callAsync(...args: Append<AsArray<T>, Callback<Error, R>>): void;
	promise(...args: AsArray<T>): Promise<R>;
	tap(options: string | Tap, fn: (...args: AsArray<T>) => R): void;
	withOptions(options: TapOptions): HookType<T, R>;
}

export interface HookInterceptor<T, R> {
    name?: string
    tap?: (tap: Tap) => void
    call?: (...args: any[]) => void
    loop?: (...ars: any[]) => void
    error?: (err: Error) => void
    result?: (result: R) => void
    done?: () => void
    register?: (hook: HookType<T, R>) => HookType<T, R>
}

export enum TapType {
    sync = 'sync',
    async = 'async',
    promise = 'promise'
}