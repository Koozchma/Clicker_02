// js/resources.js

// Object to store current resource counts
const resources = {
    energy: 0,
    manufacturing: 0, // Internal name, corresponds to "Material" in UI
    coin: 0,          // Internal name, corresponds to "Credits" in UI
    science: 0,       // Internal name, corresponds to "Research Data" in UI
};

// Amount of each resource gained per manual click on the resource display area
const CLICK_BONUS_AMOUNT = 0.1;

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
 * Applies a global multiplier (e.g., 1.01x) to all current resource totals.
 * This is typically called once per game tick.
 */
function applyGlobalMultiplier() {
    const MULTIPLIER_RATE = 1.01; // The rate at which resources compound
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
    addResource('energy', CLICK_BONUS_AMOUNT);
    addResource('manufacturing', CLICK_BONUS_AMOUNT);
    addResource('coin', CLICK_BONUS_AMOUNT);
    addResource('science', CLICK_BONUS_AMOUNT);
    updateResourceDisplay(); // Immediately update UI to reflect the gain
    // console.log("Manual resource collection:", resources); // For debugging
}

/**
 * Initializes the resource system.
 * Sets initial resource counts to zero and attaches event listener for manual collection.
 */
function initResources() {
    resources.energy = 0;
    resources.manufacturing = 0;
    resources.coin = 0;
    resources.science = 0;
    console.log("Resource Subsystems Initialized (v3)");

    const resourceDisplayArea = document.getElementById('resource-display');
    if (resourceDisplayArea) {
        resourceDisplayArea.addEventListener('click', handleManualResourceClick);
    } else {
        console.error("Resource display area not found for click listener.");
    }
}
