/**
 * 子类调用父类构造函数 继承属性
 * 子类原型的原型指向父类原型 继承方法
 */

function inheritPrototype(subType, superType) {
    const prototype = Object.create(superType.prototype)
    prototype.constructor = subType
    subType.prototype = prototype
}

function SuperType(name) {
    this.name = name
    this.colors = ['red']
}

SuperType.prototype.sayName = function() {
    alert(this.name)
}

function SubType(name, age) {
    SuperType.call(this, name)
    this.age = age
}

inheritPrototype(SubType, SuperType)
SubType.prototype.sayAge = function() {
    alert(this.age)
}

const ins1 = new SubType('zhang san', 1)
const ins2 = new SubType('li si', 2)

ins1.sayAge()
ins2.sayAge()

// 实例公用子类方法
ins1.sayAge === ins2.sayAge

// 实例公用父类方法
ins1.sayName === ins2.sayName

ins1.colors.push('red')

// 属性分离
ins2.colors