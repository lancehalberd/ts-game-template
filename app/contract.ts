import { averageTravelDistance } from 'app/gameConstants';
import { getOreByType } from 'app/state';
import Random from 'app/utils/Random';

function getAllowedResources(targetContractValue: number): Array<string> {
    let ores;
    if (targetContractValue < 100000) {
        ores = ['iron']
    } else if (targetContractValue < 200000) {
        ores = ['iron', 'silver']
    } else if (targetContractValue < 300000) {
        ores = ['iron', 'silver', 'gold']
    } else if (targetContractValue < 400000) {
        ores = ['iron', 'silver', 'gold', 'platinum']
    } else if (targetContractValue < 600000) {
        ores = ['iron', 'silver', 'gold', 'platinum', 'diamond']
    } else {
        ores = ['iron', 'silver', 'gold', 'platinum', 'diamond', 'magicCrystal']
    }
    return ores
}

function cellHasResource(targetContractValue: number, relativeDepth: number): boolean {
    let minimumProbablity = 0.1;
    let valueCoefficient = targetContractValue/10000;
    let additionalProbability = Math.min(0.3, Math.pow(valueCoefficient, 0.45)/35) * relativeDepth;
    return Math.random() < minimumProbablity + additionalProbability;
}

function getResourceProbability(oreLength: number, depthThreshold: number): Array<number> {
    // Generic graph for resources appearing at different thresholds
    // depth threshold  0       1       2       3       4
    // iron             0.9     0.7     0.3     0.1     0
    // silver           0.1     0.2     0.4     0.3     0.2
    // gold             0       0.1     0.2     0.3     0.3
    // platinum         0       0       0.1     0.2     0.25
    // diamond          0       0       0       0.1     0.15
    // magicCrystal     0       0       0       0       0.1
    // if a resource is unavailable due to cost thresholds, its probability will be added to iron

    let probabilities = [
        [0.9, 0.7, 0.3, 0.1, 0],
        [0.1, 0.2, 0.4, 0.3, 0.2],
        [0  , 0.1, 0.2, 0.3, 0.3],
        [0  , 0  , 0.1, 0.2, 0.25],
        [0  , 0  , 0  , 0.1, 0.15],
        [0  , 0  , 0  , 0  , 0.1],
    ];
    let oreProbabilities = new Array(oreLength).fill(0)
    for (let ore = 0; ore < probabilities.length; ore++) {
        if (ore < oreLength) {
            oreProbabilities[ore] = probabilities[ore][depthThreshold];
        } else {
            oreProbabilities[0] += probabilities[ore][depthThreshold];
        }
    }
    return oreProbabilities
}

function determineCellResource(targetContractValue: number, relativeDepth: number): OreType {
    let ores = getAllowedResources(targetContractValue);
    let depthThreshold = Math.floor(5*relativeDepth);
    let probabilities = getResourceProbability(ores.length, depthThreshold);
    let rng = Math.random();
    for (let probabilityIndex = 0; probabilityIndex < probabilities.length; probabilityIndex++) {
        if (rng < probabilities[probabilityIndex]) {
            return <OreType>ores[probabilityIndex];
        } else {
            rng -= probabilities[probabilityIndex];
        }
    }
    // If somehow this broke just give them iron
    return 'iron'
}

function genResourceUnits(ore: OreType): number {
    switch (ore) {
        case "iron":
            return 15 + Math.floor(Math.random() * 300);
        case "silver":
            return 10 + Math.floor(Math.random() * 200);
        case "gold":
            return 7 + Math.floor(Math.random() * 140);
        case "platinum":
            return 4 + Math.floor(Math.random() * 100);
        case "diamond":
            return 3 + Math.floor(Math.random() * 70);
        case "magicCrystal":
            return 1 + Math.floor(Math.random() * 30);
    }
}

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

    const oreMapping = {
        'iron': getOreByType(state, 'iron'),
        'silver': getOreByType(state, 'silver'),
        'gold': getOreByType(state, 'gold'),
        'platinum': getOreByType(state, 'platinum'),
        'diamond': getOreByType(state, 'diamond'),
        'magicCrystal': getOreByType(state, 'magicCrystal')
    };

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
            if (cellHasResource(targetValue, percentDepth)) {
                newCell.resourceType = determineCellResource(targetValue, percentDepth);
                newCell.resourceUnits = genResourceUnits(newCell.resourceType);
                newCell.durability += oreMapping[newCell.resourceType].miningDurabilityPerUnit * newCell.resourceUnits;
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
        let targetValue = 100e3 * (i * 4 + 1);
        contracts[i] = generateContract(state, i, targetValue);
    }
    return contracts;
}
