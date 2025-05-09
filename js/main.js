// js/main.js

const GAME_TICK_MS = 1000; // 1 second
let lastTickTime = 0;

function gameLoop(currentTime) {
    const deltaTime = (currentTime - lastTickTime) / 1000; // Delta time in seconds

    if (deltaTime >= (GAME_TICK_MS / 1000)) { // Ensure roughly GAME_TICK_MS has passed
        lastTickTime = currentTime;

        // 1. Calculate generation from team members
        const generation = calculateResourceGeneration();
        addResource('energy', generation.energy);
        addResource('manufacturing', generation.manufacturing);
        addResource('coin', generation.coin);
        // Science is gained through other means (e.g., specific tasks, research) for now.
        // addResource('science', baseScienceGeneration);

        // 2. Apply the 1.01x self-multiplier to existing resources
        applyMultiplier();

        // 3. Update active research
        updateResearch(GAME_TICK_MS / 1000); // Pass delta in seconds

        // 4. Update UI
        updateResourceDisplay();
        if (document.getElementById('team-management').classList.contains('active-section')) {
            // Only update these if visible or relevant to prevent unnecessary DOM manipulation
            updateTeamDisplay(); // Could be optimized to only update if team data changed
            updatePurchaseButton();
        }
        if (document.getElementById('research-section').classList.contains('active-section')) {
            updateResearchDisplay(); // Update research progress/options
        }
        if (document.getElementById('upgrades-section').classList.contains('active-section')) {
            updateScienceTreeDisplay(); // Refresh costs/availability
            // update other tree displays if they become dynamic
        }

        // console.log('Tick:', resources); // For debugging
    }

    requestAnimationFrame(gameLoop);
}

// Initialize the game
function initGame() {
    console.log("Initializing Evolving Clicker Game...");
    initResources();
    initUpgrades();
    initResearch();
    // Teams are initialized via UI interaction (initial choice)

    updateResourceDisplay(); // Show initial zeros
    // Initial UI population is handled in ui.js on DOMContentLoaded

    // Start the game loop
    lastTickTime = performance.now();
    requestAnimationFrame(gameLoop);
    console.log("Game Started.");
}

// Wait for the DOM to be fully loaded before starting the game
document.addEventListener('DOMContentLoaded', initGame);