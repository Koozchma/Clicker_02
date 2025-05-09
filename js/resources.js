// js/resources.js

const resources = {
    energy: 0,
    manufacturing: 0,
    coin: 0,
    science: 0,
    multiplier: 1.00, // Initial multiplier will be 1.01 after first gain
};

function addResource(type, amount) {
    if (resources.hasOwnProperty(type)) {
        resources[type] += amount;
    }
    // Science might have different accumulation rules, not directly from team members initially.
}

function applyMultiplier() {
    // The problem states "it will be multiply against itself by 1.01".
    // This implies that if you have 10 energy, next second you have 10 * 1.01 = 10.1
    // This needs to be applied carefully to avoid runaway feedback loops if
    // the base generation also feeds into this.
    // Let's assume the 1.01 multiplier applies to the *current total* each second.

    if (resources.energy > 0) {
        resources.energy *= 1.01;
    }
    if (resources.manufacturing > 0) {
        resources.manufacturing *= 1.01;
    }
    if (resources.coin > 0) {
        resources.coin *= 1.01;
    }
    // Science might not have this auto-multiplier, or have a different one.
    // For now, we'll exclude science from this specific multiplier.
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

// Initialize resources for the game, perhaps from saved state later
function initResources() {
    // For now, starts at 0
    resources.energy = 0;
    resources.manufacturing = 0;
    resources.coin = 0;
    resources.science = 0;
    console.log("Resources Initialized");
}