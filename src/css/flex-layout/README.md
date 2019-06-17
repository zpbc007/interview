# flex 布局

![容器](./public/01-container.svg)
![子项](./public/02-items.svg)

## 容器属性

#### display

```css
.container {
    display: flex | inline-flex;
}
```

#### flex-direction

![主轴方向](./public/flex-direction.svg)

定义主轴的方向

```css
.container {
    flex-direction: row | row-reverse | column | column-reverse;
}
```

#### flex-wrap

![换行](./public/flex-wrap.svg)

默认下，会在一行中显示所有子项

```css
.container {
    flex-wrap: nowrap | wrap | wrap-reverse;
}
```

- nowrap 所有子项显示在一行中
- wrap 多行显示（由上到下）
- wrap-reverse 多行显示（由下到上）

#### flex-flow

flex-direction、flex-wrap的简写,默认值为 `row nowrap`

```css
flex-flow: <flex-direction> | <flex-wrap>;
```

#### justify-content

![主轴对齐](./public/justify-content.svg)

定义主轴对齐方式。

```css
.container {
    justify-content: flex-start | flex-end | center | space-between | space-around | space-evenly;
}
```

- flex-start(默认) 从头对齐
- flex-end 从尾对齐
- center 居中对齐
- space-between 两侧没有空隙，剩下的空间平均分配
- space-around 两侧各占空隙的0.5份，剩下的空间平均分配
- space-evenly 两侧各占空隙的1份，剩下的空间平均分配

#### align-items

![](./public/align-items.svg)

定义垂直于主轴方向的对齐方式

```css
.container {
    align-items: stretch | flex-start | flex-end | center | baseline;
}
```

- stretch(default) 填充
- flex-start 垂直于主轴方向从头对齐
- flex-end垂直于主轴方向居中对齐
- center 垂直于主轴方向从尾对齐
- baseline 

#### align-content

![](./public/align-content.svg)

多行对齐方式

```css
.container {
    align-content: flex-start | flex-end | center | space-between | space-around | stretch;
}
```

- stretch(default) 填充
- flex-start 
- flex-end 
- center 只有两侧有间距
- space-between 两侧没有间距
- space-around 每行间距相同

#### order

![](./public/order.svg)

定义子项顺序，默认为0

```css
.item {
    order: <integer>;
}
```

#### flex-grow

![](./public/flex-grow.svg)

定义子项增长比例,默认为0

```css
.item {
    flex-grow: <number>;
}
```

#### flex-shrink

定义子项缩小比例,默认为1

```css
.item {
    flex-shrink: <number>;
}
```

#### flex-basis

定义子项默大小，默认为auto

```css
.item {
    flex-basis: <length> | auto;
}
```

#### flex

flex-grow、flex-shrink、flex-basis的简写，默认 `0 1 auto`

```css
.item {
    flex: none | [<flex-grow> <flex-shrink> <flex-basis>]
}
```

#### align-self

![](./public/align-self.svg)

定义子项的垂直于主轴的对齐方式

```css
.item {
    align-self: auto | flex-start | flex-end | center | baseline | stretch;
}
```
