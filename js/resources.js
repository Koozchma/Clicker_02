// js/resources.js

const resources = {
    energy: 0,
    manufacturing: 0, // Renamed in UI to Materiel, but keep var name for now
    coin: 0,          // Renamed in UI to Credits
    science: 0,       // Renamed in UI to Research Data
};

// The 1.01 multiplier is applied per tick in main.js now.
// Base click amount
const CLICK_BONUS_AMOUNT = 0.1; // Small amount added per click to each resource

function addResource(type, amount) {
    if (resources.hasOwnProperty(type)) {
        resources[type] += amount;
        if (resources[type] < 0) resources[type] = 0; // Prevent negative resources
    }
}

function applyGlobalMultiplier() {
    // This multiplier applies to the *current total* each game tick.
    const MULTIPLIER_RATE = 1.01;
    if (resources.energy > 0) {
        resources.energy *= MULTIPLIER_RATE;
    }
    if (resources.manufacturing > 0) {
        resources.manufacturing *= MULTIPLIER_RATE;
    }
    if (resources.coin > 0) {
        resources.coin *= MULTIPLIER_RATE;
    }
    if (resources.science > 0) { // Science also benefits from the global multiplier
        resources.science *= MULTIPLIER_RATE;
    }
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
    // Add a small flat bonus to all resources on click
    addResource('energy', CLICK_BONUS_AMOUNT);
    addResource('manufacturing', CLICK_BONUS_AMOUNT);
    addResource('coin', CLICK_BONUS_AMOUNT);
    addResource('science', CLICK_BONUS_AMOUNT); // Science also gets a click bonus
    updateResourceDisplay(); // Immediately update UI after click
    console.log("Manual resource collection:", resources);
}


// Initialize resources for the game
function initResources() {
    resources.energy = 0;
    resources.manufacturing = 0;
    resources.coin = 0;
    resources.science = 0;
    console.log("Resource Subsystems Initialized");

    // Add event listener for the click-to-gain feature
    const resourceDisplayArea = document.getElementById('resource-display');
    if (resourceDisplayArea) {
        resourceDisplayArea.addEventListener('click', handleManualResourceClick);
    }
}
