// js/buildings.js

// Defines all available building types in the game.
// 'unlocked' property will be set to true by the Tech Tree.
const buildingBlueprints = {
    // Energy Buildings
    basicSolarArray: {
        id: 'basicSolarArray',
        name: 'Basic Solar Array',
        description: 'Generates a small amount of Energy.',
        cost: { manufacturing: 25 }, // Cost in Material
        production: { energy: 1 },   // Produces 1 Energy/sec
        upkeep: { energy: 0.1 },     // Consumes 0.1 Energy/sec for maintenance
        unlocked: false, // Initially locked, unlocked by tech tree
        maxAllowed: 10, // Example: limit how many of this type can be built
    },
    advancedSolarArray: {
        id: 'advancedSolarArray',
        name: 'Advanced Solar Array',
        description: 'More efficient solar energy generation.',
        cost: { manufacturing: 75, coin: 50 },
        production: { energy: 5 },
        upkeep: { energy: 0.3 },
        unlocked: false,
        maxAllowed: 5,
    },
    fusionReactor: {
        id: 'fusionReactor',
        name: 'Fusion Reactor',
        description: 'Powerful energy source, but high upkeep.',
        cost: { manufacturing: 500, science: 100 }, // Costs Material and Research Data
        production: { energy: 50 },
        upkeep: { energy: 5 }, // High energy upkeep
        unlocked: false,
        maxAllowed: 2,
    },
    // Material Buildings
    basicFabricator: {
        id: 'basicFabricator',
        name: 'Basic Fabricator',
        description: 'Produces a small amount of Material.',
        cost: { manufacturing: 40 },
        production: { manufacturing: 0.5 },
        upkeep: { energy: 0.5 },
        unlocked: false,
        maxAllowed: 10,
    },
    automatedFabricator: {
        id: 'automatedFabricator',
        name: 'Automated Fabricator',
        description: 'Efficiently produces Material.',
        cost: { manufacturing: 150, coin: 75 },
        production: { manufacturing: 2 },
        upkeep: { energy: 1.5 },
        unlocked: false,
        maxAllowed: 5,
    },
    syntheticsLab: {
        id: 'syntheticsLab',
        name: 'Synthetics Lab',
        description: 'Creates advanced materials.',
        cost: { manufacturing: 400, science: 50 },
        production: { manufacturing: 5 },
        upkeep: { energy: 4 },
        unlocked: false,
        maxAllowed: 3,
    },
    // Credits Buildings
    creditExchangeTerminal: {
        id: 'creditExchangeTerminal',
        name: 'Credit Exchange Terminal',
        description: 'Generates a modest amount of Credits.',
        cost: { manufacturing: 30, energy: 10 }, // Costs Material and some initial Energy
        production: { coin: 0.2 },
        upkeep: { energy: 0.2 },
        unlocked: false,
        maxAllowed: 10,
    },
    quantumFinancialProcessor: {
        id: 'quantumFinancialProcessor',
        name: 'Quantum Financial Processor',
        description: 'Generates substantial Credits through complex financial modeling.',
        cost: { manufacturing: 300, science: 150 },
        production: { coin: 2 },
        upkeep: { energy: 2.5 },
        unlocked: false,
        maxAllowed: 3,
    },
    // Research Data Buildings
    basicScienceLab: {
        id: 'basicScienceLab',
        name: 'Basic Science Lab',
        description: 'Conducts fundamental research, generating Research Data.',
        cost: { manufacturing: 60 },
        production: { science: 0.3 },
        upkeep: { energy: 0.8 },
        unlocked: false,
        maxAllowed: 5,
    },
    particleResearchArray: {
        id: 'particleResearchArray',
        name: 'Particle Research Array',
        description: 'Advanced research facility generating significant Research Data.',
        cost: { manufacturing: 700, energy: 200 },
        production: { science: 3 },
        upkeep: { energy: 6 },
        unlocked: false,
        maxAllowed: 2,
    },
};

let activeBuildings = []; // Array to store instances of built structures

/**
 * Unlocks a building blueprint, making it available for construction.
 * Called by the Tech Tree when a relevant technology is researched.
 * @param {string} buildingId - The ID of the building blueprint to unlock.
 */
function unlockBuildingBlueprint(buildingId) {
    if (buildingBlueprints[buildingId]) {
        buildingBlueprints[buildingId].unlocked = true;
        console.log(`Blueprint Unlocked: ${buildingBlueprints[buildingId].name} (v4)`);
        updateBuildMenu(); // Refresh the build menu UI
    } else {
        console.warn(`Attempted to unlock unknown building blueprint: ${buildingId} (v4)`);
    }
}

