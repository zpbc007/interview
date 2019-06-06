export function parseParam(url: string) {
    // ? 后面的字符串
    const paramString = /^.+\?(.+)$/.exec(url)[1]
    // 参数组
    const paramArr = paramString.split('&')
    return paramArr.reduce(
        (result, param) => {
            let value: any
            let key: string
            if (/=/.test(param)) {
                const [strKey, strValue] = param.split('=')
                key = strKey
                value = decodeURIComponent(strValue)
                value = /^\d+$/.test(value) ? Number(value) : value

                if (result[key]) {
                    if (Array.isArray(result[key])) {
                        value = [...result[key], value]
                    } else {
                        value = [result[key], value]
                    }
                }
            } else {
                key = param
                value = true
            }

            return {
                ...result,
                [key]: value,
            }
        },
        {} as any,
    )
}
