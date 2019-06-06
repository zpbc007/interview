import { parseParam } from '../1.url参数'

describe('url 参数', () => {
    const url =
        'http://www.domain.com/?user=anonymous&id=123&id=456&city=%E5%8C%97%E4%BA%AC&enabled'
    const result = {
        user: 'anonymous',
        id: [123, 456],
        city: '北京',
        enabled: true,
    }

    it('should parse obj', () => {
        const param = parseParam(url)

        expect(param).toEqual(result)
    })
})