/**
 * Checks if a specific building type can be constructed.
 * Considers if blueprint is unlocked, resource costs, and max allowed.
 * @param {string} buildingId - The ID of the building blueprint.
 * @returns {boolean} True if the building can be constructed, false otherwise.
 */
function canBuild(buildingId) {
    const blueprint = buildingBlueprints[buildingId];
    if (!blueprint || !blueprint.unlocked) return false;

    // Check max allowed
    const count = activeBuildings.filter(b => b.id === buildingId).length;
    if (blueprint.maxAllowed !== undefined && count >= blueprint.maxAllowed) {
        // alert(`Maximum number of ${blueprint.name}s reached.`);
        return false;
    }

    // Check resource costs
    for (const resourceType in blueprint.cost) {
        if (getResource(resourceType) < blueprint.cost[resourceType]) {
            return false;
        }
    }
    return true;
}

/**
 * Constructs a building if conditions are met.
 * @param {string} buildingId - The ID of the building blueprint to construct.
 * @returns {object|null} The constructed building instance or null if failed.
 */
function buildStructure(buildingId) {
    const blueprint = buildingBlueprints[buildingId];
    if (!canBuild(buildingId)) {
        console.warn(`Cannot build ${blueprint ? blueprint.name : buildingId}. Check conditions. (v4)`);
        if (blueprint && !blueprint.unlocked) alert(`${blueprint.name} blueprint not yet unlocked.`);
        else if (blueprint) {
             const count = activeBuildings.filter(b => b.id === buildingId).length;
             if (blueprint.maxAllowed !== undefined && count >= blueprint.maxAllowed) {
                alert(`Maximum number of ${blueprint.name}s already built.`);
             } else {
                alert(`Insufficient resources to build ${blueprint.name}.`);
             }
        }
        return null;
    }

    // Spend resources
    for (const resourceType in blueprint.cost) {
        spendResource(resourceType, blueprint.cost[resourceType]);
    }

    // Create an instance of the building
    const newBuildingInstance = {
        instanceId: `${buildingId}_${Date.now()}`, // Unique ID for this specific instance
        id: blueprint.id, // Blueprint ID
        name: blueprint.name,
        production: { ...blueprint.production },
        upkeep: { ...blueprint.upkeep },
        operational: true, // Buildings start operational
    };
    activeBuildings.push(newBuildingInstance);
    console.log(`Constructed: ${newBuildingInstance.name} (Instance: ${newBuildingInstance.instanceId}) (v4)`);

    // Update UI and resource flow calculations
    updateResourceDisplay();
    updateActiveBuildingsDisplay();
    updateBuildMenu(); // Refresh to show updated counts / disabled states
    recalculateTotalProductionAndUpkeep(); // Crucial step

    return newBuildingInstance;
}

/**
 * Recalculates the total resource production and energy upkeep from all active buildings.
 * This function should be called whenever buildings are built, destroyed, or their status changes.
 */
function recalculateTotalProductionAndUpkeep() {
    let totalProd = { energy: 0, manufacturing: 0, coin: 0, science: 0 };
    let totalUpkeep = { energy: 0 }; // Currently, only energy upkeep is modeled

    activeBuildings.forEach(building => {
        if (building.operational) { // Only count operational buildings
            for (const resourceType in building.production) {
                if (totalProd.hasOwnProperty(resourceType)) {
                    totalProd[resourceType] += building.production[resourceType];
                }
            }
            for (const resourceType in building.upkeep) {
                if (totalUpkeep.hasOwnProperty(resourceType)) {
                    totalUpkeep[resourceType] += building.upkeep[resourceType];
                }
            }
        }
    });

    // Update the global flow rates in resources.js
    updateResourceFlowRates(totalProd, totalUpkeep);
    // The UI for resource details (prod/consumption) will be updated in the main game loop or by updateUIDisplays
}


/**
 * Returns the array of active building instances.
 * @returns {Array<object>}
 */
function getActiveBuildings() {
    return activeBuildings;
}

/**
 * Returns the blueprint data for all defined buildings.
 * @returns {object}
 */
function getAllBuildingBlueprints() {
    return buildingBlueprints;
}


function initBuildings() {
    console.log("Construction & Building Systems Online (v4)");
    // Future: Load saved buildings
    recalculateTotalProductionAndUpkeep(); // Initialize with zero production/upkeep
}
