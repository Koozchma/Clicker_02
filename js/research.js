// js/research.js

const researchProjects = {
    basicAutomationProtocols: { // Renamed
        id: 'basicAutomationProtocols',
        name: 'Basic Automation Protocols',
        description: 'Improves MATERIEL fabrication efficiency through rudimentary automation.',
        cost: { science: 75, manufacturing: 50 },
        duration: 10, // seconds
        unlocked: false,
        requiresScienceUnlock: 'unlockTier1Manufacturing',
        onComplete: () => {
            console.log("Research Project: Basic Automation Protocols - COMPLETE");
            // Example effect: could unlock a new manufacturing upgrade or provide a small global boost.
        }
    },
    novelMaterialAnalysis: { // Renamed
        id: 'novelMaterialAnalysis',
        name: 'Novel Material Analysis',
        description: 'Initiates study into new composite materials for advanced applications.',
        cost: { science: 150, energy: 25 }, // Added energy cost
        duration: 20,
        unlocked: false,
        requiresScienceUnlock: null, // Or could require a more advanced science unlock later
        onComplete: () => {
            console.log("Research Project: Novel Material Analysis - COMPLETE");
            // Example effect: Unlock a new category of manufacturing or new research options.
        }
    }
};

let activeResearch = null;
let researchProgress = 0; // Tracks time spent on current research
let manufacturingCategories = { // Tracks unlocked manufacturing capabilities
    tier1: false,
    tier2: false,
};

function unlockManufacturingCategory(categoryKey) {
    if (manufacturingCategories.hasOwnProperty(categoryKey)) {
        manufacturingCategories[categoryKey] = true;
        console.log(`Manufacturing Capability Unlocked: ${categoryKey.toUpperCase()}`);
        updateResearchDisplay(); // Refresh to show new research options potentially unlocked by this
    }
}

function canStartResearch(projectId) {
    const project = researchProjects[projectId];
    if (!project || project.unlocked || activeResearch) return false;

    if (project.requiresScienceUnlock) {
        const scienceUnlock = scienceTree[project.requiresScienceUnlock]; // Assumes scienceTree is globally available
        if (!scienceUnlock || !scienceUnlock.unlocked) {
            // console.log(`Research '${project.name}' requires tech matrix unlock: ${scienceUnlock ? scienceUnlock.name : project.requiresScienceUnlock}`);
            return false;
        }
    }
    // Check manufacturing category requirements if any (not implemented in current projects)
    // if (project.requiresManufacturingCategory && !manufacturingCategories[project.requiresManufacturingCategory]) return false;


    for (const resourceType in project.cost) {
        if (getResource(resourceType) < project.cost[resourceType]) {
            // console.log(`Insufficient ${resourceType} for research '${project.name}'`);
            return false;
        }
    }
    return true;
}

function startResearch(projectId) {
    if (canStartResearch(projectId)) {
        const project = researchProjects[projectId];
        for (const resourceType in project.cost) {
            spendResource(resourceType, project.cost[resourceType]);
        }
        activeResearch = project;
        researchProgress = 0;
        console.log(`Initiating Research: ${project.name}`);
        updateResourceDisplay();
        updateResearchDisplay();
        return true;
    }
    return false;
}

function updateResearch(deltaTime) { // deltaTime in seconds
    if (activeResearch) {
        researchProgress += deltaTime;
        if (researchProgress >= activeResearch.duration) {
            console.log(`Research Complete: ${activeResearch.name}`);
            activeResearch.unlocked = true;
            if (typeof activeResearch.onComplete === 'function') {
                activeResearch.onComplete();
            }
            activeResearch = null;
            researchProgress = 0;
            updateResearchDisplay(); // Refresh research options
            // Potentially update other parts of the UI if the research unlocked something major
        }
        // No else needed for UI update here, updateResearchDisplay handles showing progress
    }
}

function initResearch() {
    console.log("R&D Systems Online");
}
