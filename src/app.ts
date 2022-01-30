import { FTS } from './FTS';
import { KeyValuePair } from './types';

async function main() {
    const dataset: Array<KeyValuePair<number, number>> = [
        { key: 1971, value: 13055 },
        { key: 1972, value: 13563 },
        { key: 1973, value: 13867 },
        { key: 1974, value: 14696 },
        { key: 1975, value: 15460 },
        { key: 1976, value: 15311 },
        { key: 1977, value: 15603 },
        { key: 1978, value: 15861 },
        { key: 1979, value: 16807 },
        { key: 1980, value: 16919 },
        { key: 1981, value: 16388 },
        { key: 1982, value: 15433 },
        { key: 1983, value: 15497 },
        { key: 1984, value: 15145 },
        { key: 1985, value: 15163 },
        { key: 1986, value: 15984 },
        { key: 1987, value: 16859 },
        { key: 1988, value: 18150 },
        { key: 1989, value: 18970 },
        { key: 1990, value: 19328 },
        { key: 1991, value: 19337 },
        { key: 1992, value: 18876 },
    ];
    const min = Math.min(...dataset.map(v => v.value));
    const max = Math.max(...dataset.map(v => v.value));
    const minBorder = min * 0.1;
    const maxBorder = max * 0.1;
    const engine = new FTS(dataset, {
        minMargin: minBorder,
        maxMargin: maxBorder,
        interval: ((max * 1.1) - (min * 0.9)) / 10,
    });
    engine.train();
    console.table(engine.test({ viewComparison: true }));
}

main().catch(e => {
    console.trace(e);
});
