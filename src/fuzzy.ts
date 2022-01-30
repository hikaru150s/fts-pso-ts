export class FuzzyTriangleGate {
    public get median() {
        return this.mid;
    }

    public constructor(
        private min: number,
        private mid: number,
        private max: number,
    ) { }

    public degree(value: number) {
        return value <= this.min || value >= this.max ? 0 : (
            this.min < value && value <= this.mid ? (
                (value - this.min) / (this.mid - this.min)
            ) : (
                (this.max - value) / (this.max - this.mid)
            )
        );
    }
}
