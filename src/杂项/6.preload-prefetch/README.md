# preload 与 prefetch

```html
<link rel="preload" />
<link rel="prefetch" />
```

- preload 是一个声明式的 fetch，可以强制浏览器请求资源，且不阻塞 onload 事件。
- prefetch 告诉浏览器该资源将来可能会被使用，何时加载该资源由浏览器决定。