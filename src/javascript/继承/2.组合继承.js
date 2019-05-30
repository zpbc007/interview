/**
 * 子类在构造函数中调用父类构造函数，以继承属性
 * 用父类的实例替换子类的原型，以继承方法
 * 
 * 问题： 
 * 1. 调用了两次父类的构造函数 
 * 2. 子类的原型中也有父类的属性 但却被实例中的属性屏蔽了
 */

function SuperType(name) {
    this.name = name
    this.color = ['red', 'blue', 'green']
}

SuperType.prototype.sayName = function() {
    alert(this.name)
}

function SubType(name, age) {
    // 继承属性
    // 第二次调用 父类构造函数
    SuperType.call(this, name)

    this.age = age
}

// 继承方法 
// 第一次调用 父类构造函数
SubType.prototype = new SuperType()
SubType.prototype.constructor = SubType
SubType.prototype.sayAge = function() {
    alert(this.age)
}

