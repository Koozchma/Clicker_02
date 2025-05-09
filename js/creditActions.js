// js/creditActions.js

const creditActionsData = {
    overchargeProduction: {
        id: 'overchargeProduction',
        name: 'Overcharge Production',
        description: 'Temporarily boosts output of ALL production buildings by 25% for 30 seconds.',
        cost: { coin: 200 },
        duration: 30, // seconds
        effectMultiplier: 1.25, // 25% boost
        isActive: false,
        timeRemaining: 0,
        type: 'production_boost_all',
        onActivate: function() {
            // Logic to apply the boost will be handled in main.js or buildings.js
            console.log("Credit Action: Overcharge Production ACTIVATED! (v4)");
        },
        onDeactivate: function() {
            console.log("Credit Action: Overcharge Production DEACTIVATED. (v4)");
        }
    },
    emergencyEnergy: {
        id: 'emergencyEnergy',
        name: 'Emergency Energy Procurement',
        description: 'Instantly gain 500 Energy. High cost.',
        cost: { coin: 500 },
        effectAmount: { energy: 500 },
        type: 'instant_resource_gain',
        onActivate: function() {
            addResource('energy', this.effectAmount.energy);
            console.log(`Credit Action: Procured ${this.effectAmount.energy} Energy. (v4)`);
            updateResourceDisplay();
        }
        // No duration or deactivation needed for instant effects
    },
    emergencyMaterial: {
        id: 'emergencyMaterial',
        name: 'Emergency Material Procurement',
        description: 'Instantly gain 250 Material.',
        cost: { coin: 400 },
        effectAmount: { manufacturing: 250 }, // 'manufacturing' is the internal key for Material
        type: 'instant_resource_gain',
        onActivate: function() {
            addResource('manufacturing', this.effectAmount.manufacturing);
            console.log(`Credit Action: Procured ${this.effectAmount.manufacturing} Material. (v4)`);
            updateResourceDisplay();
        }
    },
    researchSprint: {
        id: 'researchSprint',
        name: 'Research Sprint',
        description: 'Doubles Research Data generation (from buildings and passive team bonus) for 60 seconds.',
        cost: { coin: 300 },
        duration: 60,
        effectMultiplier: 2.0, // Doubles research data
        isActive: false,
        timeRemaining: 0,
        type: 'research_boost',
        onActivate: function() {
            console.log("Credit Action: Research Sprint ACTIVATED! (v4)");
        },
        onDeactivate: function() {
            console.log("Credit Action: Research Sprint DEACTIVATED. (v4)");
        }
    },
    systemCalibration: {
        id: 'systemCalibration',
        name: 'System Calibration',
        description: 'Temporarily reduces Energy upkeep of all buildings by 20% for 45 seconds.',
        cost: { coin: 250 },
        duration: 45,
        upkeepReductionFactor: 0.8, // Reduces upkeep TO 80% (20% reduction)
        isActive: false,
        timeRemaining: 0,
        type: 'upkeep_reduction',
        onActivate: function() {
            console.log("Credit Action: System Calibration ACTIVATED! (v4)");
            recalculateTotalProductionAndUpkeep(); // Recalculate with new upkeep
        },
        onDeactivate: function() {
            console.log("Credit Action: System Calibration DEACTIVATED. (v4)");
            recalculateTotalProductionAndUpkeep(); // Recalculate to restore normal upkeep
        }
    },
    // Expedited Construction is more complex as it needs to target a specific building.
    // This might require a different UI interaction (e.g., click a button on a building-in-progress card).
    // For now, focusing on global or simple instant effects.
};

/**
 * Attempts to activate a credit action.
 * @param {string} actionId - The ID of the credit action to activate.
 * @returns {boolean} True if action activated successfully, false otherwise.
 */
function activateCreditAction(actionId) {
    const action = creditActionsData[actionId];
    if (!action) {
        console.error(`Credit action '${actionId}' not found. (v4)`);
        return false;
    }
    if (action.isActive && action.duration > 0) { // Check if it's a timed action already active
        alert(`${action.name} is already active.`);
        return false;
    }
    if (!canAffordCreditAction(actionId)) {
        alert(`Insufficient Credits for ${action.name}.`);
        return false;
    }

    // Spend credits
    for (const resourceType in action.cost) {
        if (!spendResource(resourceType, action.cost[resourceType])) {
            // Should not happen if canAffordCreditAction was true, but as a safeguard:
            console.error(`Failed to spend ${resourceType} for ${action.name} despite affordability check. (v4)`);
            return false;
        }
    }

    if (action.duration && action.duration > 0) { // Timed action
        action.isActive = true;
        action.timeRemaining = action.duration;
    }

    if (typeof action.onActivate === 'function') {
        action.onActivate();
    }

    console.log(`Credit Action: ${action.name} initiated. (v4)`);
    updateResourceDisplay();
    updateCreditActionsDisplay(); // Refresh UI to show active state / cooldowns
    return true;
}

/**
 * Checks if the player can afford a credit action.
 * @param {string} actionId - The ID of the credit action.
 * @returns {boolean} True if affordable, false otherwise.
 */
function canAffordCreditAction(actionId) {
    const action = creditActionsData[actionId];
    if (!action || !action.cost) return false;
    for (const resourceType in action.cost) {
        if (getResource(resourceType) < action.cost[resourceType]) {
            return false;
        }
    }
    return true;
}

/**
 * Updates the timers for active credit actions. Called each game tick.
 * @param {number} deltaTime - Time elapsed since the last tick, in seconds.
 */
function updateActiveCreditActions(deltaTime) {
    let needsUIRefresh = false;
    for (const actionId in creditActionsData) {
        const action = creditActionsData[actionId];
        if (action.isActive && action.timeRemaining > 0) {
            action.timeRemaining -= deltaTime;
            if (action.timeRemaining <= 0) {
                action.isActive = false;
                action.timeRemaining = 0;
                if (typeof action.onDeactivate === 'function') {
                    action.onDeactivate();
                }
                needsUIRefresh = true;
            }
        }
    }
    if (needsUIRefresh) {
        updateCreditActionsDisplay(); // Refresh UI if any action expired
    }
}

/**
 * Gets the data for all defined credit actions.
 * @returns {object}
 */
function getAllCreditActions() {
    return creditActionsData;
}

function initCreditActions() {
    console.log("Strategic Operations Systems Online (v4)");
    // Future: Load any saved active action states (though typically these are short-term)
}
