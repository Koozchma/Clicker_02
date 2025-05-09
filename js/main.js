// js/main.js

const GAME_TICK_MS = 1000;
let lastTickTime = 0;

function gameLoop(currentTime) {
    const rawDeltaTimeMs = currentTime - lastTickTime;
    const deltaTimeS = Math.min(rawDeltaTimeMs / 1000, (GAME_TICK_MS / 1000) * 5);

    if (rawDeltaTimeMs >= GAME_TICK_MS) {
        lastTickTime = currentTime - (rawDeltaTimeMs % GAME_TICK_MS);
        const tickDurationS = GAME_TICK_MS / 1000; // Use fixed tick duration for consistent calculations

        // 1. Calculate passive generation from team members
        const teamPassiveGen = calculateTeamPassiveGeneration(); // from teams.js
        addResource('energy', teamPassiveGen.energy * tickDurationS);
        addResource('manufacturing', teamPassiveGen.manufacturing * tickDurationS);
        addResource('coin', teamPassiveGen.coin * tickDurationS);
        addResource('science', teamPassiveGen.science * tickDurationS);

        // 2. Process production and consumption from buildings
        // This now includes adding produced resources and subtracting energy upkeep
        processBuildingProductionAndConsumption(tickDurationS); // from resources.js (which uses data from buildings.js)

        // 3. Apply very small global passive multiplier (compounding)
        applyGlobalMultiplier(); // from resources.js

        // 4. Update active credit actions (timers, deactivation)
        updateActiveCreditActions(tickDurationS); // from creditActions.js

        // 5. Update UI displays
        // updateResourceDisplay is now more comprehensive
        updateAllDynamicDisplays(); // Central UI update from ui.js

        // console.log('Tick Processed (v4). Resources:', resources);
    }

    requestAnimationFrame(gameLoop);
}

function initGame() {
    console.log("Booting Evolving Clicker Systems v4...");

    initResources();
    initTeams();
    initTechTree();   // Formerly initUpgrades
    initBuildings();  // New
    initCreditActions(); // New

    // Initial UI setup called after all game systems are initialized
    populateInitialTeamChoices();
    updateAllDynamicDisplays(); // This will call all individual UI update functions

    showSection('team-selection'); // Start with team selection

    lastTickTime = performance.now();
    requestAnimationFrame(gameLoop);
    console.log("System Online. Game Loop Initiated. (v4)");
}

document.addEventListener('DOMContentLoaded', initGame);
