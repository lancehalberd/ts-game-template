import { getGetActions } from 'app/getActions';
import { getMiningApi } from 'app/miningActions';
import { getStationApi } from 'app/stationActions';

export {};

declare global {
    interface Window {
        state?: State
        gameApi?: GameApi
        refreshReact?: (gameApi: GameApi) => void
    }

    interface IGameContext {
        gameState: State;
        gameApi: GameApi;
        setGameState: React.Dispatch<React.SetStateAction<State>>;
    }

    type GameApi = {
        // This will only be available on a simulation.
        state?: State
        // This returns a copy of the game api for simulation only.
        // Scripts can use this to test the outcome of a complex course of action.
        // And UI elements can use this for previewing results of single actions.
        simulate: () => GameApi
    } & ReturnType<typeof getGetActions>
      & ReturnType<typeof getMiningApi>
      & ReturnType<typeof getStationApi>;

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
    // CargoStorage
    interface CargoStorage {
        cargoSpace: number
        cargo: Cargo[]
    }
    interface Station extends CargoStorage {
        availableContracts: Contract[]
        ships: Ship[]
    }

    // All Cargo definitions
    interface BaseCargo {
        readonly type: string
        readonly cargoType: string
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
        cargoType: FuelType
        readonly name: string
        readonly unitEnergy: number
    }
    type OreType = 'iron' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'magicCrystal';
    interface Ore extends Resource {
        type: 'ore'
        cargoType: OreType
        readonly name: string
    }
    type OreDefinition = Readonly<Ore>;
    type ToolType = 'basicHarvestingDrill' | 'basicDiggingDrill' | 'basicDiggingLaser' |
        'advancedHarvestingDrill' | 'advancedDiggingDrill' | 'advancedDiggingLaser' |
        'magicHarvestingDrill' | 'magicDiggingDrill' | 'magicDiggingLaser' |
        'smallExplosives' | 'largeExplosives';
    interface DiggingTool extends BaseCargo {
        type: 'tool'
        cargoType: ToolType
        readonly name: string
        // Number.POSITIVE_INFINITY can be used indefinitely.
        remainingUses: number
        // Number.POSITIVE_INFINITY destroys any cell.
        readonly miningPower: number
        // 0-1, % resources harvested while mining.
        readonly miningEfficiency: number
        // Can be 0 for tools that don't use energy.
        readonly energyPerUse: number
    }
    type DiggingToolDefinition = Readonly<DiggingTool>;
    type CargoType = ToolType | FuelType | OreType;
    type Cargo = DiggingTool | Fuel | Ore

    type ShipType = 'basicSmallShip' | 'basicShip' | 'basicBigShip'
        | 'advancedSmallShip' | 'advancedShip' | 'advancedBigShip'
        | 'magicSmallShip' | 'magicShip' | 'magicBigShip'
    interface Ship extends CargoStorage {
        readonly shipType: ShipType
        readonly name: string
        readonly fuelType: FuelType
        readonly mass: number
        readonly cost: number
        isRented: boolean
        isOwned: boolean
        returnTime?: number
    }
    type ShipDefinition = Readonly<Ship>;

    interface Contract extends CargoStorage {
        id: number
        grid: (MiningCell | null)[][]
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
