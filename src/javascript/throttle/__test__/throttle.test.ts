import { throttle } from '../throttle'

describe('throttle', () => {
    it('should be called one time', () => {
        const mockFunc = jest.fn()
        const execFunc = throttle(mockFunc, 1000)

        // 第一次应立即执行
        execFunc()
        expect(mockFunc.mock.calls.length).toBe(1)

        // 一秒后执行
        execFunc()
        execFunc()
        execFunc()
        expect(mockFunc.mock.calls.length).toBe(1)
    })

    it('should be called every 1 second', (cb) => {
        const mockFunc = jest.fn()
        const execFunc = throttle(mockFunc, 1000)

        // 第一次应立即执行
        execFunc()
        expect(mockFunc.mock.calls.length).toBe(1)

        // 不会被执行
        execFunc()
        expect(mockFunc.mock.calls.length).toBe(1)

        setTimeout(() => {
            // 可以执行了
            execFunc()
            expect(mockFunc.mock.calls.length).toBe(2)

            // 不会被执行
            execFunc()
            setTimeout(() => {
                // 可以执行了
                execFunc()
                expect(mockFunc.mock.calls.length).toBe(3)
                cb()
            }, 1100)
        }, 1100)
    })
})
