/**
 * 子类在构造函数中调用父类的构造函数以实现继承
 * 
 * 问题：函数无法复用，每个实例都有一份函数的备份
 */

function SuperType() {
    this.color  = ['red', 'blue', 'green']
} 

function SubType() {
    SuperType.call(this)
}