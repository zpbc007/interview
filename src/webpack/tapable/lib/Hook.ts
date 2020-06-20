import util from 'util'
import { ArgumentNames, AsArray, HookInterceptor, Append, Callback, Tap, TapOptions, TapType, HookType } from './type'

/**
 * TODO: 
 * 1. 这几个 delegate 的作用
 * 2. 为什么每次执行都进行一次函数赋值
 * 3. 是否可以用装饰器
 */
const CALL_DELEGATE = function (this: Hook<any ,any>, ...args: any[]) {
    this.call = this._createCall('sync')
    return this.call(...args)
}

const CALL_ASYNC_DELEGATE = function (this: Hook<any ,any>, ...args: any[]) {
    this.callAsync = this._createCall('async')
    return this.callAsync(...args)
}

const PROMISE_DELEGATE = function (this: Hook<any ,any>, ...args: any[]) {
    this.promise = this._createCall('promise')
    return this.promise(...args)
}

const deprecateContext = util.deprecate(() => {},
"Hook.context is deprecated and will be removed");

// 拦截器
export interface IInterceptor {
    register?: (options) => any
}

export abstract class Hook<T, R> implements HookType<T, R> {
    private taps: Tap[] = []

    private interceptors: IInterceptor[] = []

    callAsync: (...args: Append<AsArray<T>, Callback<Error, R>>) => void

    promise: (...args: AsArray<T>) => Promise<R>

    constructor(public _args: ArgumentNames<AsArray<T>> = [] as any, public name?: string) {
        this._call = CALL_DELEGATE;
		this.call = CALL_DELEGATE;
		this._callAsync = CALL_ASYNC_DELEGATE;
		this.callAsync = CALL_ASYNC_DELEGATE;
		this._promise = PROMISE_DELEGATE;
        this.promise = PROMISE_DELEGATE;
        
        // TODO: 这是啥
        this._x = undefined;
    }

    /** 子类重写 */
    abstract compile(options: any): any

    intercept(interceptor: HookInterceptor<T, R>): void {
        this._resetCompilation()
        this.interceptors.push(Object.assign({}, interceptor))
        if (interceptor.register) {
            for (let i = 0; i < this.taps.length; i++) {
                // TODO: 这里的类型不对
                this.taps[i] = interceptor.register(this.taps[i])
            }
        }
    }

    /** 是否使用过 */
    isUsed(): boolean {
        return this.taps.length > 0 || this.interceptors.length > 0
    }

    withOptions(options: TapOptions): HookType<T, R> {
        const mergeOptions = opt =>
            Object.assign({}, options, typeof opt === 'string' ? {name: opt}: opt)

        return {
            name: this.name,
            tap: (opt, fn) => this.tap(mergeOptions(opt), fn),
            tapAsync: (opt, fn) => this.tapAsync(mergeOptions(opt), fn),
            tapPromise: (opt, fn) => this.tapPromise(mergeOptions(opt), fn),
            intercept: interceptor => this.intercept(interceptor),
            isUsed: () => this.isUsed(),
            withOptions: opt => this.withOptions(mergeOptions(opt))
        }
    }

    /** TODO: 干嘛用的 */
    _createCall(type: string) {
        return this.compile({
            taps: this.taps,
            interceptors: this.interceptors,
            args: this._args,
            type
        })
    }

    tap(options: string | Tap, fn: (...args: AsArray<T>) => R) {
        this._tap(TapType.sync, options, fn)
    }

    tapAsync(options: string | Tap, fn: (...args: AsArray<T>) => R) {
        this._tap(TapType.async, options, fn)
    }

    tapPromise(options: string | Tap, fn: (...args: AsArray<T>) => R) {
        this._tap(TapType.promise, options, fn)
    }

    private _resetCompilation() {
        this.call = this._call;
		this.callAsync = this._callAsync;
		this.promise = this._promise;
    }

    // 参数检查
    private _tapCheck(options: string | Tap): Tap {
        // 参数校验
        if (typeof options === 'string') {
            options = {
                name: options
            }
        } else if (typeof options !== 'object' || options === null) {
            throw new Error('Invalid tap options')
        }

        if (typeof options.name !== 'string' || options.name === '') {
            throw new Error('Missing name for tap')
        }

        if (typeof options.context !== 'undefined') {
            deprecateContext()
        }

        return options
    }

    /**
     * 添加新的 tap
     */
    private _tap(type: TapType, options: string | Tap, fn: (...args: AsArray<T>) => R) {
        const newOptions = this._tapCheck(options)

        options = Object.assign({type, fn}, newOptions)
        // 跑一遍注册的拦截器
        options = this._runRegisterInterceptors(options)
        this._insert(newOptions)
    }

    /**
     * 跑一遍注册的拦截器
     * @param options 
     */
    _runRegisterInterceptors(options: Tap) {
        for (const interceptor of this.interceptors) {
            if (interceptor.register) {
                const newOptions = interceptor.register(options)
                if (newOptions !== undefined) {
                    options = newOptions
                }
            }
        }

        return options
    }

    /**
     * 根据 stage & before 插入到数组中
     * @param item 
     */
    private _insert(item: Tap) {
        this._resetCompilation()
        let before: Set<string>
        if (typeof item.before === 'string') {
            before = new Set([item.before])
        } else if (Array.isArray(item.before)) {
            before = new Set(item.before)
        }
        let stage = 0
        if (typeof item.stage === 'number') {
            stage = item.stage
        }
        let i = this.taps.length
        // 从后向前遍历
        while (i > 0) {
            i--;
            // 数组中的元素
            const x = this.taps[i]
            // 后移一位
            this.taps[i + 1] = x
            const xStage = x.stage || 0
            if (before) {
                // 需要在当前元素的前面
                if (before.has(x.name)) {
                    before.delete(x.name)
                    continue
                }
                // 向前继续查询
                if (before.size > 0) {
                    continue
                }
            }
            // 根据 stage 排序
            if (xStage > stage) {
                continue
            }
            // 插入位置
            i++
            break
        }
        this.taps[i] = item
    }
}