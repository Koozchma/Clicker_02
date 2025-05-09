// js/ui.js

// Main Resource Display Elements
const energyCountEl = document.getElementById('energy-count');
const energyProductionEl = document.getElementById('energy-production');
const energyConsumptionEl = document.getElementById('energy-consumption');
const energyNetEl = document.getElementById('energy-net');

const manufacturingCountEl = document.getElementById('manufacturing-count');
const materialProductionEl = document.getElementById('material-production');
const materialConsumptionEl = document.getElementById('material-consumption'); // New
const materialNetEl = document.getElementById('material-net');             // New

const coinCountEl = document.getElementById('coin-count');
const creditsProductionEl = document.getElementById('credits-production');
const creditsConsumptionEl = document.getElementById('credits-consumption'); // New
const creditsNetEl = document.getElementById('credits-net');               // New

const scienceCountEl = document.getElementById('science-count');
const researchDataProductionEl = document.getElementById('research-data-production');
const researchDataConsumptionEl = document.getElementById('research-data-consumption'); // New
const researchDataNetEl = document.getElementById('research-data-net');               // New

// Section Elements
const teamSelectionSection = document.getElementById('team-selection');
const teamManagementSection = document.getElementById('team-management');
const techTreeSection = document.getElementById('tech-tree-section');
const buildingSection = document.getElementById('building-section');
const creditActionsSection = document.getElementById('credit-actions-section');

// Team Management Specific
const initialTeamOptionsContainer = document.getElementById('initial-team-options');
const teamMembersContainer = document.getElementById('team-members-container');
const buyMemberButton = document.getElementById('buy-member-button');
const newMemberCostSpan = document.getElementById('new-member-cost');
const toggleOperativeManagementButton = document.getElementById('toggle-operative-management-button'); // New Button

// Other UI Containers
const techTreeContainer = document.getElementById('tech-tree-container');
const buildOptionsContainer = document.getElementById('build-options');
const activeBuildingsListContainer = document.getElementById('active-buildings-list');
const activeBuildingCountEl = document.getElementById('active-building-count');
const creditActionsContainer = document.getElementById('credit-actions-container');


function formatNumber(num, decimals = 2) {
    if (num === null || num === undefined) return '0.00';
    if (Math.abs(num) < 0.005 && num !== 0) return num.toExponential(decimals > 0 ? Math.max(0, decimals -1) : 0);
    if (Math.abs(num) < 1) return num.toFixed(decimals);
    if (Math.abs(num) < 1000) return num.toFixed(decimals);

    const tiers = [
        { divisor: 1e12, suffix: 'T' }, { divisor: 1e9, suffix: 'B' },
        { divisor: 1e6, suffix: 'M' }, { divisor: 1e3, suffix: 'K' }
    ];
    for (const tier of tiers) {
        if (Math.abs(num) >= tier.divisor) {
            return (num / tier.divisor).toFixed(decimals) + tier.suffix;
        }
    }
    return num.toFixed(decimals);
}

