export interface KeyValuePair<TKey, TValue> {
    key: TKey;
    value: TValue;
}

export type FTSOptions = Partial<{
    minMargin: number;
    maxMargin: number;
    marginMultiplier: number;
    partitionCount: number;
    interval: number;
}>;

export type FTSTestOptions<TKey, TValue> = Partial<{
    dataset: Array<KeyValuePair<TKey, TValue>>;
    viewComparison: boolean;
}>