/**
 * 防抖函数
 * @param func 被执行的函数
 * @param wait 等待时间
 * @param immediate 是否立即执行
 */
export function debounce(func: (...args: any[]) => void, wait: number) {
    let timeout = null

    // 实际被执行的函数
    return function executedFunction(...args) {
        const context = this

        function later() {
            // 清空定时器
            timeout = null
            func.call(context, args)
        }

        // 清空之前的定时器
        clearTimeout(timeout)

        // 等待
        timeout = setTimeout(later, wait)
    }
}
