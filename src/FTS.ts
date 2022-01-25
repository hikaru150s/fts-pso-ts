import {
    FTSOptions,
    FTSTestOptions,
    KeyValuePair,
} from './types';

export class FTS<TKey, TValue extends number> {
    private _dataset: Array<KeyValuePair<TKey, TValue>>;
    private _minMargin: number;
    private _maxMargin: number;
    private _marginMultiplier: number;
    private _partitionInterval: number;
    private _partitionCount: number;
    private _partitionRef: Array<number>;
    private _ruleset: {
        [precedent: number]: Set<number>;
    };

    public get maxValue() {
        return Math.max(...this._dataset.map(v => v.value));
    }
    public get minValue() {
        return Math.min(...this._dataset.map(v => v.value));
    }
    public get lowerBound() {
        return this.minValue - this._minMargin;
    }
    public get upperBound() {
        return this.maxValue + this._maxMargin;
    }
    public get partitionCount() {
        return this._partitionCount;
    }
    public get partitionLength() {
        return this._partitionInterval;
    }

    constructor(dataset: Array<KeyValuePair<TKey, TValue>>, options?: FTSOptions) {
        this._dataset = dataset;
        this._marginMultiplier = options?.marginMultiplier || 0.1;
        this._minMargin = options?.minMargin || (this.minValue * this._marginMultiplier);
        this._maxMargin = options?.maxMargin || (this.maxValue * this._marginMultiplier);
        if (options?.interval) {
            this._partitionInterval = options.interval;
            this._partitionCount = Math.ceil((this.upperBound - this.lowerBound) / options.interval);
        } else {
            this._partitionCount = options?.partitionCount || 10;
            this._partitionInterval = (this.upperBound - this.lowerBound) / this._partitionCount;
        }
        this._partitionRef = new Array<number>();
        this._ruleset = {};
        for (let i = 0; i < this._partitionCount; i++) {
            const maxPoint = this.lowerBound + (this._partitionInterval * i);
            this._partitionRef.push(maxPoint);
            this._ruleset[i] = new Set<number>();
        }
        const _fuzzySet = new Array<number>();
        for (let i = 1; i < this.partitionCount; i++) {
            
        }
    }

    public train() {
        const generatedPattern = this._dataset.map(v => {
            const cap = this._partitionRef.findIndex(x => x > v.value);
            return (cap === -1 ? this._partitionRef.length : cap) - (cap === 0 ? 0 : 1);
        });
        for (let i = 1; i < generatedPattern.length; i++) {
            this._ruleset[i - 1].add(generatedPattern[i]);
        }
    }

    public test(options?: FTSTestOptions<TKey, TValue>) {
        const baseData = options?.dataset || this._dataset;
        const predicted = baseData.map(v => {
            const { key, value } = v;
            const cap = this._partitionRef.findIndex(x => x > value);
            const partitionIndex = (cap === -1 ? this._partitionRef.length : cap) - (cap === 0 ? 0 : 1);
            const partitionConsequent = (this._ruleset[partitionIndex] || new Set<number>());
            const predictedValue = partitionConsequent.size === 0 ?
                (this._partitionRef[partitionIndex] + ((this._partitionRef[cap] - this._partitionRef[partitionIndex]) / 2)) :
                ([...partitionConsequent].map(x => this._partitionRef[x]).reduce((p, c) => p + c, 0) / partitionConsequent.size);
            return {
                key,
                value: options?.viewComparison ? value : predictedValue,
                predicted: options?.viewComparison ? predictedValue : undefined,
            };
        });
        return predicted;
    }
}
