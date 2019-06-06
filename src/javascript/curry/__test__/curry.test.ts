import { curry } from '../curry'

describe('curry', () => {
    it('should curry function', () => {
        const fn = (a, b, c) => {
            return a + b + c
        }

        const curryFn = curry(fn)

        expect(curryFn(1)(2)(3)).toEqual(6)
    })
})
