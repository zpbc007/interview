import ReactSharedInternals from 'shared/ReactSharedInternals';

const {ReactCurrentBatchConfig} = ReactSharedInternals;

export interface SuspenseConfig {
    timeoutMs: number
    busyDelayMs: number
    busyMinDurationMs: number
}

export interface TimeoutConfig {
    timeoutMs: number
}

export function requestCurrentSuspenseConfig(): null | SuspenseConfig {
    return ReactCurrentBatchConfig.suspense
}