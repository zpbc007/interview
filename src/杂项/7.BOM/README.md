# BOM

## window 对象

在创建全局变量时，会将变量添加为 window 对象的一个属性，但与直接定义 window 对象的一个属性在 delete 操作时，会有不同的结果。

```js
var a = 1
window.b = 2

Object.getOwnPropertyDescriptor(window, 'a') // {value: 1, writable: true, enumerable: true, configurable: false}
Object.getOwnPropertyDescriptor(window, 'b') // {value: 2, writable: true, enumerable: true, configurable: true}

delete window.a // false 全局作用域的变量不能从 window 对象上删除
delete window.b // true window 对象添加的属性可以 删除
```

全局变量的 configurable 属性为 false 因此不能从 window 对象上删除, 而添加的 b 属性 configurable 为 true，因此可以删除。

