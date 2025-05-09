// js/techTree.js (formerly upgrades.js)

// Defines the entire technology research tree.
// Nodes are technologies/blueprints. Unlocking them costs Research Data.
const techTreeData = {
    // ENERGY BRANCH
    basicEnergySystems: {
        id: 'basicEnergySystems',
        name: 'Basic Energy Systems',
        description: 'Fundamental understanding of energy generation. Unlocks Basic Solar Array.',
        cost: { science: 10 }, // Cost in Research Data
        unlocked: false,
        requires: [], // No prerequisites
        unlocks: ['build_basicSolarArray'], // ID of the building blueprint unlocked
        branch: 'energy',
        tier: 1,
        onUnlock: () => { console.log("Tech Unlocked: Basic Energy Systems"); }
    },
    improvedSolarPanels: {
        id: 'improvedSolarPanels',
        name: 'Improved Solar Panels',
        description: 'Enhances efficiency of solar arrays. Unlocks Advanced Solar Array.',
        cost: { science: 50, energy: 200 }, // Example of multi-resource cost
        unlocked: false,
        requires: ['basicEnergySystems'],
        unlocks: ['build_advancedSolarArray'],
        branch: 'energy',
        tier: 2,
        onUnlock: () => { console.log("Tech Unlocked: Improved Solar Panels"); }
    },
    fusionPower: {
        id: 'fusionPower',
        name: 'Fusion Power',
        description: 'Breakthrough in energy production. Unlocks Fusion Reactor.',
        cost: { science: 500, manufacturing: 200 },
        unlocked: false,
        requires: ['improvedSolarPanels'], // Could have multiple requirements
        unlocks: ['build_fusionReactor'],
        branch: 'energy',
        tier: 3,
        onUnlock: () => { console.log("Tech Unlocked: Fusion Power"); }
    },

    // MATERIAL BRANCH
    basicMaterialProcessing: {
        id: 'basicMaterialProcessing',
        name: 'Basic Material Processing',
        description: 'Rudimentary techniques for material extraction and fabrication. Unlocks Basic Fabricator.',
        cost: { science: 20 },
        unlocked: false,
        requires: [],
        unlocks: ['build_basicFabricator'],
        branch: 'material',
        tier: 1,
        onUnlock: () => { console.log("Tech Unlocked: Basic Material Processing"); }
    },
    automatedManufacturing: {
        id: 'automatedManufacturing',
        name: 'Automated Manufacturing',
        description: 'Introduces automation to production lines. Unlocks Automated Fabricator.',
        cost: { science: 100, manufacturing: 50 },
        unlocked: false,
        requires: ['basicMaterialProcessing'],
        unlocks: ['build_automatedFabricator'],
        branch: 'material',
        tier: 2,
        onUnlock: () => { console.log("Tech Unlocked: Automated Manufacturing"); }
    },
    syntheticsDevelopment: {
        id: 'syntheticsDevelopment',
        name: 'Synthetics Development',
        description: 'Research into advanced synthetic materials. Unlocks Synthetics Lab.',
        cost: { science: 300, energy: 500 },
        unlocked: false,
        requires: ['automatedManufacturing'],
        unlocks: ['build_syntheticsLab'],
        branch: 'material',
        tier: 3,
        onUnlock: () => { console.log("Tech Unlocked: Synthetics Development"); }
    },

    // CREDITS BRANCH
    basicEconomicModels: {
        id: 'basicEconomicModels',
        name: 'Basic Economic Models',
        description: 'Understanding of trade and value. Unlocks Credit Exchange Terminal.',
        cost: { science: 15 },
        unlocked: false,
        requires: [],
        unlocks: ['build_creditExchangeTerminal'],
        branch: 'credits',
        tier: 1,
        onUnlock: () => { console.log("Tech Unlocked: Basic Economic Models"); }
    },
    quantumFinance: {
        id: 'quantumFinance',
        name: 'Quantum Financial Processing',
        description: 'Advanced algorithms for market prediction and credit generation. Unlocks Quantum Financial Processor.',
        cost: { science: 400, coin: 1000 },
        unlocked: false,
        requires: ['basicEconomicModels', 'automatedManufacturing'], // Example cross-branch requirement
        unlocks: ['build_quantumFinancialProcessor'],
        branch: 'credits',
        tier: 2, // Could be tier 3 depending on desired depth
        onUnlock: () => { console.log("Tech Unlocked: Quantum Financial Processing"); }
    },

    // RESEARCH DATA BRANCH
    methodicalExperimentation: {
        id: 'methodicalExperimentation',
        name: 'Methodical Experimentation',
        description: 'Formalizes the scientific method. Unlocks Basic Science Lab.',
        cost: { science: 25 },
        unlocked: false,
        requires: [],
        unlocks: ['build_basicScienceLab'],
        branch: 'research',
        tier: 1,
        onUnlock: () => { console.log("Tech Unlocked: Methodical Experimentation"); }
    },
    particlePhysics: {
        id: 'particlePhysics',
        name: 'Particle Physics Research',
        description: 'Deepens understanding of fundamental particles. Unlocks Particle Research Array.',
        cost: { science: 600, energy: 1000, manufacturing: 300 },
        unlocked: false,
        requires: ['methodicalExperimentation', 'fusionPower'], // Requires advanced energy
        unlocks: ['build_particleResearchArray'],
        branch: 'research',
        tier: 2,
        onUnlock: () => { console.log("Tech Unlocked: Particle Physics Research"); }
    },

    // GENERAL / TEAM UPGRADES (Example, can be expanded)
    unlockTeamSlot2: { // Kept from previous version, now part of tech tree
        id: 'unlockTeamSlot2',
        name: 'Expanded Command Structure',
        description: 'Authorizes recruitment of an additional operative.',
        cost: { science: 75, coin: 250 }, // Adjusted cost
        unlocked: false,
        requires: ['basicEnergySystems', 'basicMaterialProcessing'], // Requires some basic infrastructure
        unlocks: ['team_slot_2'], // Special key to indicate team slot unlock
        branch: 'general',
        tier: 1,
        onUnlock: () => {
            console.log("Tech Unlocked: Expanded Command Structure!");
            updatePurchaseButton(); // UI update for operative recruitment
        }
    },
    // Add more team slots, global efficiency upgrades etc. here
};

