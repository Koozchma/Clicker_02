// js/resources.js

const resources = {
    energy: 100,
    manufacturing: 50,
    coin: 20,
    science: 0,
};

const BASE_GLOBAL_MULTIPLIER_RATE = 1.0005;
const CLICK_BONUS_AMOUNT = 0.1;

// Store total production and consumption rates from buildings and other sources (e.g., future global events)
let totalRates = {
    energy: { production: 0, consumption: 0 },
    manufacturing: { production: 0, consumption: 0 }, // Added consumption placeholder
    coin: { production: 0, consumption: 0 },          // Added consumption placeholder
    science: { production: 0, consumption: 0 }        // Added consumption placeholder
};


function addResource(type, amount) {
    if (resources.hasOwnProperty(type)) {
        resources[type] += amount;
        if (resources[type] < 0) resources[type] = 0;
    }
}

function applyGlobalMultiplier() {
    if (resources.energy > 0) resources.energy *= BASE_GLOBAL_MULTIPLIER_RATE;
    if (resources.manufacturing > 0) resources.manufacturing *= BASE_GLOBAL_MULTIPLIER_RATE;
    if (resources.coin > 0) resources.coin *= BASE_GLOBAL_MULTIPLIER_RATE;
    if (resources.science > 0) resources.science *= BASE_GLOBAL_MULTIPLIER_RATE;
}

function getResource(type) {
    return resources[type] || 0;
}

function spendResource(type, amount) {
    if (resources.hasOwnProperty(type) && resources[type] >= amount) {
        resources[type] -= amount;
        return true;
    }
    return false;
}

function handleManualResourceClick() {
    addResource('energy', CLICK_BONUS_AMOUNT * 5);
    addResource('manufacturing', CLICK_BONUS_AMOUNT);
    addResource('coin', CLICK_BONUS_AMOUNT);
    addResource('science', CLICK_BONUS_AMOUNT);
    if (typeof updateAllDynamicDisplays === 'function') {
        updateAllDynamicDisplays();
    } else {
        console.error("updateAllDynamicDisplays function not found.");
    }
}

/**
 * Updates the total production and consumption figures for all resources.
 * Called by buildings.js and potentially other systems.
 * @param {object} buildingProdRates - Production from buildings {energy: X, manufacturing: Y, ...}
 * @param {object} buildingConsumptionRates - Consumption by buildings {energy: Z}
 */
function updateResourceFlowRates(buildingProdRates, buildingConsumptionRates) {
    // Reset rates before recalculating
    for (const resourceType in totalRates) {
        totalRates[resourceType].production = 0;
        totalRates[resourceType].consumption = 0;
    }

    // Add building production
    for (const resourceType in buildingProdRates) {
        if (totalRates[resourceType]) {
            totalRates[resourceType].production += buildingProdRates[resourceType];
        }
    }

    // Add building consumption (currently only energy)
    if (buildingConsumptionRates.energy && totalRates.energy) {
        totalRates.energy.consumption += buildingConsumptionRates.energy;
    }

    // Placeholder for other consumption sources if they arise for other resources
    // e.g., totalRates.manufacturing.consumption += someOtherManufacturingConsumption;

    // console.log("Updated Resource Flow Rates:", totalRates); // For debugging
}


function processBuildingProductionAndConsumption(deltaTime) {
    let efficiencyFactor = 1; // Assume 100% efficiency initially

    // Energy deficit check
    const teamPassiveGen = calculateTeamPassiveGeneration(); // Get passive team generation
    const currentEnergyPool = resources.energy;
    const energyGeneratedThisTickBeforeConsumption = (totalRates.energy.production + teamPassiveGen.energy) * deltaTime;
    const energyRequiredForUpkeepThisTick = totalRates.energy.consumption * deltaTime;
    const totalPotentialEnergy = currentEnergyPool + energyGeneratedThisTickBeforeConsumption;

    if (totalPotentialEnergy < energyRequiredForUpkeepThisTick && energyRequiredForUpkeepThisTick > 0) {
        console.warn("ENERGY DEFICIT! Production efficiency reduced.");
        efficiencyFactor = totalPotentialEnergy / energyRequiredForUpkeepThisTick;
        // Cap efficiency at 1 (shouldn't exceed if logic is correct, but as a safeguard)
        efficiencyFactor = Math.min(1, Math.max(0, efficiencyFactor)); 
        
        // Consume all available energy for upkeep
        spendResource('energy', currentEnergyPool); // Spend what we have
    } else if (energyRequiredForUpkeepThisTick > 0) {
        // Sufficient energy, consume upkeep as normal
        spendResource('energy', energyRequiredForUpkeepThisTick);
    }
    // If energyRequiredForUpkeepThisTick is 0, no energy is spent on upkeep.

    // Add resources produced by buildings (adjusted by efficiency) and team passives
    addResource('energy', (totalRates.energy.production * efficiencyFactor + teamPassiveGen.energy) * deltaTime);
    addResource('manufacturing', (totalRates.manufacturing.production * efficiencyFactor + teamPassiveGen.manufacturing) * deltaTime);
    addResource('coin', (totalRates.coin.production * efficiencyFactor + teamPassiveGen.coin) * deltaTime);
    addResource('science', (totalRates.science.production * efficiencyFactor + teamPassiveGen.science) * deltaTime);

    // Note: Team passive generation is NOT affected by building energy efficiency in this model.
}


function initResources() {
    resources.energy = 100;
    resources.manufacturing = 50;
    resources.coin = 20;
    resources.science = 0;
    console.log("Resource Subsystems Initialized (v5)");

    const resourceDisplayArea = document.getElementById('resource-display');
    if (resourceDisplayArea) {
        resourceDisplayArea.addEventListener('click', handleManualResourceClick);
    }
}
