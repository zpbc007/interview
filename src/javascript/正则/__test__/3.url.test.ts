import { parseUrl } from '../3.url'

describe('url 解析', () => {
    const judgeHelper = (
        urlArr: string[],
        expectArr: string[],
        map: (parseResult: ReturnType<typeof parseUrl>) => string,
    ) => {
        urlArr.forEach((url, index) => {
            const result = parseUrl(url)

            expect(map(result)).toEqual(expectArr[index])
        })
    }

    it('should get protocol', () => {
        const urlArr = ['http://www.aa.com', 'https://www.aa.com', 'ftp://www.aa.com', 'www.aa.com']
        const protocolArr = ['http', 'https', 'ftp', '']
        judgeHelper(urlArr, protocolArr, ({ protocol }) => protocol)
    })

    it('should get host', () => {
        const urlArr = [
            'http://www.aa.com/123',
            'http://fp-admin.aa.com/123',
            'http://www.hao123.com/123',
        ]
        const hostArr = ['www.aa.com', 'fp-admin.aa.com', 'www.hao123.com']
        judgeHelper(urlArr, hostArr, ({ host }) => host)
    })

    it('should get port', () => {
        const urlArr = [
            'http://www.aa.com/123',
            'http://www.aa.com:8080',
            'http://www.aa.com:8080/123',
        ]
        const portArr = ['', '8080', '8080']
        judgeHelper(urlArr, portArr, ({ port }) => port)
    })

    it('should get path', () => {
        const urlArr = [
            'http://www.aa.com',
            'http://www.aa.com/',
            'http://www.aa.com/123',
            'http://www.aa.com/123/456',
            'http://www.aa.com/123/url-456',
        ]
        const pathArr = ['', '/', '/123', '/123/456', '/123/url-456']
        judgeHelper(urlArr, pathArr, ({ path }) => path)
    })

    it('should get query', () => {
        const urlArr = ['http://www.aa.com', 'http://www.aa.com?', 'http://www.aa.com?a=1&b=2']
        const queryArr = ['', '', 'a=1&b=2']
        judgeHelper(urlArr, queryArr, ({ query }) => query)
    })

    it('should get hash', () => {
        const urlArr = ['http://www.aa.com', 'http://www.aa.com/#123', 'http://www.aa.com?a=1#123']
        const hashArr = ['', '123', '123']
        judgeHelper(urlArr, hashArr, ({ hash }) => hash)
    })
})
