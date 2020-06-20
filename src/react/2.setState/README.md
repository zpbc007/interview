# react setState

基于 react 16.13.1 了解 react setState 的实现

## 找到 setState 方法

setState 方法定义在 ReactBaseClasses.js 中

```js
Component.prototype.setState = function(partialState, callback) {
  invariant(
    typeof partialState === 'object' ||
      typeof partialState === 'function' ||
      partialState == null,
    'setState(...): takes an object of state variables to update or a ' +
      'function which returns an object of state variables.',
  );
  this.updater.enqueueSetState(this, partialState, callback, 'setState');
};
```
可以看到在 setState 中调用了 this.updater.enqueueSetState 方法，现在需要找到 updater

```js
function Component(props, context, updater) {
  this.props = props;
  this.context = context;
  // If a component has string refs, we will assign a different object later.
  this.refs = emptyObject;
  // We initialize the default updater but the real one gets injected by the
  // renderer.
  this.updater = updater || ReactNoopUpdateQueue;
}
```
ReactNoopUpdateQueue 中只是一个抽象类，并没有定义具体方法的实现，需要找到外部传入的 updater。
全局搜索在 ReactFiberClassComponent.new.js 中找到了赋值的地方。
看下 updater 到底是个啥

```js
const classComponentUpdater = {
  isMounted,
  enqueueSetState(inst, payload, callback) {
    // 获取各种状态，先不需要了解
    const fiber = getInstance(inst);
    const eventTime = requestEventTime();
    const suspenseConfig = requestCurrentSuspenseConfig();
    const lane = requestUpdateLane(fiber, suspenseConfig);

    const update = createUpdate(eventTime, lane, suspenseConfig);
    update.payload = payload;
    if (callback !== undefined && callback !== null) {
      if (__DEV__) {
        warnOnInvalidCallback(callback, 'setState');
      }
      update.callback = callback;
    }

    // 这俩方法应该是重要的看下他们的实现
    enqueueUpdate(fiber, update);
    scheduleUpdateOnFiber(fiber, lane, eventTime);
  },
  ...
};
```

enqueueUpdate 定义在 ReactUpdateQueue.new.js 中，现在看下该文件都实现了些什么

## 先来一段注释

UpdateQueue is a linked list of prioritized updates.

Like fibers, update queues come in pairs: a current queue, which represents
the visible state of the screen, and a work-in-progress queue, which can be
mutated and processed asynchronously before it is committed — a form of
double buffering. If a work-in-progress render is discarded before finishing,
we create a new work-in-progress by cloning the current queue.

Both queues share a persistent, singly-linked list structure. To schedule an
update, we append it to the end of both queues. Each queue maintains a
pointer to first update in the persistent list that hasn't been processed.
The work-in-progress pointer always has a position equal to or greater than
the current queue, since we always work on that one. The current queue's
pointer is only updated during the commit phase, when we swap in the
work-in-progress.

For example:

  Current pointer:           A - B - C - D - E - F
  Work-in-progress pointer:              D - E - F
                                         ^
                                         The work-in-progress queue has
                                         processed more updates than current.

The reason we append to both queues is because otherwise we might drop
updates without ever processing them. For example, if we only add updates to
the work-in-progress queue, some updates could be lost whenever a work-in
-progress render restarts by cloning from current. Similarly, if we only add
updates to the current queue, the updates will be lost whenever an already
in-progress queue commits and swaps with the current queue. However, by
adding to both queues, we guarantee that the update will be part of the next
work-in-progress. (And because the work-in-progress queue becomes the
current queue once it commits, there's no danger of applying the same
update twice.)

Prioritization
--------------

Updates are not sorted by priority, but by insertion; new updates are always
appended to the end of the list.

The priority is still important, though. When processing the update queue
during the render phase, only the updates with sufficient priority are
included in the result. If we skip an update because it has insufficient
priority, it remains in the queue to be processed later, during a lower
priority render. Crucially, all updates subsequent to a skipped update also
remain in the queue *regardless of their priority*. That means high priority
updates are sometimes processed twice, at two separate priorities. We also
keep track of a base state, that represents the state before the first
update in the queue is applied.

For example:

  Given a base state of '', and the following queue of updates

    A1 - B2 - C1 - D2

  where the number indicates the priority, and the update is applied to the
  previous state by appending a letter, React will process these updates as
  two separate renders, one per distinct priority level:

  First render, at priority 1:
    Base state: ''
    Updates: [A1, C1]
    Result state: 'AC'

  Second render, at priority 2:
    Base state: 'A'            <-  The base state does not include C1,
                                   because B2 was skipped.
    Updates: [B2, C1, D2]      <-  C1 was rebased on top of B2
    Result state: 'ABCD'

Because we process updates in insertion order, and rebase high priority
updates when preceding updates are skipped, the final result is deterministic
regardless of priority. Intermediate state may vary according to system
resources, but the final state is always the same.

总结一下：
更新队列是：存放着带有优先级的更新的链表。
一共有两个更新队列，一个代表着当前渲染状态的队列，一个带表着正在处理中的队列。正在处理的队列在提交前可以异步的做出更改。
两个队列公用一个持久化的链表结构。每个队列有一个指针，指向还未处理的第一个更新。新的更新会直接插入到链表中。
处理队列提交：处理队列会变为新的当前队列
处理队列丢弃: 重新从当前队列 copy 一份即可

更新根据插入顺序排序。执行渲染时，会优先渲染优先及高的更新，低优先及的更新依然存在于队列中，并等待之后的低优先级渲染处理。未被处理的低优先级更新后的所有更新都会直接存在于队列中（无论它的优先级是多少）。因此有些高优先级更新会在多个不同优先级的渲染中被处理。

这样会优先处理高优先级渲染，同时又保证了在低优先级渲染后的最终结果。