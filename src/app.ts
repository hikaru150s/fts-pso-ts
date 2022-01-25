import { FTS } from './FTS';
import { KeyValuePair } from './types';

async function main() {
    const dataset: Array<KeyValuePair<number, number>> = [
        { key: 2008, value: 104 },
        { key: 2009, value: 173 },
        { key: 2010, value: 39 },
        { key: 2011, value: 47 },
        { key: 2012, value: 29 },
        { key: 2013, value: 48 },
        { key: 2014, value: 41 },
        { key: 2015, value: 66 },
        { key: 2016, value: 46 },
        { key: 2017, value: 29 },
        { key: 2018, value: 31 },
    ];
    const engine = new FTS(dataset, {
        minMargin: 9,
        maxMargin: 27,
        interval: 10,
    });
    engine.train();
    console.table(engine.test({ viewComparison: true }));
}

main().catch(e => {
    console.trace(e);
});
