import { debounce } from '../debounce'

describe('debounce', () => {
    it('should execute later', (cb) => {
        const mockFunc = jest.fn()
        const execFunc = debounce(mockFunc, 100)

        execFunc()
        setTimeout(() => {
            execFunc()
        }, 50)
        setTimeout(() => {
            execFunc()
            expect(mockFunc.mock.calls.length).toBe(0)
            cb()
        }, 80)
    })

    it('should execute once', (cb) => {
        const mockFunc = jest.fn()
        const execFunc = debounce(mockFunc, 100)
        execFunc()
        setTimeout(() => {
            execFunc()
        }, 50)
        setTimeout(() => {
            expect(mockFunc.mock.calls.length).toBe(1)
            cb()
        }, 200)
    })
})
