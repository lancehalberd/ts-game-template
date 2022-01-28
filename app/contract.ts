import { averageTravelDistance, maxCargoVolume } from 'app/gameConstants';
import {getFuelByType, getOreByType} from 'app/state';
import Random from 'app/utils/Random';
import { asteroidSizes, asteroidCompositions, fuelModifiers } from  'app/asteroid';

// function getAllowedResources(targetContractValue: number): Array<string> {
//     let ores;
//     if (targetContractValue < 100000) {
//         ores = ['iron']
//     } else if (targetContractValue < 200000) {
//         ores = ['iron', 'silver']
//     } else if (targetContractValue < 300000) {
//         ores = ['iron', 'silver', 'gold']
//     } else if (targetContractValue < 400000) {
//         ores = ['iron', 'silver', 'gold', 'platinum']
//     } else if (targetContractValue < 600000) {
//         ores = ['iron', 'silver', 'gold', 'platinum', 'diamond']
//     } else {
//         ores = ['iron', 'silver', 'gold', 'platinum', 'diamond', 'magicCrystal']
//     }
//     return ores
// }
// function cellHasResource(targetContractValue: number, relativeDepth: number): boolean {
//     let minimumProbablity = 0.1;
//     let valueCoefficient = targetContractValue/10000;
//     let additionalProbability = Math.min(0.3, Math.pow(valueCoefficient, 0.45)/35) * relativeDepth;
//     return Math.random() < minimumProbablity + additionalProbability;
// }
//
// function getResourceProbability(oreLength: number, depthThreshold: number): Array<number> {
//     // Generic graph for resources appearing at different thresholds
//     // depth threshold  0       1       2       3       4
//     // iron             0.9     0.7     0.3     0.1     0
//     // silver           0.1     0.2     0.4     0.3     0.2
//     // gold             0       0.1     0.2     0.3     0.3
//     // platinum         0       0       0.1     0.2     0.25
//     // diamond          0       0       0       0.1     0.15
//     // magicCrystal     0       0       0       0       0.1
//     // if a resource is unavailable due to cost thresholds, its probability will be added to iron
//
//     let probabilities = [
//         [0.9, 0.7, 0.3, 0.1, 0],
//         [0.1, 0.2, 0.4, 0.3, 0.2],
//         [0  , 0.1, 0.2, 0.3, 0.3],
//         [0  , 0  , 0.1, 0.2, 0.25],
//         [0  , 0  , 0  , 0.1, 0.15],
//         [0  , 0  , 0  , 0  , 0.1],
//     ];
//     let oreProbabilities = new Array(oreLength).fill(0)
//     for (let ore = 0; ore < probabilities.length; ore++) {
//         if (ore < oreLength) {
//             oreProbabilities[ore] = probabilities[ore][depthThreshold];
//         } else {
//             oreProbabilities[0] += probabilities[ore][depthThreshold];
//         }
//     }
//     return oreProbabilities
// }

function determineCellResource(asteroidType: AsteroidComposition, relativeDepth: number,
                               fuelMod: FuelResourceModifier|null): OreType|FuelType|null {
    const resources: Array<FuelType|OreType> = Object.keys(asteroidType.resources) as (FuelType|OreType)[];
    for (let resourceIndex = 0; resourceIndex < resources.length; resourceIndex++) {
        const resourceChance = asteroidType.resources[resources[resourceIndex]]!;
        if (asteroidType.resources && Math.random() < resourceChance * relativeDepth) {
            return <OreType> resources[resourceIndex]
        } else if (fuelMod && Math.random() < fuelMod.probability * resourceChance * Math.sqrt(relativeDepth)) {
            return fuelMod.type
        }
    }
    return null
}

function genResourceUnits(resource: OreType|FuelType): number {
    switch (resource) {
        case "iron":
            return 30 + Math.floor(Math.random() * 300);
        case "silver":
            return 20 + Math.floor(Math.random() * 200);
        case "gold":
            return 10 + Math.floor(Math.random() * 150);
        case "platinum":
            return 5 + Math.floor(Math.random() * 100);
        case "diamond":
            return 5 + Math.floor(Math.random() * 50);
        case "magicCrystal":
            return 1 + Math.floor(Math.random() * 30);
        case "uranium":
            return 7 + Math.floor(Math.random() * 140);
        case "fuelCells":
            return 4 + Math.floor(Math.random() * 100);
        case "tritium":
            return 3 + Math.floor(Math.random() * 70);
        case "magicFuel":
            return 1 + Math.floor(Math.random() * 30);
    }
}

function pickComposition(compositions: AsteroidComposition[]): AsteroidComposition {
    let probability = Math.random();
    for(let i = 0; i < compositions.length; i++) {
        if (probability < compositions[i].probability) {
            return compositions[i]
        } else {
            probability -= compositions[i].probability;
        }
    }
    return compositions[0]
}

function pickFuelResourceModifier(): FuelResourceModifier|null {
    const rng = Math.random();
    if (rng < 0.3) {
        const fuelOptions: string[] = Object.keys(fuelModifiers);
        let fuelIndex = 0;
        while (fuelIndex < fuelOptions.length - 1 && Math.random() < 0.4) {
            fuelIndex++;
        }
        return fuelModifiers[fuelOptions[fuelIndex]]
    }
    return null
}

