import { NoTimestamp } from "./ReactFiberLane";
import { SuspenseConfig } from "./ReactFiberSuspenseConfig";

const DEFAULT_TIMEOUT_MS: number = 5000;

// Most recent event time among processed updates during this render.
let workInProgressRootLatestProcessedEventTime: number = NoTimestamp;
let workInProgressRootLatestSuspenseTimeout: number = NoTimestamp;
let workInProgressRootCanSuspendUsingConfig: null | SuspenseConfig = null;

export function markRenderEventTimeAndConfig(
    eventTime: number,
    suspenseConfig: null | SuspenseConfig
) {
    // 记录此次更新中最近的时间
    if (workInProgressRootLatestProcessedEventTime < eventTime) {
        workInProgressRootLatestProcessedEventTime = eventTime
    }

    if (suspenseConfig !== null) {
        const timeoutMs = suspenseConfig.timeoutMs | 0 || DEFAULT_TIMEOUT_MS
        const timeoutTime = eventTime + timeoutMs;
        if (timeoutTime > workInProgressRootLatestSuspenseTimeout) {
            workInProgressRootLatestSuspenseTimeout = timeoutTime
            workInProgressRootCanSuspendUsingConfig = suspenseConfig
        }
    }
}