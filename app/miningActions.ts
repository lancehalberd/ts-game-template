import { gainResource, getToolFromStorage } from 'app/state';

function requireAtContract(state: State) {
	const contract = state.currentContract;
	if (!contract || state.atStation) {
		throw { errorType: 'notMining', errorMessage: `
			You must be at an asteroid to mine.
		`};
	}
	const ship = state.currentShip;
	if (!ship) {
		throw { errorType: 'noShip', errorMessage: `
			You shouldn't be at an asteroid without a ship.
			This is a bug.
		`};
	}
	return {contract, ship};
}



export function getStationApi(state: State) {
	return {
		dig(x: number, y: number, toolType: ToolType) {
			const { contract, ship } = requireAtContract(state);
			const cell = contract.grid[y][x];
			if (!cell?.durability) {
				throw { errorType: 'emptyCell', errorMessage: `
					There is nothing to dig at ${x},${y}
				`};
			}
			const tool = getToolFromStorage(state, toolType, ship);
			tool.remainingUses--;
			const p = Math.min(1, tool.miningPower / cell.durability);
			if (cell.resourceType && cell.resourceUnits && cell.resourceUnits > 0) {
				gainResource(state, cell.resourceType, cell.resourceUnits * p, contract);
				cell.resourceUnits -= cell.resourceUnits * p;
			}
			cell.durability -= tool.miningPower;
		},
	};
}
