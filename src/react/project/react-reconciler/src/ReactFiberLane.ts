export type LanePriority =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16;

export type Lanes = number;
export type Lane = number;
export type LaneMap<T> = Array<T>;

export const SyncLanePriority: LanePriority = 16;
const SyncBatchedLanePriority: LanePriority = 15;

const InputDiscreteHydrationLanePriority: LanePriority = 14;
export const InputDiscreteLanePriority: LanePriority = 13;

const InputContinuousHydrationLanePriority: LanePriority = 12;
const InputContinuousLanePriority: LanePriority = 11;

const DefaultHydrationLanePriority: LanePriority = 10;
const DefaultLanePriority: LanePriority = 9;

const TransitionShortHydrationLanePriority: LanePriority = 8;
export const TransitionShortLanePriority: LanePriority = 7;

const TransitionLongHydrationLanePriority: LanePriority = 6;
export const TransitionLongLanePriority: LanePriority = 5;

const SelectiveHydrationLanePriority: LanePriority = 4;

const IdleHydrationLanePriority: LanePriority = 3;
const IdleLanePriority: LanePriority = 2;

const OffscreenLanePriority: LanePriority = 1;

export const NoLanePriority: LanePriority = 0;

const TotalLanes = 31;

export const NoLanes: Lanes = /*                        */ 0b0000000000000000000000000000000;
export const NoLane: Lane = /*                          */ 0b0000000000000000000000000000000;

export const SyncLane: Lane = /*                        */ 0b0000000000000000000000000000001;
const SyncUpdateRangeEnd = 1;
export const SyncBatchedLane: Lane = /*                 */ 0b0000000000000000000000000000010;
const SyncBatchedUpdateRangeEnd = 2;

export const InputDiscreteHydrationLane: Lane = /*      */ 0b0000000000000000000000000000100;
const InputDiscreteLanes: Lanes = /*                    */ 0b0000000000000000000000000011100;
const InputDiscreteUpdateRangeStart = 3;
const InputDiscreteUpdateRangeEnd = 5;

const InputContinuousHydrationLane: Lane = /*           */ 0b0000000000000000000000000100000;
const InputContinuousLanes: Lanes = /*                  */ 0b0000000000000000000000011100000;
const InputContinuousUpdateRangeStart = 6;
const InputContinuousUpdateRangeEnd = 8;

export const DefaultHydrationLane: Lane = /*            */ 0b0000000000000000000000100000000;
const DefaultLanes: Lanes = /*                          */ 0b0000000000000000011111100000000;
const DefaultUpdateRangeStart = 9;
const DefaultUpdateRangeEnd = 14;

const TransitionShortHydrationLane: Lane = /*           */ 0b0000000000000000100000000000000;
const TransitionShortLanes: Lanes = /*                  */ 0b0000000000011111100000000000000;
const TransitionShortUpdateRangeStart = 15;
const TransitionShortUpdateRangeEnd = 20;

const TransitionLongHydrationLane: Lane = /*            */ 0b0000000000100000000000000000000;
const TransitionLongLanes: Lanes = /*                   */ 0b0000011111100000000000000000000;
const TransitionLongUpdateRangeStart = 21;
const TransitionLongUpdateRangeEnd = 26;

export const SelectiveHydrationLane: Lane = /*          */ 0b0000110000000000000000000000000;
const SelectiveHydrationRangeEnd = 27;

// Includes all non-Idle updates
const UpdateRangeEnd = 27;
const NonIdleLanes = /*                                 */ 0b0000111111111111111111111111111;

export const IdleHydrationLane: Lane = /*               */ 0b0001000000000000000000000000000;
const IdleLanes: Lanes = /*                             */ 0b0111000000000000000000000000000;
const IdleUpdateRangeStart = 28;
const IdleUpdateRangeEnd = 30;

export const OffscreenLane: Lane = /*                   */ 0b1000000000000000000000000000000;

export const NoTimestamp = -1;

// "Registers" used to "return" multiple values
// Used by getHighestPriorityLanes and getNextLanes:
let return_highestLanePriority: LanePriority = DefaultLanePriority;
let return_updateRangeEnd: number = -1;

/**
 * 找到最高优先级
 */
function getHighestPriorityLanes(lanes: Lanes | Lane): Lanes {
    if ((SyncLane & lanes) !== NoLanes) {
        return_highestLanePriority = SyncBatchedLanePriority
        return_updateRangeEnd = SyncUpdateRangeEnd
        return SyncLane
    }
    if ((SyncBatchedLane & lanes) !== NoLanes) {
        return_highestLanePriority = SyncBatchedLanePriority
        return_updateRangeEnd = SyncBatchedUpdateRangeEnd
        return SyncBatchedLane
    }
    const inputDiscreteLanes = InputDiscreteLanes & lanes
    if (inputDiscreteLanes !== NoLanes) {
        if (inputDiscreteLanes & InputDiscreteHydrationLane) {

        } else {

        }
    }
}

/**
 * 检测 subset 是不是 set 的子集
 * @param set 
 * @param subset 
 */
export function isSubsetOfLanes(set: Lanes, subset: Lanes | Lane) {
    return (set & subset) === subset;
}

export function mergeLanes(a: Lanes | Lane, b: Lanes | Lane): Lanes {
    return a | b
}