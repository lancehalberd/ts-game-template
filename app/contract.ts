import { averageTravelDistance } from 'app/gameConstants';
import { getOreByType } from 'app/state';
import Random from 'app/utils/Random';

function generateContract(state: State, id : number, targetValue: number): Contract {
    const baseDiameter = 10 * (Math.log(targetValue) / Math.log(10) - 4) ;

    let xRadius = Math.floor(5 + Math.random() * baseDiameter);
    let yRadius = Math.floor(5 + Math.random() * baseDiameter);
    // yRadius is at least 10
    yRadius = Math.max(10, yRadius);
    // xRadius is in [yRadius, 5 * yRadius]
    xRadius = Math.max(yRadius, Math.min(5 * yRadius, xRadius));
    let grid: (MiningCell | null)[][] = [];

    const difficultyModifier = Math.max(1, (5 + baseDiameter / 2) / yRadius);
    let distanceDifficulty = 1, miningDifficulty = 1;
    if (difficultyModifier >= 1) {
        distanceDifficulty = Math.max(1, 2 * Math.random() * difficultyModifier);
        miningDifficulty = Math.max(1, 2 * difficultyModifier - distanceDifficulty);
    } else {
        const easyModifier = 1 / difficultyModifier;
        // easyModifier = A + B and distanceDifficulty = 1 / A and miningDifficulty = 1 /B
        distanceDifficulty = 1 / Math.max(1, 2 * Math.random() * easyModifier);
        miningDifficulty = 1 / Math.max(1, 2 * easyModifier - 1 / distanceDifficulty);
    }
    const rows = yRadius * 2;
    const columns = xRadius * 2 + 1;

    const iron = getOreByType(state, 'iron');

    const densityDistribution = Random.element([
        [0.5, 2],
        [5, 0.1, 0.1, 1, 1, 1],
        [3, 0.5, 0.5, 3, 0.5],
    ]);

    for (let i = 0; i < rows; i++) {
        grid[i] = [];
        const y = yRadius - 0.5 - i;
        const firstColumn = Math.floor(xRadius - Math.sqrt(1 - y * y / yRadius / yRadius) * xRadius);
        const lastColumn = columns - 1 - firstColumn;
        for (let j = 0; j < columns; j++) {
            if (j < firstColumn || j > lastColumn) {
                grid[i][j] = null;
                continue;
            }
            const x = xRadius - 0.5 - j;
            const distanceFromCore = Math.sqrt(y * y + x * x);
            const theta = Math.atan2(y, x);
            const surfaceX = xRadius * Math.cos(theta);
            const surfaceY = yRadius * Math.sin(theta);
            const surfaceDistance = Math.sqrt(surfaceY * surfaceY + surfaceX * surfaceX);
            const percentDepth = Math.max(0, Math.min(1, 1 - distanceFromCore / surfaceDistance));
            const distributionIndex = percentDepth * densityDistribution.length;
            const leftDensity = densityDistribution[distributionIndex | 0];
            const rightDensity = densityDistribution[Math.min(distributionIndex | 0 + 1, densityDistribution.length - 1)];
            const densityCoefficient = leftDensity * (1 - distributionIndex % 1) + rightDensity * (distributionIndex % 1);
            const newCell: MiningCell = {
                durability: 100 * densityCoefficient * miningDifficulty,
            };
            if (Math.random() < 0.1) {
                newCell.resourceType = 'iron';
                const units = 10 + Math.floor(Math.random() * 200);
                newCell.resourceUnits = units;
                newCell.durability += iron.miningDurabilityPerUnit * units;
            }
            grid[i][j] = newCell;
        }
    }

    return {
        id,
        grid,
        cost: Math.floor(targetValue * (0.9 + 0.2 * Math.random()) / 5),
        distance: Math.floor(averageTravelDistance * distanceDifficulty * (0.9 + 0.2 * Math.random())),
        cargo: [],
        // This should be practically infinite.
        cargoSpace: 1e12,
    };
}

export function generateContractList(state: State, amount: number): Contract[] {
    const contracts: Contract[] = [];
    for (let i = 0; i < amount; i++) {
        contracts[i] = generateContract(state, i, 100e3 * (i * 4 + 1));
    }
    return contracts;
}
