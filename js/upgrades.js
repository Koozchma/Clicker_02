// js/upgrades.js

// IMPORTANT: 'teamMembers' is defined in 'teams.js' and should be globally accessible.
// This file should NOT redeclare 'teamMembers'.

// Object defining the Science skill tree upgrades
const scienceTree = {
    unlockTier1Manufacturing: {
        id: 'unlockTier1Manufacturing',
        name: 'Applied Material Science',
        description: 'Unlocks Tier 1 Material Fabrication research projects.',
        cost: { science: 50 },
        unlocked: false,
        requires: [], // No prerequisites for this one
        onUnlock: () => {
            console.log("Tech Matrix: Applied Material Science Unlocked! (v3)");
            // Enable relevant research options
            if (window.research && typeof window.research.unlockManufacturingCategory === 'function') {
                window.research.unlockManufacturingCategory('tier1');
            }
        }
    },
    unlockTeamSlot2: {
        id: 'unlockTeamSlot2',
        name: 'Expanded Command Structure',
        description: 'Authorizes recruitment of an additional operative.',
        cost: { science: 25, coin: 50 },
        unlocked: false,
        requires: [],
        onUnlock: () => {
            console.log("Tech Matrix: Expanded Command Structure research complete! (v3)");
            // UI update for purchase button is handled by updatePurchaseButton checking this unlock status
            updatePurchaseButton();
        }
    },
    advancedEnergySystems: {
        id: 'advancedEnergySystems',
        name: 'Advanced Energy Systems',
        description: 'Boosts all ENERGY generation by 10%. (Effect placeholder)',
        cost: { science: 100, energy: 50 },
        unlocked: false,
        requires: ['unlockTier1Manufacturing'], // Example prerequisite
        onUnlock: () => {
            console.log("Tech Matrix: Advanced Energy Systems Unlocked! (v3)");
            // TODO: Implement the actual 10% boost logic.
            // This might involve a global multiplier object or modifying base generation rates.
        }
    },
    basicDataAnalytics: {
        id: 'basicDataAnalytics',
        name: 'Basic Data Analytics',
        description: 'Improves RESEARCH DATA collection efficiency by 5%. (Effect placeholder)',
        cost: { science: 75 },
        unlocked: false,
        requires: [],
        onUnlock: () => {
            console.log("Tech Matrix: Basic Data Analytics Unlocked! (v3)");
            // TODO: Implement the actual 5% boost to science generation.
        }
    }
};

// Object defining the Manufacturing (Material) skill tree upgrades
const manufacturingTree = {
    efficientFabricators: {
        id: 'efficientFabricators',
        name: 'Efficient Fabricators',
        description: 'Increases MATERIAL output by 5%. (Effect placeholder)',
        cost: { manufacturing: 200, coin: 50 },
        unlocked: false,
        requires: [], // Could require science unlocks
        onUnlock: () => {
            console.log("Production Optimization: Efficient Fabricators Unlocked! (v3)");
            // TODO: Implement the 5% boost to material output.
        }
    }
};

// Object defining the Banking (Credits) skill tree upgrades
const bankingTree = {
    automatedCreditRouting: {
        id: 'automatedCreditRouting',
        name: 'Automated Credit Routing',
        description: 'Generates a small passive CREDIT income. (Effect placeholder)',
        cost: { coin: 500, science: 50 },
        unlocked: false,
        requires: [],
        onUnlock: () => {
            console.log("Economic Synergies: Automated Credit Routing Unlocked! (v3)");
            // TODO: Implement passive credit income.
        }
    }
};

/**
 * Retrieves the specific upgrade definitions for a given character.
 * Note: Character upgrades are stored on the character objects in 'teamMembers' array.
 * @param {string} characterId - The ID of the character.
 * @returns {object} The character's upgrade tree object, or an empty object if none.
 */
