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

let totalEnergyProduction = 0;
let totalEnergyConsumption = 0;
let totalMaterialProduction = 0;
let totalCreditsProduction = 0;
let totalResearchDataProduction = 0;

function addResource(type, amount) {
    if (resources.hasOwnProperty(type)) {
        resources[type] += amount;
        if (resources[type] < 0) resources[type] = 0;
    }
}

function applyGlobalMultiplier() {
    // This applies to the base resource pool, separate from building production
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
    addResource('energy', CLICK_BONUS_AMOUNT * 5); // Click gives a bit more energy
    addResource('manufacturing', CLICK_BONUS_AMOUNT);
    addResource('coin', CLICK_BONUS_AMOUNT);
    addResource('science', CLICK_BONUS_AMOUNT);
    updateUIDisplays(); // Call the main UI update function
}

/**
 * Updates the total production and consumption figures.
 * Called by buildings.js when building states change.
 */
function updateResourceFlowRates(prodRates, consumptionRates) {
    totalEnergyProduction = prodRates.energy || 0;
    totalMaterialProduction = prodRates.manufacturing || 0;
    totalCreditsProduction = prodRates.coin || 0;
    totalResearchDataProduction = prodRates.science || 0;
    totalEnergyConsumption = consumptionRates.energy || 0;
}


function processBuildingProductionAndConsumption(deltaTime) {
    // Add resources produced by buildings
    // These values are calculated in buildings.js and passed via updateResourceFlowRates
    let actualEnergyProduction = totalEnergyProduction;
    let actualMaterialProduction = totalMaterialProduction;
    let actualCreditsProduction = totalCreditsProduction;
    let actualResearchDataProduction = totalResearchDataProduction;

    // Check for energy deficit
    const netEnergyBeforeConsumption = resources.energy + (actualEnergyProduction * deltaTime);
    const requiredEnergyForTick = totalEnergyConsumption * deltaTime;

    if (netEnergyBeforeConsumption < requiredEnergyForTick) {
        // Energy deficit handling
        console.warn("ENERGY DEFICIT! Production may be affected.");
        // Simple model: reduce all production proportionally, or shut down buildings (more complex)
        const efficiency = netEnergyBeforeConsumption / (requiredEnergyForTick || 1); // Avoid division by zero
        
        actualMaterialProduction *= efficiency;
        actualCreditsProduction *= efficiency;
        actualResearchDataProduction *= efficiency;
        // Energy production itself might also be affected if some energy buildings consume energy
        // For now, assume energy production is not self-consuming in this calculation step.

        // Consume all available energy for upkeep
        spendResource('energy', resources.energy); // Drain all energy if deficit is severe
        // Or spendResource('energy', netEnergyBeforeConsumption) to not go negative from this step.
        // Let's go with consuming what's available up to the requirement.
        spendResource('energy', Math.min(resources.energy, requiredEnergyForTick));


    } else {
        // Sufficient energy, consume as normal
        spendResource('energy', requiredEnergyForTick);
    }

    addResource('energy', actualEnergyProduction * deltaTime);
    addResource('manufacturing', actualMaterialProduction * deltaTime);
    addResource('coin', actualCreditsProduction * deltaTime);
    addResource('science', actualResearchDataProduction * deltaTime);
}


function initResources() {
    resources.energy = 100;
    resources.manufacturing = 50;
    resources.coin = 20;
    resources.science = 0;
    console.log("Resource Subsystems Initialized (v4)");

    const resourceDisplayArea = document.getElementById('resource-display');
    if (resourceDisplayArea) {
        resourceDisplayArea.addEventListener('click', handleManualResourceClick);
    }
}