function updateResourceDisplay() {
    // Main resource counts
    if(energyCountEl) energyCountEl.textContent = formatNumber(getResource('energy'));
    if(manufacturingCountEl) manufacturingCountEl.textContent = formatNumber(getResource('manufacturing'));
    if(coinCountEl) coinCountEl.textContent = formatNumber(getResource('coin'));
    if(scienceCountEl) scienceCountEl.textContent = formatNumber(getResource('science'));

    // Detailed production/consumption rates
    const teamGen = calculateTeamPassiveGeneration(); // from teams.js
    // totalRates is from resources.js, updated by updateResourceFlowRates
    const currentRates = totalRates;

    // Energy
    const energyProd = (currentRates.energy.production + teamGen.energy);
    const energyCons = currentRates.energy.consumption;
    const energyNet = energyProd - energyCons;
    if(energyProductionEl) energyProductionEl.textContent = formatNumber(energyProd);
    if(energyConsumptionEl) energyConsumptionEl.textContent = formatNumber(energyCons);
    if(energyNetEl) {
        energyNetEl.textContent = formatNumber(energyNet);
        energyNetEl.className = energyNet >= 0 ? 'resource-details positive' : 'resource-details negative';
        if(energyConsumptionEl) energyConsumptionEl.classList.toggle('negative', energyCons > 0);

    }

    // Material
    const materialProd = (currentRates.manufacturing.production + teamGen.manufacturing);
    const materialCons = currentRates.manufacturing.consumption; // Will be 0 for now
    const materialNet = materialProd - materialCons;
    if(materialProductionEl) materialProductionEl.textContent = formatNumber(materialProd);
    if(materialConsumptionEl) materialConsumptionEl.textContent = formatNumber(materialCons);
    if(materialNetEl) {
        materialNetEl.textContent = formatNumber(materialNet);
        materialNetEl.className = materialNet >= 0 ? 'resource-details positive' : 'resource-details negative';
        if(materialConsumptionEl) materialConsumptionEl.classList.toggle('negative', materialCons > 0);
    }


    // Credits
    const creditsProd = (currentRates.coin.production + teamGen.coin);
    const creditsCons = currentRates.coin.consumption; // Will be 0 for now
    const creditsNet = creditsProd - creditsCons;
    if(creditsProductionEl) creditsProductionEl.textContent = formatNumber(creditsProd);
    if(creditsConsumptionEl) creditsConsumptionEl.textContent = formatNumber(creditsCons);
    if(creditsNetEl) {
        creditsNetEl.textContent = formatNumber(creditsNet);
        creditsNetEl.className = creditsNet >= 0 ? 'resource-details positive' : 'resource-details negative';
        if(creditsConsumptionEl) creditsConsumptionEl.classList.toggle('negative', creditsCons > 0);
    }

    // Research Data
    const researchProd = (currentRates.science.production + teamGen.science);
    const researchCons = currentRates.science.consumption; // Will be 0 for now
    const researchNet = researchProd - researchCons;
    if(researchDataProductionEl) researchDataProductionEl.textContent = formatNumber(researchProd);
    if(researchDataConsumptionEl) researchDataConsumptionEl.textContent = formatNumber(researchCons);
    if(researchDataNetEl) {
        researchDataNetEl.textContent = formatNumber(researchNet);
        researchDataNetEl.className = researchNet >= 0 ? 'resource-details positive' : 'resource-details negative';
        if(researchDataConsumptionEl) researchDataConsumptionEl.classList.toggle('negative', researchCons > 0);
    }
}

/**
 * Toggles the visibility of the operative management sections.
 * If no team members, shows initial selection. Otherwise, shows management view.
 */
function toggleOperativeManagementView() {
    const teamMembersExist = getTeamMembers().length > 0;
    const teamSelectionVisible = teamSelectionSection && !teamSelectionSection.classList.contains('hidden-section');
    const teamManagementVisible = teamManagementSection && !teamManagementSection.classList.contains('hidden-section');

    if (teamSelectionVisible || teamManagementVisible) {
        // If either is visible, hide both
        if(teamSelectionSection) teamSelectionSection.classList.add('hidden-section');
        if(teamManagementSection) teamManagementSection.classList.add('hidden-section');
        if(toggleOperativeManagementButton) toggleOperativeManagementButton.textContent = "OPEN OPERATIVE MANAGEMENT";
    } else {
        // If both are hidden, show the appropriate one
        if (teamMembersExist) {
            if(teamManagementSection) teamManagementSection.classList.remove('hidden-section');
            if(teamSelectionSection) teamSelectionSection.classList.add('hidden-section'); // Ensure selection is hidden
        } else {
            if(teamSelectionSection) teamSelectionSection.classList.remove('hidden-section');
            if(teamManagementSection) teamManagementSection.classList.add('hidden-section'); // Ensure management is hidden
        }
        if(toggleOperativeManagementButton) toggleOperativeManagementButton.textContent = "CLOSE OPERATIVE MANAGEMENT";
    }
}


function showSection(sectionId) { // General section toggling, not for team management
    const sections = [
        techTreeSection, buildingSection, creditActionsSection
        // Team sections are handled by toggleOperativeManagementView
    ];
    sections.forEach(sec => {
        if (sec) {
            if (sec.id === sectionId) {
                sec.classList.remove('hidden-section');
                sec.style.display = 'flex';
            } else {
                // This function should not hide other non-managed sections unless explicitly told to.
                // For now, it only shows one of these three.
                // If you want a tab-like system, this logic needs adjustment.
                 // sec.classList.add('hidden-section');
                 // sec.style.display = 'none';
            }
        }
    });
}


