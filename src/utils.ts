function baseLookup(interval: number) {
    return interval <= 0.1 ? 0.1 : (10 ** Math.ceil(Math.log10(interval) - 1));
}

export function averageInterval(dataset: number[]) {
    const range = dataset.map((v, i, a) => i === 0 ? null : Math.abs(v - a[i - 1])).filter(v => v !== null) as number[];
    const rangeAverage = range.reduce((p, c) => p + c, 0) / range.length;
    const halfAverage = rangeAverage / 2;
    return baseLookup(halfAverage);
}

export function meanSquaredError(actual: number[], forecast: number[]) {
    if (actual.length !== forecast.length) {
        throw new RangeError('Actual data and forecast data has different length');
    }
    return actual.map((v, i) => (v - forecast[i]) ** 2).reduce((p, c) => p + c, 0) / actual.length;
}

export function averageForecastingErrorRate(actual: number[], forecast: number[]) {
    if (actual.length !== forecast.length) {
        throw new RangeError('Actual data and forecast data has different length');
    }
    return actual.map((v, i) => Math.abs(v - forecast[i]) / v).reduce((p, c) => p + c, 0) / actual.length;
}
