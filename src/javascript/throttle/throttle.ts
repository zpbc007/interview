/**
 * 节流
 * @param func 被执行函数
 * @param limit 时间间隔
 */
export function throttle(func: (...args: any[]) => void, limit: number) {
    let inThrottle

    return function executeFunc(...args) {
        const context = this
        if (!inThrottle) {
            inThrottle = true
            func.call(context, args)

            setTimeout(() => (inThrottle = false), limit)
        }
    }
}
