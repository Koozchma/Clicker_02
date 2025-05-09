// js/research.js

const researchProjects = {
    basicAutomation: {
        id: 'basicAutomation',
        name: 'Basic Automation',
        description: 'Automates simple manufacturing tasks, improving efficiency.',
        cost: { science: 75, manufacturing: 50 },
        duration: 10, // seconds for research
        unlocked: false,
        requiresScienceUnlock: 'unlockTier1Manufacturing', // From scienceTree
        onComplete: () => {
            console.log("Research: Basic Automation Complete!");
            // Apply effects, e.g., unlock new manufacturing types or boost existing ones
        }
    },
    newMaterialAnalysis: {
        id: 'newMaterialAnalysis',
        name: 'New Material Analysis',
        description: 'Allows the discovery and use of new raw materials for advanced products.',
        cost: { science: 150 },
        duration: 20,
        unlocked: false,
        requiresScienceUnlock: null, // Example: could require a higher tier science unlock
        onComplete: () => {
            console.log("Research: New Material Analysis Complete!");
        }
    }
};

let activeResearch = null;
let researchProgress = 0;
let manufacturingCategories = {
    tier1: false,
    tier2: false,
    // etc.
};

function unlockManufacturingCategory(categoryKey) {
    if (manufacturingCategories.hasOwnProperty(categoryKey)) {
        manufacturingCategories[categoryKey] = true;
        console.log(`Manufacturing Category Unlocked: ${categoryKey}`);
        // This should update the UI to show new manufacturing options.
        // For now, we'll just log. Later, call a UI update function.
        updateResearchDisplay(); // Refresh to show new research options potentially
    }
}


function canStartResearch(projectId) {
    const project = researchProjects[projectId];
    if (!project || project.unlocked || activeResearch) return false;

    // Check science tree unlock requirements
    if (project.requiresScienceUnlock) {
        const scienceUnlock = scienceTree[project.requiresScienceUnlock];
        if (!scienceUnlock || !scienceUnlock.unlocked) {
            console.log(`Research '${project.name}' requires science unlock: ${scienceUnlock ? scienceUnlock.name : project.requiresScienceUnlock}`);
            return false;
        }
    }

    for (const resourceType in project.cost) {
        if (getResource(resourceType) < project.cost[resourceType]) {
            console.log(`Not enough ${resourceType} for research '${project.name}'`);
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
        console.log(`Started research: ${project.name}`);
        updateResourceDisplay();
        updateResearchDisplay(); // Update UI to show research in progress
        return true;
    }
    return false;
}

function updateResearch(deltaTime) { // deltaTime in seconds
    if (activeResearch) {
        researchProgress += deltaTime;
        if (researchProgress >= activeResearch.duration) {
            console.log(`Research complete: ${activeResearch.name}`);
            activeResearch.unlocked = true;
            if (typeof activeResearch.onComplete === 'function') {
                activeResearch.onComplete();
            }
            const completedResearchId = activeResearch.id; // Store before nulling
            activeResearch = null;
            researchProgress = 0;
            updateResearchDisplay(); // Refresh research options
            // Potentially unlock other things based on completedResearchId
        }
    }
}

function initResearch() {
    console.log("Research System Initialized");
    // Load saved research states
}