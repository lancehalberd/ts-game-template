import * as React from 'react';

interface Props {
    contract: Contract
    readonly?: boolean
    width?: number
    height?: number
}

const resourceColors: Record<OreType | FuelType, string> = {
    'uranium': '#a1a626',
    'fuelCells': '#a1ff9c',
    'tritium': '#1a8014',
    'magicFuel': 'purple',
    'iron': '#444',
    'silver': '#aaa',
    'gold': 'gold',
    'platinum': '#ddd',
    'diamond': '#82d3ff',
    'magicCrystal': 'red',
}

function drawAsteroid(canvas: HTMLCanvasElement, contract: Contract) {
    const rows = contract.grid.length, columns = contract.grid[0].length
    const cellSize = Math.floor(Math.min(20, Math.min(canvas.width / columns, canvas.height / rows)));
    const left = Math.floor((canvas.width - cellSize * columns) / 2);
    const top = Math.floor((canvas.height - cellSize * rows) / 2);
    const context = canvas.getContext('2d')!;
    const grid = contract.grid;
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.save();
        context.fillStyle = '#8a805a';
        context.translate(canvas.width / 2, canvas.height / 2);
        context.scale(cellSize * (columns + 2), cellSize * (rows + 2));
        context.beginPath();
        context.arc(
            0, 0,
            0.5,
            0, 2 * Math.PI
        );
        context.fill();
    context.restore();
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < columns; x++) {
            const cell = grid[y][x];
            if (!cell) {
                continue;
            }
            //context.fillStyle = '#7d511a';
            context.fillStyle = '#452d1b';
            const baseDurability = cell.durability - cell.resourceDurability;
            context.globalAlpha = Math.min(1, 0.3 + baseDurability / 400);
            context.fillRect(left + x * cellSize, top + y * cellSize, cellSize, cellSize);
            /*context.beginPath();
            context.arc(
                left + (x + 0.5) * cellSize, top + (y + 0.5) * cellSize,
                cellSize * 0.6,
                0, 2 * Math.PI
            );
            context.fill();*/
            context.globalAlpha = 1;
            /*if (cell.resourceType) {
                context.fillStyle = resourceColors[cell.resourceType];
                context.beginPath();
                context.arc(
                    left + (x +0.5) * cellSize, top + (y +0.5) * cellSize,
                    Math.max(1, cellSize / 2 * Math.min(1, (cell.resourceUnits || 0) / 100)),
                    0, 2 * Math.PI
                );
                context.fill();
            }*/
        }
    }
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < columns; x++) {
            const cell = grid[y][x];
            if (!cell) {
                continue;
            }
            if (cell.resourceType) {
                context.fillStyle = resourceColors[cell.resourceType];
                context.beginPath();
                context.arc(
                    left + (x +0.5) * cellSize, top + (y +0.5) * cellSize,
                    Math.max(1, cellSize / 2 * Math.min(1, (cell.resourceUnits || 0) / 100)),
                    0, 2 * Math.PI
                );
                context.fill();
            }
        }
    }
}

const AsteroidPane = ({
    contract,
    width = 400,
    height = 400,
}: Props) => {

    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    React.useEffect(() => {
        const canvas = canvasRef.current!;
        drawAsteroid(canvas, contract);
    }, [contract])

    return <canvas ref={canvasRef} width={ width } height={ height }/>
};

export default AsteroidPane;