function populateInitialTeamChoices() {
    if (!initialTeamOptionsContainer) return;
    initialTeamOptionsContainer.innerHTML = '';
    initialTeamChoices.forEach(choice => {
        const div = document.createElement('div');
        div.classList.add('team-option');
        div.innerHTML = `
            <h4>${choice.name}</h4>
            <p>${choice.description}</p>
            <p><strong>Base Income Contribution/sec:</strong> E:${choice.stats.energy}, M:${choice.stats.manufacturing}, C:${choice.stats.coin}, S:${choice.stats.science}</p>
            <p><strong>Specialization:</strong> ${choice.excelsAt.charAt(0).toUpperCase() + choice.excelsAt.slice(1)}</p>
            <button class="futuristic-button" data-id="${choice.id}">Recruit ${choice.name.split(' ')[0]}</button>
        `;
        div.querySelector('button').addEventListener('click', () => selectInitialTeamMember(choice));
        initialTeamOptionsContainer.appendChild(div);
    });
}

function selectInitialTeamMember(choiceData) {
    const member = addTeamMember(choiceData);
    if (member) {
        // After first pick, hide selection and show management
        if(teamSelectionSection) teamSelectionSection.classList.add('hidden-section');
        if(teamManagementSection) teamManagementSection.classList.remove('hidden-section');
        if(toggleOperativeManagementButton) toggleOperativeManagementButton.textContent = "CLOSE OPERATIVE MANAGEMENT";


        // Make other core sections visible for the first time
        if(techTreeSection && techTreeSection.classList.contains('hidden-section')) techTreeSection.classList.remove('hidden-section');
        if(buildingSection && buildingSection.classList.contains('hidden-section')) buildingSection.classList.remove('hidden-section');
        if(creditActionsSection && creditActionsSection.classList.contains('hidden-section')) creditActionsSection.classList.remove('hidden-section');

        updateAllDynamicDisplays();
    }
}

function updateTeamDisplay() {
    if (!teamMembersContainer) return;
    teamMembersContainer.innerHTML = '';
    const members = getTeamMembers();
    members.forEach(member => {
        const card = document.createElement('div');
        card.classList.add('team-member-card');
        card.innerHTML = `
            <h4>${member.name} <span style="font-size:0.7em; color: #888;">(ID: ${member.id.substring(0,6)})</span></h4>
            <p><strong>Passive Income/sec:</strong> E:${member.stats.energy}, M:${member.stats.manufacturing}, C:${member.stats.coin}, S:${member.stats.science}</p>
            <p><strong>Specialization:</strong> ${member.excelsAt ? member.excelsAt.charAt(0).toUpperCase() + member.excelsAt.slice(1) : 'N/A'}</p>
        `;
        teamMembersContainer.appendChild(card);
    });
}


function updatePurchaseButton() {
    if (buyMemberButton && newMemberCostSpan) {
        newMemberCostSpan.textContent = formatNumber(getNextMemberCost());
        const canBuyAnother = canPurchaseNewMember();
        const enoughCoin = getResource('coin') >= getNextMemberCost();
        const purchaseAbilityUnlocked = (typeof techTreeData !== 'undefined' && techTreeData.unlockTeamSlot2 && techTreeData.unlockTeamSlot2.unlocked);

        if (!canBuyAnother) {
            buyMemberButton.disabled = true;
            buyMemberButton.innerHTML = "OPERATIVE CAPACITY MAX";
        } else if (getTeamMembers().length > 0 && !purchaseAbilityUnlocked) {
            buyMemberButton.disabled = true;
            buyMemberButton.title = "Requires 'Expanded Command Structure' from Technology Matrix.";
            buyMemberButton.innerHTML = `RECRUIT (COST: ${formatNumber(getNextMemberCost())} CREDITS)`;
        } else {
            buyMemberButton.disabled = !enoughCoin;
            buyMemberButton.title = !enoughCoin ? "Insufficient Credits." : "Recruit new operative.";
            buyMemberButton.innerHTML = `RECRUIT (COST: ${formatNumber(getNextMemberCost())} CREDITS)`;
        }
    }
}

