// js/research.js

// Object defining available research projects
const researchProjects = {
    basicAutomationProtocols: {
        id: 'basicAutomationProtocols',
        name: 'Basic Automation Protocols',
        description: 'Improves MATERIAL fabrication efficiency through rudimentary automation. (Effect placeholder)',
        cost: { science: 75, manufacturing: 50 }, // Cost in Research Data and Material
        duration: 10, // Duration in seconds
        unlocked: false, // Whether this research has been completed
        requiresScienceUnlock: 'unlockTier1Manufacturing', // ID of a scienceTree upgrade required
        onComplete: () => {
            console.log("Research Project: Basic Automation Protocols - COMPLETE (v3)");
            // TODO: Implement effects, e.g., unlock new manufacturing upgrades or boost efficiency.
        }
    },
    novelMaterialAnalysis: {
        id: 'novelMaterialAnalysis',
        name: 'Novel Material Analysis',
        description: 'Initiates study into new composite materials for advanced applications. (Effect placeholder)',
        cost: { science: 150, energy: 25 }, // Cost in Research Data and Energy
        duration: 20,
        unlocked: false,
        requiresScienceUnlock: null, // No science tree prerequisite for this example
        onComplete: () => {
            console.log("Research Project: Novel Material Analysis - COMPLETE (v3)");
            // TODO: Implement effects, e.g., unlock new manufacturing categories or research options.
        }
    }
};

let activeResearch = null; // Stores the currently active research project object
let researchProgress = 0;  // Tracks time spent (in seconds) on the active research

// Tracks which manufacturing tiers/categories have been unlocked via research or upgrades
let manufacturingCategories = {
    tier1: false,
    tier2: false,
    // Add more tiers as needed
};

/**
 * Unlocks a specific manufacturing category.
 * @param {string} categoryKey - The key of the category to unlock (e.g., 'tier1').
 */
function unlockManufacturingCategory(categoryKey) {
    if (manufacturingCategories.hasOwnProperty(categoryKey)) {
        manufacturingCategories[categoryKey] = true;
        console.log(`Manufacturing Capability Unlocked: ${categoryKey.toUpperCase()} (v3)`);
        updateResearchDisplay(); // Refresh UI as new research might become available
    } else {
        console.warn(`Attempted to unlock unknown manufacturing category: ${categoryKey} (v3)`);
    }
}

/**
 * Checks if a specific research project can be started.
 * Considers if already unlocked, if another research is active, prerequisites, and resource costs.
 * @param {string} projectId - The ID of the research project.
 * @returns {boolean} True if research can be started, false otherwise.
 */
function canStartResearch(projectId) {
    const project = researchProjects[projectId];
    if (!project) {
        console.warn(`canStartResearch: Project ID '${projectId}' not found. (v3)`);
        return false;
    }
    if (project.unlocked) return false; // Already researched
    if (activeResearch) return false;   // Another research is in progress

    // Check science tree prerequisites
    if (project.requiresScienceUnlock) {
        // 'scienceTree' must be accessible (defined in upgrades.js)
        if (typeof scienceTree === 'undefined' || !scienceTree[project.requiresScienceUnlock] || !scienceTree[project.requiresScienceUnlock].unlocked) {
            return false; // Prerequisite not met
        }
    }

    // Check resource costs
    for (const resourceType in project.cost) {
        if (getResource(resourceType) < project.cost[resourceType]) {
            return false; // Not enough resources
        }
    }
    return true; // All conditions met
}

/**
 * Starts a research project if conditions are met.
 * @param {string} projectId - The ID of the research project to start.
 * @returns {boolean} True if research started successfully, false otherwise.
 */
function startResearch(projectId) {
    if (canStartResearch(projectId)) {
        const project = researchProjects[projectId];
        // Spend resources
        for (const resourceType in project.cost) {
            spendResource(resourceType, project.cost[resourceType]);
        }
        activeResearch = project;
        researchProgress = 0; // Reset progress for the new research
        console.log(`Initiating Research: ${project.name} (v3)`);

        // Update UI
        updateResourceDisplay();
        updateResearchDisplay(); // Show the research in progress
        return true;
    }
    return false;
}

/**
 * Updates the progress of active research. Called each game tick.
 * @param {number} deltaTime - The time elapsed since the last game tick, in seconds.
 */
function updateResearch(deltaTime) {
    if (activeResearch) {
        researchProgress += deltaTime;
        if (researchProgress >= activeResearch.duration) {
            // Research complete
            console.log(`Research Complete: ${activeResearch.name} (v3)`);
            activeResearch.unlocked = true; // Mark as completed
            if (typeof activeResearch.onComplete === 'function') {
                activeResearch.onComplete(); // Execute completion callback
            }
            const completedResearchName = activeResearch.name; // Store before nulling
            activeResearch = null; // Clear active research
            researchProgress = 0;

            updateResearchDisplay(); // Refresh UI to show it's no longer active
            // Potentially trigger other UI updates if the research unlocked major features
            // e.g. updateAllTreesDisplay(); if it unlocked new upgrades
        }
        // No 'else' needed for UI update here, as updateResearchDisplay() will show progress bar
    }
}

/**
 * Initializes the research system.
 */
function initResearch() {
    console.log("R&D Systems Online (v3)");
    // Future: Load saved research states/progress from localStorage.
}
