// js/upgrades.js

const scienceTree = {
    unlockTier1Manufacturing: {
        id: 'unlockTier1Manufacturing',
        name: 'Basic Manufacturing Processes',
        description: 'Unlocks the ability to research Tier 1 manufactured goods.',
        cost: { science: 50 },
        unlocked: false,
        requires: [],
        onUnlock: () => {
            console.log("Basic Manufacturing Unlocked!");
            // This would typically enable new research options in research.js
            // For example, by modifying an array of available research items.
            if (window.research && typeof window.research.unlockManufacturingCategory === 'function') {
                window.research.unlockManufacturingCategory('tier1');
            }
        }
    },
    unlockTeamSlot2: {
        id: 'unlockTeamSlot2',
        name: 'Expanded Team Rosters',
        description: 'Allows purchasing a second team member.',
        cost: { science: 25 },
        unlocked: false,
        requires: [],
        onUnlock: () => {
            console.log("Team Slot 2 research complete!");
            // This enables the button in the UI. The actual purchase logic is in teams.js
            const buyButton = document.getElementById('buy-member-button');
            if (buyButton) buyButton.disabled = false;
        }
    },
    advancedEnergyHarvesting: {
        id: 'advancedEnergyHarvesting',
        name: 'Advanced Energy Harvesting',
        description: 'Boosts all energy generation by 10%.',
        cost: { science: 100 },
        unlocked: false,
        requires: ['unlockTier1Manufacturing'], // Example requirement
        onUnlock: () => {
            console.log("Advanced Energy Harvesting Unlocked!");
            // This needs to modify a global multiplier or team member outputs
            // For simplicity, let's assume a global buff for now.
            // This effect would need to be applied in resource.js or teams.js calculations.
        }
    }
    // More science upgrades...
};

const manufacturingTree = {
    fasterConveyors: {
        id: 'fasterConveyors',
        name: 'Faster Conveyor Belts',
        description: 'Increases manufacturing output by 5%.',
        cost: { manufacturing: 200, coin: 50 }, // Example cost
        unlocked: false,
        requires: [], // Could require specific science unlocks
        onUnlock: () => { console.log("Faster Conveyors Unlocked!"); }
    }
    // More manufacturing upgrades...
};

const bankingTree = {
    basicInterest: {
        id: 'basicInterest',
        name: 'Basic Interest',
        description: 'Gain a small percentage of your coins automatically over time.',
        cost: { coin: 500, science: 50 },
        unlocked: false,
        requires: [],
        onUnlock: () => { console.log("Basic Interest Unlocked!"); }
    }
    // More banking upgrades...
};

// Character specific upgrades will be stored within the teamMember object itself.
// This function would populate the UI for a selected character's tree.
function getCharacterUpgrades(characterId) {
    const character = teamMembers.find(m => m.id === characterId);
    if (character && character.upgrades) {
        return character.upgrades;
    }
    return {};
}

function canAffordUpgrade(upgrade) {
    for (const resourceType in upgrade.cost) {
        if (getResource(resourceType) < upgrade.cost[resourceType]) {
            return false;
        }
    }
    return true;
}

function purchaseUpgrade(tree, upgradeId) {
    let upgrade;
    if (tree === 'science') upgrade = scienceTree[upgradeId];
    else if (tree === 'manufacturing') upgrade = manufacturingTree[upgradeId];
    else if (tree === 'banking') upgrade = bankingTree[upgradeId];
    // Add character tree logic later

    if (upgrade && !upgrade.unlocked && canAffordUpgrade(upgrade)) {
        // Check requirements
        let requirementsMet = true;
        if (upgrade.requires) {
            for (const reqId of upgrade.requires) {
                // Assuming requirements are from the same tree for now, or global science unlocks
                const reqUpgrade = scienceTree[reqId] || manufacturingTree[reqId] || bankingTree[reqId];
                if (!reqUpgrade || !reqUpgrade.unlocked) {
                    requirementsMet = false;
                    alert(`Requirement not met: ${reqUpgrade ? reqUpgrade.name : reqId}`);
                    break;
                }
            }
        }

        if (requirementsMet) {
            for (const resourceType in upgrade.cost) {
                spendResource(resourceType, upgrade.cost[resourceType]);
            }
            upgrade.unlocked = true;
            if (typeof upgrade.onUnlock === 'function') {
                upgrade.onUnlock();
            }
            console.log(`Upgrade purchased: ${upgrade.name}`);
            updateResourceDisplay();
            // Refresh relevant upgrade tree UI
            if (tree === 'science') updateScienceTreeDisplay();
            // Add other tree updates
            return true;
        }
    } else if (upgrade && upgrade.unlocked) {
        console.log("Upgrade already unlocked.");
    } else if (upgrade && !canAffordUpgrade(upgrade)) {
        console.log("Not enough resources for this upgrade.");
        alert("Not enough resources for this upgrade.");
    } else {
        console.log("Upgrade not found.");
    }
    return false;
}

// Initialize upgrade systems
function initUpgrades() {
    console.log("Upgrade System Initialized");
    // Potentially load saved upgrade states here
}