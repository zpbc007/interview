# BFC block-formatting-context

块级格式化上下文。它是一个独立的渲染区域，只有 block-level box 参与，它规定了内部的 block-level box 如何布局，并且与这个区域外毫不相干。

文档流分为定位流、浮动流和普通流。普通流就是 **FC**。

FC (formatting content) 格式化上下文，它是页面中的一块渲染区域，有一套渲染规则，决定了子元素如何布局，以及和其他元素之间的关系和作用。

常见的 FC 有 BFC、IFC（行内格式化上下文）、GFC（网格布局格式化上下文）和 FFC（自适应格式化上下文）。

## BFC 的触发条件

满足以下条件之一就可以触发 BFC

- 根元素或包含根元素的元素
- 浮动元素（float 的值不为 none）
- 绝对定位元素（position 的值为 absolute 或 fixed）
- display 的值为 flow-root、inline-block、table-cell、table-caption
- overflow 的值不为 visible 的块元素
- 弹性元素（display 为 flex 或 inline-flex 元素的直接子元素）
- 网格元素（display 为 grid 或 inline-grid 元素的直接子元素）

## BFC 的布局规则

- 内部的 Box 会在垂直方向，一个接一个放置
- Box 垂直方向距离由 margin 决定。属于同一个 BFC 的两个相邻的 margin 会发生重叠
- 每个元素的 margin box 的左边，与包含块 border box 的左边向接触。即使存在浮动也是如此。
- BFC 的区域不会与 float box 重叠。
- BFC 就是页面上的一个隔离的独立容器，容器里面的子元素不会影响到外面的元素，反之亦然。
- 计算 BFC 高度时，浮动元素也参与计算。

## BFC 的作用

1. 自适应两栏布局
2. 可以阻止元素被浮动元素覆盖
3. 可以包含浮动元素 清除内部浮动
4. 分属于不同的 BFC 时可以阻止 margin 重叠

## 演示

### 阻止 margin 重叠

通过给一个元素添加 BFC 的父级来阻止重叠效果

[阻止 margin 重叠](./playground/1.阻止margin重叠.html)

### 普通流无法包含 float 元素

[包含 float](./playground/2.每个元素的marigin-box.html)

### bfc 不会与 float box 重叠

[bfc 不会与 float box 重叠](./playground/3.bfc的区域不会与float-box重叠.html)