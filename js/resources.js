// js/resources.js

const resources = {
    energy: 100, // Start with some initial energy
    manufacturing: 50, // Start with some initial material
    coin: 20,
    science: 0,
};

// Significantly reduced base multiplier to make buildings more important
const BASE_GLOBAL_MULTIPLIER_RATE = 1.0005; // e.g., 0.05% per second passive growth
const CLICK_BONUS_AMOUNT = 0.1;

// Variables to store total production and consumption rates from buildings
// These are updated by buildings.js via updateResourceFlowRates
let totalEnergyProduction = 0;
let totalEnergyConsumption = 0;
let totalMaterialProduction = 0;
let totalCreditsProduction = 0;
let totalResearchDataProduction = 0;

/**
 * Adds a specified amount to a resource type.
 * @param {string} type - The type of resource (e.g., 'energy', 'manufacturing').
 * @param {number} amount - The amount to add.
 */
function addResource(type, amount) {
    if (resources.hasOwnProperty(type)) {
        resources[type] += amount;
        if (resources[type] < 0) resources[type] = 0; // Prevent resources from going negative
    } else {
        console.warn(`Attempted to add to unknown resource type: ${type}`);
    }
}

/**
 * Applies a very small global passive multiplier (compounding) to existing resources.
 * This is separate from building production.
 */
function applyGlobalMultiplier() {
    if (resources.energy > 0) resources.energy *= BASE_GLOBAL_MULTIPLIER_RATE;
    if (resources.manufacturing > 0) resources.manufacturing *= BASE_GLOBAL_MULTIPLIER_RATE;
    if (resources.coin > 0) resources.coin *= BASE_GLOBAL_MULTIPLIER_RATE;
    if (resources.science > 0) resources.science *= BASE_GLOBAL_MULTIPLIER_RATE;
}

/**
 * Retrieves the current amount of a specified resource.
 * @param {string} type - The type of resource.
 * @returns {number} The current amount of the resource, or 0 if type is unknown.
 */
function getResource(type) {
    return resources[type] || 0;
}

/**
 * Attempts to spend a specified amount of a resource.
 * @param {string} type - The type of resource to spend.
 * @param {number} amount - The amount to spend.
 * @returns {boolean} True if the resource was successfully spent, false otherwise.
 */
function spendResource(type, amount) {
    if (resources.hasOwnProperty(type) && resources[type] >= amount) {
        resources[type] -= amount;
        return true;
    }
    return false;
}

/**
 * Handles the event when the player clicks the resource display area.
 * Adds a small flat bonus to all resources.
 */
function handleManualResourceClick() {
    addResource('energy', CLICK_BONUS_AMOUNT * 5); // Click gives a bit more energy
    addResource('manufacturing', CLICK_BONUS_AMOUNT);
    addResource('coin', CLICK_BONUS_AMOUNT);
    addResource('science', CLICK_BONUS_AMOUNT);
    // Corrected function name: updateAllDynamicDisplays is in ui.js
    if (typeof updateAllDynamicDisplays === 'function') {
        updateAllDynamicDisplays();
    } else {
        console.error("updateAllDynamicDisplays function not found. UI will not update on click.");
    }
    // console.log("Manual resource collection:", resources); // For debugging
}

/**
 * Updates the total production and consumption figures.
 * Called by buildings.js when building states change.
 * @param {object} prodRates - Object with production rates per second (e.g., {energy: 10, ...})
 * @param {object} consumptionRates - Object with consumption rates per second (e.g., {energy: 5, ...})
 */
function updateResourceFlowRates(prodRates, consumptionRates) {
    totalEnergyProduction = prodRates.energy || 0;
    totalMaterialProduction = prodRates.manufacturing || 0;
    totalCreditsProduction = prodRates.coin || 0;
    totalResearchDataProduction = prodRates.science || 0;
    totalEnergyConsumption = consumptionRates.energy || 0; // Currently only energy consumption is modeled for buildings
}

/**
 * Processes resource changes due to building production and consumption.
 * This is called each game tick.
 * @param {number} deltaTime - The duration of the game tick in seconds.
 */
function processBuildingProductionAndConsumption(deltaTime) {
    let actualEnergyProductionFromBuildings = totalEnergyProduction;
    let actualMaterialProductionFromBuildings = totalMaterialProduction;
    let actualCreditsProductionFromBuildings = totalCreditsProduction;
    let actualResearchDataProductionFromBuildings = totalResearchDataProduction;

    // Calculate required energy for this tick's upkeep
    const requiredEnergyForUpkeepThisTick = totalEnergyConsumption * deltaTime;
    let energyAvailableForUpkeep = resources.energy + (actualEnergyProductionFromBuildings * deltaTime); // Energy we have + energy buildings will make this tick

    // Energy deficit handling
    if (energyAvailableForUpkeep < requiredEnergyForUpkeepThisTick) {
        console.warn("ENERGY DEFICIT! Production may be reduced or buildings may go offline.");
        // Simple model: Reduce all production proportionally if not enough energy for upkeep.
        // More complex models could shut down buildings selectively.
        const efficiencyFactor = requiredEnergyForUpkeepThisTick > 0 ? energyAvailableForUpkeep / requiredEnergyForUpkeepThisTick : 0;

        actualMaterialProductionFromBuildings *= efficiencyFactor;
        actualCreditsProductionFromBuildings *= efficiencyFactor;
        actualResearchDataProductionFromBuildings *= efficiencyFactor;
        // Potentially, energy production itself could be affected if energy buildings have upkeep.
        // For now, assume energy buildings' production is prioritized or calculated before this deficit check.

        // Consume all available energy for upkeep up to the required amount
        spendResource('energy', Math.min(resources.energy, requiredEnergyForUpkeepThisTick));
    } else {
        // Sufficient energy, consume upkeep as normal
        spendResource('energy', requiredEnergyForUpkeepThisTick);
    }

    // Add resources produced by buildings (potentially adjusted by efficiency)
    addResource('energy', actualEnergyProductionFromBuildings * deltaTime);
    addResource('manufacturing', actualMaterialProductionFromBuildings * deltaTime);
    addResource('coin', actualCreditsProductionFromBuildings * deltaTime);
    addResource('science', actualResearchDataProductionFromBuildings * deltaTime);
}

/**
 * Initializes the resource system.
 * Sets initial resource counts and attaches event listener for manual collection.
 */
function initResources() {
    resources.energy = 100;
    resources.manufacturing = 50;
    resources.coin = 20;
    resources.science = 0;
    console.log("Resource Subsystems Initialized (v4 fix)");

    const resourceDisplayArea = document.getElementById('resource-display');
    if (resourceDisplayArea) {
        resourceDisplayArea.addEventListener('click', handleManualResourceClick);
    } else {
        console.error("Resource display area ('resource-display') not found for click listener.");
    }
}
