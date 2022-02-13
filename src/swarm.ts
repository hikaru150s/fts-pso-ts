import { Particle } from "./particle";
import { FitFuncDelegate, SelectorFuncDelegate, StopCriteria } from "./utils";

interface SwarmOption<TFit = any> {
    spaces: {
        min: number;
        max: number;
    };
    weight?: number;
    maxIteration: number;
    particleCount: number;
    swarmConfidence?: number;
    selfConfidence?: number;
    fitnessFunction: FitFuncDelegate<TFit>;
    selectorFunction: SelectorFuncDelegate<TFit>;
    stopCriteria: StopCriteria<TFit>;
}

export class Swarm<TFit = any> {
    private _maxIteration: number;
    private _particles: Particle<TFit>[];
    private _fitFn: FitFuncDelegate<TFit>;
    private _selectFn: SelectorFuncDelegate<TFit>;
    private _stopCriteria: StopCriteria<TFit>;
    private _bestFit: TFit;
    private _bestPosition: number;
    private _swarmConfidence: number;
    private _w: number;

    public get bestPosition() {
        return this._bestPosition;
    }

    public get bestFit() {
        return this._bestFit;
    }

    constructor(options: SwarmOption<TFit>) {
        if (options.weight && (options.weight >= 1 || options.weight <= 0)) {
            console.warn('Weight out of boundaries, generating random weight...');
        }
        this._w = options.weight && options.weight > 0 && options.weight < 1 ? options.weight : Math.random();
        this._maxIteration = options.maxIteration;
        this._fitFn = options.fitnessFunction;
        this._selectFn = options.selectorFunction;
        this._stopCriteria = options.stopCriteria;
        this._swarmConfidence = options.swarmConfidence || Math.random();
        this._particles = new Array<null>(options.particleCount).fill(null).map(() => new Particle<TFit>({
            min: options.spaces.min,
            max: options.spaces.max,
            fitFn: this._fitFn,
            selectorFn: this._selectFn,
            selfConfidence: options.selfConfidence,
            weight: this._w,
        }));
        const bestParticle = this._selectFn.call(this, this._particles.map(v => v.bestFitResult));
        this._bestFit = this._particles[bestParticle].bestFitResult;
        this._bestPosition = this._particles[bestParticle].bestPosition;
    }

    public optimize() {
        let stop = this._stopCriteria.call(this, this._bestFit);
        let currentIteration = 0;
        while (!stop && currentIteration < this._maxIteration) {
            for (const particle of this._particles) {
                particle.update(this._swarmConfidence, this._bestPosition);
            }
            const bestParticle = this._selectFn.call(this, this._particles.map(v => v.bestFitResult));
            this._bestFit = this._particles[bestParticle].bestFitResult;
            this._bestPosition = this._particles[bestParticle].bestPosition;
            stop = this._stopCriteria.call(this, this._bestFit);
            currentIteration += 1;
        }
        return currentIteration;
    }
}
