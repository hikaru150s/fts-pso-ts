import { FuzzyTriangleGate } from './fuzzy';
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
    private _partitionRef: Array<FuzzyTriangleGate>;
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
        this._partitionRef = new Array<FuzzyTriangleGate>();
        this._ruleset = {};
        for (let i = 0; i < this._partitionCount; i++) {
            const prevPoint = i === 0 ? 0 : (this.lowerBound + (this._partitionInterval * (i - 1)));
            const maxPoint = this.lowerBound + (this._partitionInterval * i);
            const nextPoint = this.lowerBound + (this._partitionInterval * (i + 1));
            this._partitionRef.push(new FuzzyTriangleGate(prevPoint, maxPoint, nextPoint));
            this._ruleset[i] = new Set<number>();
        }
        const _fuzzySet = new Array<number>();
        for (let i = 1; i < this.partitionCount; i++) {
            
        }
    }

    private nearestPartition(value: number) {
        const degrees = this._partitionRef.map(x => x.degree(value));
        const highestDegree = Math.max(...degrees);
        return degrees.findIndex(x => x === highestDegree);
    }

    public train() {
        const generatedPattern = this._dataset.map(v => this.nearestPartition(v.value));
        for (let i = 1; i < generatedPattern.length; i++) {
            const precedent = generatedPattern[i - 1];
            const consequent = generatedPattern[i];
            this._ruleset[precedent].add(consequent);
        }
    }

    public test(options?: FTSTestOptions<TKey, TValue>) {
        const baseData = options?.dataset || this._dataset;
        const predicted = baseData.map(({ key, value }) => {
            const partitionIndex = this.nearestPartition(value);
            const partitionConsequent = (this._ruleset[partitionIndex] || new Set<number>());
            const predictedValue = partitionConsequent.size === 0 ?
                (this._partitionRef[partitionIndex].median) :
                ([...partitionConsequent].map(x => this._partitionRef[x].median).reduce((p, c) => p + c, 0) / partitionConsequent.size);
            return {
                key,
                value: value,
                predicted: predictedValue,
            };
        });
        return predicted;
    }
}
