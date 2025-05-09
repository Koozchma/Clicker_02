// js/main.js

const GAME_TICK_MS = 1000; // Defines one game "second" in milliseconds
let lastTickTime = 0;      // Timestamp of the last processed game tick

/**
 * The main game loop, called via requestAnimationFrame.
 * @param {DOMHighResTimeStamp} currentTime - The current time provided by requestAnimationFrame.
 */
function gameLoop(currentTime) {
    // Calculate deltaTime in seconds. Cap it to prevent massive jumps after tab inactivity.
    const rawDeltaTimeMs = currentTime - lastTickTime;
    const deltaTimeS = Math.min(rawDeltaTimeMs / 1000, (GAME_TICK_MS / 1000) * 5); // Max 5 ticks catch-up

    // Process a game tick if enough real time has passed
    if (rawDeltaTimeMs >= GAME_TICK_MS) {
        lastTickTime = currentTime - (rawDeltaTimeMs % GAME_TICK_MS); // Adjust lastTickTime to maintain rhythm

        // 1. Calculate base resource generation from team members
        const generation = calculateResourceGeneration(); // From teams.js
        addResource('energy', generation.energy);
        addResource('manufacturing', generation.manufacturing);
        addResource('coin', generation.coin);
        addResource('science', generation.science);

        // 2. Apply the global compounding multiplier to all resources
        applyGlobalMultiplier(); // From resources.js

        // 3. Update progress of any active research
        updateResearch(GAME_TICK_MS / 1000); // Pass fixed tick duration (1s) for research progress - from research.js

        // 4. Update UI displays (selectively for performance if needed, but fine for now)
        updateResourceDisplay(); // Always update resource counts - from ui.js

        // Update other sections only if they are visible or their data likely changed
        if (teamManagementSection.classList.contains('active-section') || teamSelectionSection.classList.contains('active-section')) {
            updateTeamDisplay();        // from ui.js
            updatePurchaseButton();     // from ui.js
        }
        if (researchSection.classList.contains('active-section')) {
            updateResearchDisplay();    // from ui.js
        }
        if (upgradesSection.classList.contains('active-section')) {
            // For simplicity, refresh all trees if the upgrades section is active.
            // More granular updates could be triggered by specific events (e.g., after an upgrade purchase).
            updateAllTreesDisplay();    // from ui.js
        }
        // console.log('Tick Processed. Resources:', resources); // For debugging
    }

    requestAnimationFrame(gameLoop); // Schedule the next frame
}

/**
 * Initializes all game systems and starts the game loop.
 * This is the main entry point after the DOM is loaded.
 */
function initGame() {
    console.log("Booting Evolving Clicker Systems v3...");

    // Initialize core game systems in order of dependency
    initResources();  // Set up resource management and click listeners
    initTeams();      // Set up team structures (if any specific init is needed)
    initUpgrades();   // Define upgrade trees and related functions
    initResearch();   // Set up research projects and logic

    // Initialize UI components that depend on game data structures being ready
    // These functions are from ui.js
    populateInitialTeamChoices(); // Display starting team options
    updateResourceDisplay();      // Show initial resource values (usually 0)
    updateAllTreesDisplay();      // Populate upgrade and tech trees
    updatePurchaseButton();       // Set initial state of the purchase button

    // Set initial visibility of game sections (handled in ui.js DOMContentLoaded for some parts)
    // Ensure team selection is active, others hidden.
    showSection('team-selection');


    // Start the game loop
    lastTickTime = performance.now();
    requestAnimationFrame(gameLoop);
    console.log("System Online. Game Loop Initiated. (v3)");
}

// Wait for the DOM to be fully loaded before initializing the game
document.addEventListener('DOMContentLoaded', initGame);
