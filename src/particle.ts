import { FitFuncDelegate, SelectorFuncDelegate } from "./utils";

interface ParticelOptions<TFitResult = any> {
    min: number;
    max: number;
    weight: number;
    selfConfidence?: number;
    fitFn: FitFuncDelegate<TFitResult>;
    selectorFn: SelectorFuncDelegate<TFitResult>
}

export class Particle<TFitResult = any> {
    private _positions: number[];
    private _velocities: number[];
    private _bestPositionIndex: number;
    private _fittingResults: TFitResult[];
    private _fitFn: FitFuncDelegate<TFitResult>;
    private _selectFn: SelectorFuncDelegate<TFitResult>;
    private _selfConfidence: number;
    private _weight: number;

    public get bestPosition() {
        return this._positions[this._bestPositionIndex];
    }

    public get bestFitResult() {
        return this._fittingResults[this._bestPositionIndex];
    }

    constructor(options: ParticelOptions<TFitResult>) {
        this._fitFn = options.fitFn;
        this._selectFn = options.selectorFn;
        this._velocities = [options.min + (Math.random() * (options.max - options.min))];
        this._positions = [options.min + (Math.random() * (options.max - options.min))];
        this._selfConfidence = options.selfConfidence || Math.random();
        this._bestPositionIndex = 0;
        const firstFit = this.fit(this._positions[0]);
        this._fittingResults = [firstFit];
        this._weight = options.weight;
    }

    private fit(position: number) {
        return this._fitFn.call(this, position);
    }

    private select() {
        return this._selectFn.call(this, this._fittingResults);
    }

    public update(swarmConfidence: number, globalBest: number) {
        const latestVelocity = this._velocities[this._velocities.length - 1];
        const latestPosition = this._positions[this._positions.length - 1];
        const localBest = this._positions[this._bestPositionIndex];
        const next = (this._weight * latestVelocity) + (this._selfConfidence * Math.random() * (localBest - latestPosition)) + (swarmConfidence * Math.random() * (globalBest - latestPosition));
        this._velocities.push(next);
        const nextPosition = latestPosition + next;
        this._positions.push(nextPosition);
        const nextFit = this.fit(nextPosition);
        this._fittingResults.push(nextFit);
        this._bestPositionIndex = this.select();
    }
}