function updateTechTreeDisplay() {
    if (!techTreeContainer || typeof techTreeData === 'undefined') return;
    techTreeContainer.innerHTML = '';
    const ul = document.createElement('ul');
    ul.classList.add('skill-tree');

    Object.values(techTreeData).sort((a,b) => (a.tier || 0) - (b.tier || 0) || a.name.localeCompare(b.name)).forEach(tech => {
        const li = document.createElement('li');
        let costString = Object.entries(tech.cost).map(([res, val]) => `${formatNumber(val)} ${res.charAt(0).toUpperCase() + res.slice(1)}`).join(', ');
        let reqString = tech.requires.length > 0 ? `Req: ${tech.requires.map(rId => techTreeData[rId]?.name || rId).join(', ')}` : 'None';
        let unlocksString = "Unlocks: ";
        if (tech.unlocks && tech.unlocks.length > 0) {
            unlocksString += tech.unlocks.map(uk => {
                if (uk.startsWith('build_')) {
                    const buildingId = uk.replace('build_', '');
                    return (typeof buildingBlueprints !== 'undefined' && buildingBlueprints[buildingId]?.name) || uk;
                }
                return uk.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            }).join(', ');
        } else {
            unlocksString += "N/A";
        }

        li.innerHTML = `
            <div>
                <div class="upgrade-info">
                    <strong>${tech.name}</strong> <small class="req-text">(${reqString})</small><br>
                    <small class="desc-text">${tech.description}</small><br>
                    <small class="desc-text">${unlocksString}</small><br>
                    <span class="cost-text">Cost: <strong>${costString}</strong></span>
                </div>
                <button class="futuristic-button" data-id="${tech.id}" ${tech.unlocked ? 'disabled' : ''}>
                    ${tech.unlocked ? 'RESEARCHED' : 'RESEARCH'}
                </button>
            </div>
        `;
        if (!tech.unlocked) {
            const button = li.querySelector('button');
            if (!checkTechRequirements(tech.id) || !canAffordTech(tech.id)) {
                button.disabled = true;
                if (!checkTechRequirements(tech.id)) button.title = "Prerequisites not met.";
                else button.title = "Insufficient resources.";
            }
            button.addEventListener('click', () => unlockTechnology(tech.id));
        }
        ul.appendChild(li);
    });
    techTreeContainer.appendChild(ul);
}

function updateBuildMenu() {
    if (!buildOptionsContainer || typeof buildingBlueprints === 'undefined') return;
    buildOptionsContainer.innerHTML = '';

    Object.values(buildingBlueprints).filter(bp => bp.unlocked).forEach(blueprint => {
        const li = document.createElement('li');
        let costString = Object.entries(blueprint.cost).map(([res, val]) => `${formatNumber(val)} ${res.charAt(0).toUpperCase() + res.slice(1)}`).join(', ');
        let prodString = Object.entries(blueprint.production).map(([res, val]) => `+${formatNumber(val,1)} ${res.charAt(0).toUpperCase() + res.slice(1)}/s`).join(', ');
        let upkeepString = Object.entries(blueprint.upkeep).map(([res, val]) => `-${formatNumber(val,1)} ${res.charAt(0).toUpperCase() + res.slice(1)}/s`).join('; ');
        const currentCount = activeBuildings.filter(b => b.id === blueprint.id).length;
        const maxReached = blueprint.maxAllowed !== undefined && currentCount >= blueprint.maxAllowed;

        li.innerHTML = `
            <div class="build-info">
                <strong>${blueprint.name}</strong> (${currentCount}/${blueprint.maxAllowed === undefined ? '∞' : blueprint.maxAllowed})<br>
                <small class="desc-text">${blueprint.description}</small><br>
                <small class="production-text">Production: <strong>${prodString}</strong></small><br>
                <small class="upkeep-text">Upkeep: <strong>${upkeepString}</strong></small><br>
                <span class="cost-text">Cost: <strong>${costString}</strong></span>
            </div>
            <button class="futuristic-button" data-id="${blueprint.id}" ${maxReached ? 'disabled' : ''}>
                ${maxReached ? 'MAX BUILT' : 'CONSTRUCT'}
            </button>
        `;
        const button = li.querySelector('button');
        if (!maxReached && !canBuild(blueprint.id)) {
            button.disabled = true;
            button.title = "Insufficient resources.";
        }
        if (!maxReached) {
            button.addEventListener('click', () => buildStructure(blueprint.id));
        }
        buildOptionsContainer.appendChild(li);
    });
     if (buildOptionsContainer.children.length === 0) {
        buildOptionsContainer.innerHTML = '<p style="text-align:center; color: var(--text-color-secondary); grid-column: 1 / -1;">No blueprints unlocked. Research new technologies.</p>';
    }
}

