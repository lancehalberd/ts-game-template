import { averageTravelDistance } from 'app/gameConstants';
import { getOreByType } from 'app/state';

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
			const newCell: MiningCell = {
				durability: miningDifficulty,
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
        cost: targetValue * (0.9 + 0.2 * Math.random()) / 5,
        distance: averageTravelDistance * distanceDifficulty * (0.9 + 0.2 * Math.random()),
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