/*
const mineralDistributions: [FuelType | OreType, number, number, number][][] = [
    [['gold', 0.05, 10, 40], ['silver', 0.05, 20, 80], ['iron', 0.1, 40, 200], ['uranium', 0.1, 40, 200]],
]
*/
function generateContract(state: State, id : number, targetValue: number, asteroidSize: AsteroidSize,
                          asteroidType: AsteroidComposition, fuelModifier: FuelResourceModifier|null): Contract {
    const baseDiameter = asteroidSize.sizeCoefficient * (Math.log(targetValue) / Math.log(100) - 2);

    let xRadius = Math.floor(5 + Math.random() * baseDiameter);
    let yRadius = Math.floor(5 + Math.random() * baseDiameter);
    // yRadius is at least 10
    yRadius = Math.max(asteroidSize.sizeCoefficient, yRadius);
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
        'magicCrystal': getOreByType(state, 'magicCrystal'),
        'uranium': getFuelByType(state, 'uranium'),
        'fuelCells': getFuelByType(state, 'fuelCells'),
        'tritium': getFuelByType(state, 'tritium'),
        'magicFuel': getFuelByType(state, 'magicFuel')
    };


    const densityDistribution = Random.element([
        [0.5, 2],
        [5, 0.1, 0.1, 1, 1, 1],
        [3, 0.5, 0.5, 3, 0.5],
    ]);

    //const mineralDistribution = Random.element(mineralDistributions);

    let cost = -20000;
    let totalVolume = 0;
    let spawnedFuel = false;
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
            const distributionIndex = percentDepth * (densityDistribution.length - 1);
            const leftDensity = densityDistribution[distributionIndex | 0];
            const rightDensity = densityDistribution[Math.min(distributionIndex | 0 + 1, densityDistribution.length - 1)];
            const densityCoefficient = leftDensity * (1 - distributionIndex % 1) + rightDensity * (distributionIndex % 1);
            const newCell: MiningCell = {
                durability: 100 * densityCoefficient * miningDifficulty,
                resourceDurability: 0,
            };
            let cellResource = determineCellResource(asteroidType, percentDepth, fuelModifier);
            if (cellResource) {
                if (oreMapping[cellResource].type === 'fuel') {
                    spawnedFuel = true;
                }
                newCell.resourceType = cellResource;
                newCell.resourceUnits = genResourceUnits(newCell.resourceType);
                cost += oreMapping[cellResource].unitCost * newCell.resourceUnits * 0.5 * ((1 - 0.6 * percentDepth) ** 2);
                totalVolume += newCell.resourceUnits;
                newCell.resourceDurability = oreMapping[newCell.resourceType].miningDurabilityPerUnit * newCell.resourceUnits;
                newCell.durability += newCell.resourceDurability;
            }
            /*for (const [cargoType, chance, min, max] of mineralDistribution) {
                if (Math.random() < chance) {
                    newCell.resourceType = cargoType;
                    const units = Random.range(min, max)
                    newCell.resourceUnits = units;
                    newCell.durability += iron.miningDurabilityPerUnit * units;
                }
            }*/
            grid[i][j] = newCell;
        }
    }
    //let cost = Math.floor(targetValue * (0.9 + 0.2 * Math.random()) / 5);
    // Apply the fuel prefix and cost modifier if fuel spawned somewhere.
    let fuelModifierPrefix: string = '';
    if (fuelModifier && spawnedFuel) {
        fuelModifierPrefix = fuelModifier.prefix;
    }
    if (totalVolume > maxCargoVolume) {
        cost *= maxCargoVolume / totalVolume;
    }

    return {
        id,
        name: `${fuelModifierPrefix} ${asteroidSize.prefix} ${asteroidType.name}`.trim(),
        grid,
        cost: Math.floor(Math.max(5000, cost)),
        distance: Math.floor(averageTravelDistance * distanceDifficulty * (0.9 + 0.2 * Math.random())),
        cargo: [],
        // This should be practically infinite.
        cargoSpace: 1e12,
    };
}

export function generateContractList(state: State, amount: number): Contract[] {
    const contracts: Contract[] = [];
    for (let i = 0; i < amount * 5; i++) {
        // effectively weighting asteroid sized to be 100:10:1 ratio for small to large asteroids
        let sizeIndex = 0;
        while (sizeIndex < asteroidSizes.length - 1 && Math.random() < 0.3) {
            sizeIndex++;
        }
        const size: AsteroidSize = asteroidSizes[sizeIndex];
        let compositionKeys = Array.from(asteroidCompositions.keys());
        let resourceIndex = Math.floor(Math.random() * compositionKeys.length);
        const compositions: AsteroidComposition[] = <AsteroidComposition[]> asteroidCompositions.get(compositionKeys[resourceIndex]);
        const composition: AsteroidComposition = pickComposition(compositions);
        const fuelModifier: FuelResourceModifier|null = pickFuelResourceModifier();
        // console.log(composition)
        contracts[i] = generateContract(state, i, composition.approximate_cost * 2 ** (resourceIndex + 1),
            size, composition, fuelModifier);
    }
    // Sort and return 1 in every 5 contracts so we get an interesting spread.
    contracts.sort((A, B) => A.cost - B.cost);
    return contracts.filter((contract, i) => (i % 5) === 0).map((contract, i) => ({
        ...contract,
        id: i,
    }));
}
