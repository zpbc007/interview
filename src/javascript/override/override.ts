export function addOverrideMethod(obj: any, name: string, func: (...args: any[]) => any) {
    const old = obj[name]

    obj[name] = function(...args) {
        if (args.length === func.length) {
            return func.apply(this, args)
        }

        return typeof old === 'function' && old.apply(this, args)
    }
}