function getCharacterUpgrades(characterId) {
    // 'teamMembers' must be accessible here (defined in teams.js)
    if (typeof teamMembers === 'undefined') {
        console.error("CRITICAL: teamMembers array is not accessible in upgrades.js (getCharacterUpgrades)");
        return {};
    }
    const character = teamMembers.find(m => m.id === characterId);
    if (character && character.upgrades) {
        return character.upgrades;
    }
    return {};
}

/**
 * Checks if the player can afford a given upgrade.
 * @param {object} upgrade - The upgrade object (must have a 'cost' property).
 * @returns {boolean} True if affordable, false otherwise.
 */
function canAffordUpgrade(upgrade) {
    if (!upgrade || !upgrade.cost) {
        console.warn("canAffordUpgrade called with invalid upgrade object:", upgrade);
        return false;
    }
    for (const resourceType in upgrade.cost) {
        if (getResource(resourceType) < upgrade.cost[resourceType]) {
            return false; // Not enough of at least one resource
        }
    }
    return true; // All resource costs can be met
}

/**
 * Attempts to purchase an upgrade from a specified tree.
 * @param {string} treeKey - The key identifying the tree (e.g., 'science', 'manufacturing').
 * @param {string} upgradeId - The ID of the upgrade to purchase.
 * @returns {boolean} True if purchase was successful, false otherwise.
 */
function purchaseUpgrade(treeKey, upgradeId) {
    let upgrade;
    let actualTreeObject;

    // Select the correct tree object based on treeKey
    switch (treeKey) {
        case 'science': actualTreeObject = scienceTree; break;
        case 'manufacturing': actualTreeObject = manufacturingTree; break;
        case 'banking': actualTreeObject = bankingTree; break;
        // TODO: Add case for 'character' if character-specific upgrades are purchased through a similar mechanism
        default:
            console.error(`Unknown upgrade tree key: ${treeKey} (v3)`);
            return false;
    }
    upgrade = actualTreeObject[upgradeId];

    if (!upgrade) {
        console.error(`Upgrade with ID '${upgradeId}' not found in tree '${treeKey}'. (v3)`);
        return false;
    }
    if (upgrade.unlocked) {
        console.info(`Upgrade '${upgrade.name}' is already unlocked. (v3)`);
        return false;
    }
    if (!canAffordUpgrade(upgrade)) {
        console.info(`Cannot afford upgrade '${upgrade.name}'. (v3)`);
        // alert("Insufficient resources for this upgrade."); // Optional user feedback
        return false;
    }

    // Check prerequisites
    let requirementsMet = true;
    if (upgrade.requires && upgrade.requires.length > 0) {
        for (const reqId of upgrade.requires) {
            // Prerequisites are typically from the scienceTree or the same tree
            const requiredUpgrade = scienceTree[reqId] || actualTreeObject[reqId];
            if (!requiredUpgrade || !requiredUpgrade.unlocked) {
                requirementsMet = false;
                alert(`Requirement not met: ${requiredUpgrade ? requiredUpgrade.name : reqId}`);
                break;
            }
        }
    }

    if (requirementsMet) {
        // Spend resources
        for (const resourceType in upgrade.cost) {
            spendResource(resourceType, upgrade.cost[resourceType]);
        }
        upgrade.unlocked = true; // Mark as unlocked
        if (typeof upgrade.onUnlock === 'function') {
            upgrade.onUnlock(); // Execute any specific unlock actions
        }
        console.log(`Upgrade Acquired: ${upgrade.name} (Tree: ${treeKey}) (v3)`);

        // Refresh UI elements
        updateResourceDisplay();
        updateAllTreesDisplay(); // This will refresh the specific tree and potentially others

        return true;
    } else {
        console.info(`Prerequisites not met for upgrade '${upgrade.name}'. (v3)`);
    }
    return false;
}

/**
 * Initializes the upgrade system.
 * (Currently, no specific actions needed beyond global setup and tree definitions)
 */
function initUpgrades() {
    console.log("Upgrade System Interface Online (v3)");
    // Future: Load saved upgrade states from localStorage, etc.
}