function updateActiveBuildingsDisplay() {
    if (!activeBuildingsListContainer || !activeBuildingCountEl) return;
    activeBuildingsListContainer.innerHTML = '';
    const buildings = getActiveBuildings();
    activeBuildingCountEl.textContent = buildings.length;

    if (buildings.length === 0) {
        activeBuildingsListContainer.innerHTML = '<p style="text-align:center; color: var(--text-color-secondary);">No active structures.</p>';
        return;
    }
    const ul = document.createElement('ul');
    ul.classList.add('active-buildings-list-ul');
    buildings.forEach(building => {
        const li = document.createElement('li');
        let prodString = Object.entries(building.production).map(([res, val]) => `+${formatNumber(val,1)} ${res.charAt(0).toUpperCase() + res.slice(1)}/s`).join(', ');
        let upkeepString = Object.entries(building.upkeep).map(([res, val]) => `-${formatNumber(val,1)} ${res.charAt(0).toUpperCase() + res.slice(1)}/s`).join('; ');

        li.innerHTML = `
            <div class="building-info">
                <strong>${building.name}</strong> <small>(ID: ${building.instanceId.slice(-6)})</small><br>
                <small class="production-text">Output: ${prodString}</small><br>
                <small class="upkeep-text">Maintenance: ${upkeepString}</small>
            </div>
        `;
        ul.appendChild(li);
    });
    activeBuildingsListContainer.appendChild(ul);
}

function updateCreditActionsDisplay() {
    if (!creditActionsContainer || typeof creditActionsData === 'undefined') return;
    creditActionsContainer.innerHTML = '';

    Object.values(creditActionsData).forEach(action => {
        const card = document.createElement('div');
        card.classList.add('credit-action-card');
        let costString = Object.entries(action.cost).map(([res, val]) => `${formatNumber(val)} ${res.charAt(0).toUpperCase() + res.slice(1)}`).join(', ');
        let effectDesc = "";
        if (action.type === 'instant_resource_gain') {
            effectDesc = `Instantly gain ${Object.entries(action.effectAmount).map(([res,val]) => `${formatNumber(val)} ${res.charAt(0).toUpperCase() + res.slice(1)}`).join(', ')}.`;
        } else if (action.duration > 0) {
            effectDesc = `Duration: ${action.duration}s.`;
        }

        card.innerHTML = `
            <div class="action-info">
                <strong>${action.name}</strong><br>
                <small class="desc-text">${action.description}</small>
                <small class="desc-text">${effectDesc}</small>
                <span class="cost-text">Cost: <strong>${costString}</strong></span>
                ${action.isActive && action.timeRemaining > 0 ? `<small class="active-effect">Active! Time remaining: ${formatNumber(action.timeRemaining, 0)}s</small>` : ''}
            </div>
            <button class="futuristic-button" data-id="${action.id}" ${action.isActive && action.timeRemaining > 0 ? 'disabled' : ''}>
                ${action.isActive && action.timeRemaining > 0 ? 'ACTIVE' : 'ACTIVATE'}
            </button>
        `;
        const button = card.querySelector('button');
        if (!(action.isActive && action.timeRemaining > 0) && !canAffordCreditAction(action.id)) {
            button.disabled = true;
            button.title = "Insufficient Credits.";
        }
        if (!(action.isActive && action.timeRemaining > 0)) {
           button.addEventListener('click', () => activateCreditAction(action.id));
        }
        creditActionsContainer.appendChild(card);
    });
}

function updateAllDynamicDisplays() {
    updateResourceDisplay();
    updateTeamDisplay();
    updatePurchaseButton();
    updateTechTreeDisplay();
    updateBuildMenu();
    updateActiveBuildingsDisplay();
    updateCreditActionsDisplay();
}

document.addEventListener('DOMContentLoaded', () => {
    if(buyMemberButton) buyMemberButton.addEventListener('click', purchaseNewTeamMember);
    if(toggleOperativeManagementButton) toggleOperativeManagementButton.addEventListener('click', toggleOperativeManagementView);

    // Initially hide sections that are not the resource display or the initial team choice (if applicable)
    if(teamSelectionSection) teamSelectionSection.classList.add('hidden-section');
    if(teamManagementSection) teamManagementSection.classList.add('hidden-section');
    if(techTreeSection) techTreeSection.classList.add('hidden-section');
    if(buildingSection) buildingSection.classList.add('hidden-section');
    if(creditActionsSection) creditActionsSection.classList.add('hidden-section');

    // Set initial button text for operative management
    if(toggleOperativeManagementButton) toggleOperativeManagementButton.textContent = "OPEN OPERATIVE MANAGEMENT";

    // Initial state of buy button if no team members yet.
    if (buyMemberButton && typeof getTeamMembers !== 'undefined' && getTeamMembers().length === 0) {
        buyMemberButton.disabled = true;
    }
});
