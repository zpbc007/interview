/**
 * objectIs 与 === 的区别
 * +0 === -0
 * NaN !== NaN
 */
function is(x: any, y: any) {
    return (
        // 两个值相等 & (不等于0 || +0 -0)
        (x === y && (x !== 0 || 1 / x === 1 / y)) 
        // 都是 NaN
        || (x !== x && y !== y)
    )
}

const objectIs = typeof Object.is === 'function' ? Object.is : is

export default objectIs