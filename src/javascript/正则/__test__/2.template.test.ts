import { render } from '../2.template'

describe('模板渲染', () => {
    const template = '我是{{name}}，年龄{{age}}，性别{{sex}}'

    it('', () => {
        const str = render(template, {
            name: '姓名',
            age: 18,
        })

        expect(str).toBe('我是姓名，年龄18，性别undefined')
    })
})
