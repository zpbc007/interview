export function curry(fn: (...args: any[]) => any, preArg: any[] = []) {
    return function(...args: any[]) {
        const curArg = [...preArg, ...args]
        return fn.length === curArg.length ? fn.apply(this, curArg) : curry(fn, curArg)
    }
}
