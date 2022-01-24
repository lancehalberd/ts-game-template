import { getStationApi } from 'app/stationActions';

export {};

declare global {
    interface Window { state?: State; gameApi?: GameApi }

    type GameApi = {
        getState(): State
    } & ReturnType<typeof getStationApi>

    interface State {
        debt: number
        credits: number
        creditLimit: number
        // in days
        time: number
        content: {
            readonly ships: readonly ShipDefinition[]
            readonly diggingTools: readonly DiggingToolDefinition[]
            readonly fuels: readonly Fuel[]
            readonly ores: readonly Ore[]
        }
        station: Station
        atStation: boolean
        currentContract?: Contract
        currentShip?: Ship
    }
    interface Station {
        availableContracts: Contract[]
        cargoSpace: number
        cargo: Cargo[]
        ships: Ship[]
    }

    // All Cargo definitions
    interface BaseCargo {
        // In credits per unit
        readonly unitCost: number
        // In kg per unit
        readonly unitMass: number
        // In liters per unit
        readonly unitVolume: number
        units: number
    }
    interface Resource extends BaseCargo {
        miningDurabilityPerUnit: number
    }
    type FuelType = 'uranium' | 'fuelCells' | 'tritium' | 'magicFuel';
    interface Fuel extends Resource {
        type: 'fuel'
        readonly name: string
        readonly fuelType: FuelType
        readonly unitEnergy: number
    }
    type OreType = 'iron' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'magicCrystal';
    interface Ore extends Resource {
        type: 'ore'
        readonly name: string
        readonly oreType: OreType
    }
    type OreDefinition = Readonly<Ore>;
    type ToolType = 'basicHarvestingDrill' | 'basicDiggingDrill' | 'basicDiggingLaser' |
        'advancedHarvestingDrill' | 'advancedDiggingDrill' | 'advancedDiggingLaser' |
        'magicHarvestingDrill' | 'magicDiggingDrill' | 'magicDiggingLaser' |
        'smallExplosives' | 'largeExplosives';
    interface DiggingTool extends BaseCargo {
        type: 'tool'
        readonly name: string
        readonly toolType: ToolType
        // Number.POSITIVE_INFINITY can be used indefinitely.
        remainingUses: number
        // Number.POSITIVE_INFINITY destroys any cell.
        readonly miningerPower: number
        // 0-1, % resources harvested while mining.
        readonly miningEfficiency: number
        // Can be 0 for tools that don't use energy.
        readonly energyPerUse: number
    }
    type DiggingToolDefinition = Readonly<DiggingTool>;
    type Cargo = DiggingTool | Fuel | Ore

    type ShipType = 'basicSmallShip' | 'basicShip' | 'basicBigShip'
        | 'advancedSmallShip' | 'advancedShip' | 'advancedBigShip'
        | 'magicSmallShip' | 'magicShip' | 'magicBigShip'
    interface Ship {
        readonly shipType: ShipType
        readonly name: string
        readonly cargoSpace: number
        cargo: Cargo[]
        readonly fuelType: FuelType
        readonly mass: number
        readonly cost: number
        isRented: boolean
        isOwned: boolean
        returnTime?: number
    }
    type ShipDefinition = Readonly<Ship>;

    interface Contract {
        id: number
        grid: MiningCell[][]
        cost: number
        distance: number
    }

    interface MiningCell {
        durability: number
        resourceType?: FuelType | OreType
        resourceUnits?: number
        isRevealed?: boolean
    }

    // Action succeeded
    interface GameApiSuccess {
        success: true
        amount?: number
    }
    // Action was prevented, can be completed with `force` option
    interface GameApiWarning {
        warningType: 'spendingCredit' | 'lowFuel' | 'cargoNotEmpty' | 'multipleRentals'
        warningMessage: string
    }
    // Action was invalid
    interface GameApiError {
        errorType: 'creditExceeded' | 'duplicateShip' | 'invalidRequest'
        errorMessage: string
    }

    type GameApiResponse = GameApiSuccess | GameApiWarning | GameApiError;




    interface ExtraAnimationProperties {
        // The animation will loop unless this is explicitly set to false.
        loop?: boolean
        // Frame to start from after looping.
        loopFrame?: number
    }
    type FrameAnimation = {
        frames: Frame[]
        frameDuration: number
        duration: number
    } & ExtraAnimationProperties

    interface Rect {
        x: number
        y: number
        w: number
        h: number
    }
    interface FrameDimensions {
        w: number
        h: number
    }

    interface Frame extends Rect {
        image: HTMLCanvasElement | HTMLImageElement,
    }
}