/**
 * Checks if a technology's prerequisites are met.
 * @param {string} techId - The ID of the technology to check.
 * @returns {boolean} True if all prerequisites are unlocked, false otherwise.
 */
function checkTechRequirements(techId) {
    const tech = techTreeData[techId];
    if (!tech || !tech.requires || tech.requires.length === 0) {
        return true; // No requirements or tech not found (shouldn't happen for valid ID)
    }
    return tech.requires.every(reqId => techTreeData[reqId] && techTreeData[reqId].unlocked);
}

/**
 * Checks if the player can afford a given technology.
 * @param {string} techId - The ID of the technology.
 * @returns {boolean} True if affordable, false otherwise.
 */
function canAffordTech(techId) {
    const tech = techTreeData[techId];
    if (!tech || !tech.cost) return false;

    for (const resourceType in tech.cost) {
        if (getResource(resourceType) < tech.cost[resourceType]) {
            return false;
        }
    }
    return true;
}

/**
 * Attempts to unlock a technology in the Tech Tree.
 * @param {string} techId - The ID of the technology to unlock.
 * @returns {boolean} True if technology was successfully unlocked, false otherwise.
 */
function unlockTechnology(techId) {
    const tech = techTreeData[techId];
    if (!tech) {
        console.error(`Technology with ID '${techId}' not found. (v4)`);
        return false;
    }
    if (tech.unlocked) {
        console.info(`Technology '${tech.name}' is already unlocked. (v4)`);
        return false;
    }
    if (!checkTechRequirements(techId)) {
        alert(`Prerequisites not met for ${tech.name}.`);
        console.info(`Prerequisites not met for ${tech.name}. (v4)`);
        return false;
    }
    if (!canAffordTech(techId)) {
        alert(`Insufficient resources to unlock ${tech.name}.`);
        console.info(`Insufficient resources for ${tech.name}. (v4)`);
        return false;
    }

    // Spend resources
    for (const resourceType in tech.cost) {
        spendResource(resourceType, tech.cost[resourceType]);
    }

    tech.unlocked = true; // Mark as unlocked

    // Handle what this tech unlocks (e.g., building blueprints)
    if (tech.unlocks && Array.isArray(tech.unlocks)) {
        tech.unlocks.forEach(unlockKey => {
            if (unlockKey.startsWith('build_')) {
                const buildingId = unlockKey.replace('build_', '');
                unlockBuildingBlueprint(buildingId); // This function will be in buildings.js
            } else if (unlockKey.startsWith('team_slot_')) {
                // Handle team slot unlocks directly or via a callback
                console.log(`Team slot unlock triggered: ${unlockKey}`);
            }
            // Add more types of unlocks here (e.g., global bonuses, new credit actions)
        });
    }


    if (typeof tech.onUnlock === 'function') {
        tech.onUnlock(); // Execute any specific unlock actions
    }
    console.log(`Technology Unlocked: ${tech.name} (v4)`);

    // Refresh UI
    updateResourceDisplay();
    updateTechTreeDisplay(); // Refresh the tech tree UI
    updateBuildMenu();      // Refresh build menu as new buildings might be available
    // updateCreditActionsDisplay(); // If techs unlock credit actions

    return true;
}


function initTechTree() {
    console.log("Technology Matrix Systems Online (v4)");
    // Future: Load saved tech tree states
}
