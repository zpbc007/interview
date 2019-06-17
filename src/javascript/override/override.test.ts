import { addOverrideMethod } from './override'

describe('override', () => {
    it('should override', () => {
        const obj = { a: () => -1 } as any
        addOverrideMethod(obj, 'a', () => 0)
        addOverrideMethod(obj, 'a', (a) => 1)
        addOverrideMethod(obj, 'a', (a, b) => 2)
        addOverrideMethod(obj, 'a', (a, b, c) => 3)

        // 函数重载
        expect(obj.a()).toBe(0)
        expect(obj.a(1)).toBe(1)
        expect(obj.a(1, 2)).toBe(2)
        expect(obj.a(1, 2, 3)).toBe(3)

        // 不满足的使用原生定义
        expect(obj.a(1, 2, 3, 4)).toBe(-1)
    })
})
