export const asteroidSizes: Array<AsteroidSize> = [
    {
        // small
        "costMultiplier": 1,
        "sizeCoefficient": 10
    },{
        // medium
        "costMultiplier": 2.5,
        "sizeCoefficient": 25,
    },{
        // large
        "costMultiplier": 7,
        "sizeCoefficient": 50
    }
];

const ironCompositions: AsteroidComposition[] = [{
    "probability": 0.7,
    "approximate_cost": 10000,
    "resources": {
        "iron": 0.1
    }
},{
    "probability": 0.2,
    "approximate_cost": 25000,
    "resources": {
        "iron": 0.25
    }
},{
    "probability": 0.08,
    "approximate_cost": 35000,
    "resources": {
        "iron": 0.4
    }
},{
    "probability": 0.02,
    "approximate_cost": 50000,
    "resources": {
        "iron": 0.85
    }
}];

const silverCompositions: AsteroidComposition[] = [{
    "probability": 0.75,
    "approximate_cost": 32000,
    "resources": {
        "silver": 0.05,
        "iron": 0.15
    }
},{
    "probability": 0.17,
    "approximate_cost": 63000,
    "resources": {
        "silver": 0.15,
        "iron": 0.15
    }
},{
    "probability": 0.06,
    "approximate_cost": 97000,
    "resources": {
        "silver": 0.3,
        "iron": 0.15
    }
},{
    "probability": 0.02,
    "approximate_cost": 150000,
    "resources": {
        "silver": 0.75
    }
}];

const goldCompositions: AsteroidComposition[] = [{
        "probability": 0.75,
        "approximate_cost": 55000,
        "resources": {
            "gold": 0.03,
            "silver": 0.10,
            "iron": 0.15
        }
    },{
        "probability": 0.17,
        "approximate_cost": 113000,
        "resources": {
            "gold": 0.15,
            "silver": 0.10,
            "iron": 0.10
        }
    },{
        "probability": 0.06,
        "approximate_cost": 193000,
        "resources": {
            "gold": 0.28,
            "silver": 0.05,
            "iron": 0.10
        }
    },{
        "probability": 0.02,
        "approximate_cost": 283000,
        "resources": {
            "gold": 0.75,
        }
    }];

const platinumCompositions: AsteroidComposition[] = [{
    "probability": 0.80,
    "approximate_cost": 95000,
    "resources": {
        "platinum": 0.03,
        "gold": 0.03,
        "silver": 0.05,
        "iron": 0.15
    }
},{
    "probability": 0.15,
    "approximate_cost": 216000,
    "resources": {
        "platinum": 0.09,
        "gold": 0.08,
        "silver": 0.11,
        "iron": 0.22
    }
},{
    "probability": 0.04,
    "approximate_cost": 537000,
    "resources": {
        "platinum": 0.32,
        "gold": 0.28,
        "silver": 0.10,
        "iron": 0.10
    }
},{
    "probability": 0.01,
    "approximate_cost": 840000,
    "resources": {
        "platinum": 0.63,
        "gold": 0.30,
    }
}];

const diamondCompositions: AsteroidComposition[] = [{
    "probability": 0.80,
    "approximate_cost": 151000,
    "resources": {
        "diamond": 0.02,
        "platinum": 0.03,
        "gold": 0.03,
        "silver": 0.05,
        "iron": 0.15
    }
},{
    "probability": 0.17,
    "approximate_cost": 295000,
    "resources": {
        "diamond": 0.05,
        "platinum": 0.09,
        "gold": 0.08,
        "silver": 0.11,
        "iron": 0.22
    }
},{
    "probability": 0.02,
    "approximate_cost": 978000,
    "resources": {
        "diamond": 0.35,
        "platinum": 0.30,
        "gold": 0.25,
        "silver": 0.08,
        "iron": 0.08
    }
},{
    "probability": 0.01,
    "approximate_cost": 1744000,
    "resources": {
        "diamond": 0.55,
        "platinum": 0.33,
        "gold": 0.20,
    }
}];

const magicComposition: AsteroidComposition[] = [{
    "probability": 0.80,
    "approximate_cost": 134000,
    "resources": {
        "magicCrystal": 0.02,
        "diamond": 0.04,
        "platinum": 0.05,
        "gold": 0.06,
        "silver": 0.08,
        "iron": 0.20
    }
},{
    "probability": 0.17,
    "approximate_cost": 221000,
    "resources": {
        "magicCrystal": 0.05,
        "diamond": 0.07,
        "platinum": 0.11,
        "gold": 0.12,
        "silver": 0.10,
        "iron": 0.22
    }
},{
    "probability": 0.02,
    "approximate_cost": 1389000,
    "resources": {
        "magicCrystal": 0.25,
        "diamond": 0.35,
        "platinum": 0.30,
        "gold": 0.25,
        "silver": 0.08,
        "iron": 0.08
    }
},{
    "probability": 0.01,
    "approximate_cost": 2755000,
    "resources": {
        "magicCrystal": 0.45,
        "diamond": 0.35,
        "platinum": 0.4
    }
}];

export let asteroidCompositions: Map<string, AsteroidComposition[]> = new Map<string, AsteroidComposition[]>();
asteroidCompositions.set("iron_asteroid", ironCompositions);
asteroidCompositions.set("silver_asteroid", silverCompositions);
asteroidCompositions.set("gold_asteroid", goldCompositions);
asteroidCompositions.set("platinum_asteroid", platinumCompositions);
asteroidCompositions.set("diamond_asteroid", diamondCompositions);
asteroidCompositions.set("magic_asteroid", magicComposition);
