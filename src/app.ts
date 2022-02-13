import { FTS } from './FTS';
import { Swarm } from './swarm';
import { KeyValuePair } from './types';
import { averageForecastingErrorRate, meanSquaredError } from './utils';

async function main() {
    const dataset: Array<KeyValuePair<string, number>> = [
        { key: '2016-Januari', value: 1525945 },
        { key: '2016-Februari', value: 1526174 },
        { key: '2016-Maret', value: 1528229 },
        { key: '2016-April', value: 1527213 },
        { key: '2016-Mei', value: 1530175 },
        { key: '2016-Juni', value: 1529990 },
        { key: '2016-Juli', value: 1531731 },
        { key: '2016-Agustus', value: 1532102 },
        { key: '2016-September', value: 1532000 },
        { key: '2016-Oktober', value: 1534673 },
        { key: '2016-November', value: 1535980 },
        { key: '2016-Desember', value: 1555980 },
        { key: '2017-Januari', value: 1559132 },
        { key: '2017-Februari', value: 1562540 },
        { key: '2017-Maret', value: 1567909 },
        { key: '2017-April', value: 1570187 },
        { key: '2017-Mei', value: 1585009 },
        { key: '2017-Juni', value: 1593840 },
        { key: '2017-Juli', value: 1594601 },
        { key: '2017-Agustus', value: 1590321 },
        { key: '2017-September', value: 1585582 },
        { key: '2017-Oktober', value: 1587119 },
        { key: '2017-November', value: 1579000 },
        { key: '2017-Desember', value: 1573898 },
        { key: '2018-Januari', value: 1578689 },
        { key: '2018-Februari', value: 1575221 },
        { key: '2018-Maret', value: 1579991 },
        { key: '2018-April', value: 1574185 },
        { key: '2018-Mei', value: 1577540 },
        { key: '2018-Juni', value: 1580312 },
        { key: '2018-Juli', value: 1583221 },
        { key: '2018-Agustus', value: 1588139 },
        { key: '2018-September', value: 1589003 },
        { key: '2018-Oktober', value: 1587841 },
        { key: '2018-November', value: 1589187 },
        { key: '2018-Desember', value: 1592248 },
        { key: '2019-Januari', value: 1621641 },
        { key: '2019-Februari', value: 1618967 },
        { key: '2019-Maret', value: 1620082 },
        { key: '2019-April', value: 1622219 },
        { key: '2019-Mei', value: 1617298 },
        { key: '2019-Juni', value: 1615658 },
        { key: '2019-Juli', value: 1613935 },
        { key: '2019-Agustus', value: 1611112 },
        { key: '2019-September', value: 1613923 },
        { key: '2019-Oktober', value: 1616256 },
        { key: '2019-November', value: 1616990 },
        { key: '2019-Desember', value: 1619533 },
        { key: '2020-Januari', value: 1623146 },
        { key: '2020-Februari', value: 1628435 },
        { key: '2020-Maret', value: 1626213 },
        { key: '2020-April', value: 1632645 },
        { key: '2020-Mei', value: 1637908 },
        { key: '2020-Juni', value: 1641668 },
        { key: '2020-Juli', value: 1645758 },
        { key: '2020-Agustus', value: 1642932 },
        { key: '2020-September', value: 1659174 },
        { key: '2020-Oktober', value: 1667214 },
        { key: '2020-November', value: 1665546 },
        { key: '2020-Desember', value: 1668164 },
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
    const singleResult = engine.test();
    const forecasted = singleResult.slice(0, singleResult.length - 1).map(v => v.predicted);
    const actual = singleResult.slice(1, singleResult.length).map(v => v.value);
    const mse = meanSquaredError(actual, forecasted);
    const afer = averageForecastingErrorRate(actual, forecasted);
    console.table(singleResult);
    console.log({ mse, afer });

    const swarm = new Swarm<{ mse: number; afer: number; }>({
        spaces: { min: 10, max: 1000 },
        weight: 0.1,
        maxIteration: 10000,
        particleCount: 100,
        swarmConfidence: 2,
        selfConfidence: 2,
        fitnessFunction: (n) => {
            const subFts = new FTS(dataset, {
                minMargin: minBorder,
                maxMargin: maxBorder,
                interval: ((max * 1.1) - (min * 0.9)) / Math.abs(n),
            });
            subFts.train();
            const subResult = subFts.test();
            const subForecasted = subResult.slice(0, subResult.length - 1).map(v => v.predicted);
            const subActual = subResult.slice(1, singleResult.length).map(v => v.value);
            return {
                mse: meanSquaredError(subActual, subForecasted),
                afer: averageForecastingErrorRate(subActual, subForecasted),
            };
        },
        selectorFunction: (results) => {
            let bestIndex = 0;
            for (let i = 1; i < results.length; i++) {
                if (results[i].mse < results[bestIndex].mse || results[i].afer < results[bestIndex].afer) {
                    bestIndex = i;
                }
            }
            return bestIndex;
        },
        stopCriteria: (n) => n.mse <= 10 || Math.abs(n.afer) <= 0.000001,
    });
    const lastIteration = swarm.optimize();
    console.log('Best interval count:', swarm.bestPosition);
    console.log('Iteration passed:', lastIteration);
    const optimizedEngine = new FTS(dataset, {
        minMargin: minBorder,
        maxMargin: maxBorder,
        interval: ((max * 1.1) - (min * 0.9)) / swarm.bestPosition,
    });
    optimizedEngine.train();
    const optimizedResult = optimizedEngine.test();
    const optimizedForecast = optimizedResult.slice(0, optimizedResult.length - 1).map(v => v.predicted);
    const optimizedActual = optimizedResult.slice(1, optimizedResult.length).map(v => v.value);
    console.table(optimizedResult);
    console.log({
        mse: meanSquaredError(optimizedActual, optimizedForecast),
        afer: averageForecastingErrorRate(optimizedActual, optimizedForecast),
    });
}

main().catch(e => {
    console.trace(e);
});
