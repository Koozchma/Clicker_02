// js/ui.js

// Element selectors
const energyCountEl = document.getElementById('energy-count');
const manufacturingCountEl = document.getElementById('manufacturing-count'); // This ID refers to the span for material count
const coinCountEl = document.getElementById('coin-count');
const scienceCountEl = document.getElementById('science-count');

const teamSelectionSection = document.getElementById('team-selection');
const teamManagementSection = document.getElementById('team-management');
const researchSection = document.getElementById('research-section');
const upgradesSection = document.getElementById('upgrades-section');

const initialTeamOptionsContainer = document.getElementById('initial-team-options');
const teamMembersContainer = document.getElementById('team-members-container');
const buyMemberButton = document.getElementById('buy-member-button');
const newMemberCostSpan = document.getElementById('new-member-cost');

const researchOptionsContainer = document.getElementById('research-options');
const scienceTreeDisplayContainer = document.getElementById('science-tree-container').querySelector('.skill-tree-wrapper');

const characterUpgradeSelect = document.getElementById('character-upgrade-select');
const selectedCharacterTreeContainer = document.getElementById('selected-character-tree');
const manufacturingTreeDisplayContainer = document.getElementById('manufacturing-tree-container').querySelector('.skill-tree-wrapper');
const bankingTreeDisplayContainer = document.getElementById('banking-tree-container').querySelector('.skill-tree-wrapper');

/**
 * Formats a number for display, using suffixes for large numbers (K, M, B, T)
 * and fixed decimal places for smaller numbers.
 * @param {number} num - The number to format.
 * @returns {string} The formatted number string.
 */
function formatNumber(num) {
    if (num === null || num === undefined) return '0.00';
    if (num < 0.005 && num > -0.005 && num !==0) return num.toExponential(2);
    if (Math.abs(num) < 1) return num.toFixed(2);
    if (Math.abs(num) < 1000) return num.toFixed(2);
    
    const tiers = [
        { divisor: 1e12, suffix: 'T' },
        { divisor: 1e9, suffix: 'B' },
        { divisor: 1e6, suffix: 'M' },
        { divisor: 1e3, suffix: 'K' }
    ];
    for (const tier of tiers) {
        if (Math.abs(num) >= tier.divisor) {
            return (num / tier.divisor).toFixed(2) + tier.suffix;
        }
    }
    return num.toFixed(2);
}

/**
 * Updates the resource display elements in the UI with current values.
 */
function updateResourceDisplay() {
    energyCountEl.textContent = formatNumber(getResource('energy'));
    // The ID 'manufacturing-count' is used for the Material display span in HTML
    manufacturingCountEl.textContent = formatNumber(getResource('manufacturing'));
    coinCountEl.textContent = formatNumber(getResource('coin'));
    scienceCountEl.textContent = formatNumber(getResource('science'));
}

/**
 * Shows a specific section and hides others.
 * @param {string} sectionId - The ID of the section to show.
 */
function showSection(sectionId) {
    [teamSelectionSection, teamManagementSection, researchSection, upgradesSection].forEach(sec => {
        if (sec.id === sectionId) {
            sec.classList.remove('hidden-section');
            sec.classList.add('active-section');
        } else {
            sec.classList.add('hidden-section');
            sec.classList.remove('active-section');
        }
    });
}

/**
 * Populates the initial team member choices in the UI.
 */
function populateInitialTeamChoices() {
    initialTeamOptionsContainer.innerHTML = ''; // Clear existing options
    initialTeamChoices.forEach(choice => {
        const div = document.createElement('div');
        div.classList.add('team-option');
        div.innerHTML = `
            <h4>${choice.name}</h4>
            <p>${choice.description}</p>
            <p><strong>Base Stats:</strong> E:${choice.stats.energy}, M:${choice.stats.manufacturing}, C:${choice.stats.coin}, S:${choice.stats.science}</p>
            <p><strong>Specialization:</strong> ${choice.excelsAt.charAt(0).toUpperCase() + choice.excelsAt.slice(1)}</p>
            <button class="futuristic-button" data-id="${choice.id}">Recruit ${choice.name.split(' ')[0]}</button>
        `;
        div.querySelector('button').addEventListener('click', () => selectInitialTeamMember(choice));
        initialTeamOptionsContainer.appendChild(div);
    });
}

/**
 * Handles the selection of an initial team member.
 * @param {object} choiceData - The data object of the chosen team member.
 */
function selectInitialTeamMember(choiceData) {
    const member = addTeamMember(choiceData); // Add to actual team in teams.js
    if (member) {
        // Transition UI state
        teamSelectionSection.classList.add('hidden-section');
        teamSelectionSection.classList.remove('active-section');

        teamManagementSection.classList.remove('hidden-section');
        teamManagementSection.classList.add('active-section');

        researchSection.classList.remove('hidden-section');
        upgradesSection.classList.remove('hidden-section');

        // Update relevant UI parts
        updateTeamDisplay();
        updatePurchaseButton();
        populateCharacterUpgradeSelect();
        updateAllTreesDisplay();
    }
}

/**
 * Updates the display of team members in the UI.
 */
function updateTeamDisplay() {
    teamMembersContainer.innerHTML = ''; // Clear current display
    const members = getTeamMembers();
    members.forEach(member => {
        const card = document.createElement('div');
        card.classList.add('team-member-card');
        card.dataset.memberId = member.id;
        card.innerHTML = `
            <h4>${member.name} <span style="font-size:0.7em; color: #888;">(ID: ${member.id.substring(0,6)})</span></h4>
            <p><strong>Stats:</strong> E:${member.stats.energy}, M:${member.stats.manufacturing}, C:${member.stats.coin}, S:${member.stats.science}</p>
            <p><strong>Specialization:</strong> ${member.excelsAt ? member.excelsAt.charAt(0).toUpperCase() + member.excelsAt.slice(1) : 'N/A'}</p>
            <p><strong>Current Protocol:</strong> <span class="current-assignment">${member.assignment ? member.assignment.toUpperCase() : 'STANDBY'}</span></p>
            <div class="assignment-buttons">
                <button data-task="energy" class="${member.assignment === 'energy' ? 'assigned' : ''}">Energy</button>
                <button data-task="manufacturing" class="${member.assignment === 'manufacturing' ? 'assigned' : ''}">Material</button> {/* Corrected Label */}
                <button data-task="coin" class="${member.assignment === 'coin' ? 'assigned' : ''}">Credits</button>
                <button data-task="science" class="${member.assignment === 'science' ? 'assigned' : ''}">Research</button>
            </div>
        `;
        // Add event listeners to assignment buttons
        card.querySelectorAll('.assignment-buttons button').forEach(button => {
            button.addEventListener('click', (e) => {
                assignMemberToTask(member.id, e.target.dataset.task);
                // updateTeamDisplay() will be called by assignMemberToTask to refresh the state
            });
        });
        teamMembersContainer.appendChild(card);
    });

    // Show/hide character upgrade select based on team members' presence
    if (members.length > 0 && characterUpgradeSelect.classList.contains('hidden')) {
        characterUpgradeSelect.classList.remove('hidden');
    } else if (members.length === 0 && !characterUpgradeSelect.classList.contains('hidden')) {
         characterUpgradeSelect.classList.add('hidden');
    }
    populateCharacterUpgradeSelect(); // Refresh dropdown options
}

/**
 * Updates the state and text of the "Purchase New Member" button.
 */
function updatePurchaseButton() {
    if (buyMemberButton) {
        newMemberCostSpan.textContent = formatNumber(getNextMemberCost());
        const canBuyAnother = canPurchaseNewMember(); // From teams.js - checks max members
        const enoughCoin = getResource('coin') >= getNextMemberCost();
        const purchaseAbilityUnlocked = scienceTree.unlockTeamSlot2 && scienceTree.unlockTeamSlot2.unlocked;

        if (!canBuyAnother) {
            buyMemberButton.disabled = true;
            buyMemberButton.innerHTML = "OPERATIVE CAPACITY MAX";
        } else if (getTeamMembers().length > 0 && !purchaseAbilityUnlocked) {
            // For buying 2nd member onwards, requires the science unlock
            buyMemberButton.disabled = true;
            buyMemberButton.title = "Requires 'Expanded Command Structure' from Tech Matrix.";
            buyMemberButton.innerHTML = `RECRUIT (COST: ${formatNumber(getNextMemberCost())} CREDITS)`;
        } else {
            buyMemberButton.disabled = !enoughCoin;
            buyMemberButton.title = !enoughCoin ? "Insufficient Credits." : "Recruit new operative.";
            buyMemberButton.innerHTML = `RECRUIT (COST: ${formatNumber(getNextMemberCost())} CREDITS)`;
        }
    }
}

/**
 * Populates the dropdown select for choosing a character for upgrades.
 */
function populateCharacterUpgradeSelect() {
    const members = getTeamMembers();
    const currentSelectedValue = characterUpgradeSelect.value; // Preserve selection if possible
    characterUpgradeSelect.innerHTML = '<option value="">-- SELECT OPERATIVE --</option>'; // Default option

    members.forEach(member => {
        const option = document.createElement('option');
        option.value = member.id;
        option.textContent = member.name;
        characterUpgradeSelect.appendChild(option);
    });

    // Try to re-select the previously selected character, or default
    if (members.find(m => m.id === currentSelectedValue)) {
        characterUpgradeSelect.value = currentSelectedValue;
    } else if (members.length > 0) {
        characterUpgradeSelect.value = ""; // Default to "Select Operative" if previous is gone
    } else {
         characterUpgradeSelect.value = ""; // No members, ensure default
    }
    displayCharacterSpecificTree(characterUpgradeSelect.value); // Update tree for current selection
}

/**
 * Displays the specific upgrade tree for the selected character.
 * @param {string} characterId - The ID of the character whose upgrades to display.
 */
function displayCharacterSpecificTree(characterId) {
    selectedCharacterTreeContainer.innerHTML = ''; // Clear previous tree
    if (!characterId) {
        selectedCharacterTreeContainer.innerHTML = '<p style="text-align:center; color: var(--text-color-secondary);">Select an operative to view specific enhancements.</p>';
        return;
    }
    const character = getTeamMembers().find(m => m.id === characterId);
    if (!character) return; // Should not happen if select is populated correctly

    const ul = document.createElement('ul');
    ul.classList.add('skill-tree');
    let hasUpgrades = false;

    // Character-specific upgrades are expected to be on the character object itself (teams.js)
    // Example: character.upgrades = { boostEnergy1: { name: "Energy Focus I", cost: {...}, unlocked: false, ... } }
    if (character.upgrades && Object.keys(character.upgrades).length > 0) {
        for (const upgradeId in character.upgrades) {
            hasUpgrades = true;
            const upgrade = character.upgrades[upgradeId];
            // 'character' treeKey, and pass characterId for specific purchase logic if needed later
            const li = createUpgradeListItem(upgradeId, upgrade, 'character', character.id);
            ul.appendChild(li);
        }
    }

    if (!hasUpgrades) {
        selectedCharacterTreeContainer.innerHTML = `<p style="text-align:center; color: var(--text-color-secondary);">${character.name} has no unique enhancements available yet.</p>`;
    } else {
        selectedCharacterTreeContainer.appendChild(ul);
    }
}

/**
 * Creates an HTML list item element for an upgrade.
 * @param {string} upgradeId - The ID of the upgrade.
 * @param {object} upgrade - The upgrade data object.
 * @param {string} treeKey - The key of the tree this upgrade belongs to ('science', 'manufacturing', etc.).
 * @param {string|null} characterId - Optional character ID if it's a character-specific upgrade.
 * @returns {HTMLLIElement} The created list item.
 */
function createUpgradeListItem(upgradeId, upgrade, treeKey, characterId = null) {
    const li = document.createElement('li');
    let costString = Object.entries(upgrade.cost).map(([res, val]) => `${formatNumber(val)} ${res.charAt(0).toUpperCase() + res.slice(1)}`).join(', ');
    let requirementString = "";
    if (upgrade.requires && upgrade.requires.length > 0) {
        // Attempt to find requirement names from scienceTree or the current treeObject
        requirementString = ` (Req: ${upgrade.requires.map(reqId => {
            const reqInScience = scienceTree[reqId];
            if (reqInScience) return reqInScience.name;
            // Add checks for other trees if requirements can cross trees beyond science
            const treeObject = window[treeKey + 'Tree']; // e.g., window.manufacturingTree
            if (treeObject && treeObject[reqId]) return treeObject[reqId].name;
            return reqId; // Fallback to ID if name not found
        }).join(', ')})`;
    }

    li.innerHTML = `
        <strong>${upgrade.name}</strong><small class="req-text">${requirementString}</small><br>
        <small class="desc-text">${upgrade.description || "No description available."}</small><br>
        <span class="cost-text">Cost: ${costString}</span>
        <button class="futuristic-button" data-id="${upgradeId}" ${upgrade.unlocked ? 'disabled' : ''}>
            ${upgrade.unlocked ? 'ACQUIRED' : 'ACQUIRE'}
        </button>
    `;

    if (!upgrade.unlocked) {
        const button = li.querySelector('button');
        button.addEventListener('click', () => {
            if (treeKey === 'character' && characterId) {
                // This would call a function like purchaseCharacterUpgrade(characterId, upgradeId);
                console.warn(`Character upgrade purchase for ${upgrade.name} (char ID: ${characterId}) needs specific implementation.`);
                alert(`Character upgrade purchasing for "${upgrade.name}" is not fully implemented yet.`);
            } else {
                purchaseUpgrade(treeKey, upgradeId); // General upgrade purchase
            }
        });

        // Determine button disabled state based on requirements and affordability
        let requirementsMet = true;
        if(upgrade.requires && upgrade.requires.length > 0) {
            requirementsMet = upgrade.requires.every(reqId => {
                const reqUp = scienceTree[reqId] || (window[treeKey + 'Tree'] && window[treeKey + 'Tree'][reqId]);
                return reqUp && reqUp.unlocked;
            });
        }
        const affordable = canAffordUpgrade(upgrade); // From upgrades.js

        if(!requirementsMet) {
            button.disabled = true;
            button.title = `Requires: ${upgrade.requires.map(reqId => (scienceTree[reqId]?.name || reqId)).join(', ')}`;
        } else if (!affordable) {
             button.disabled = true;
             button.title = `Insufficient resources.`;
        }
    }
    return li;
}

/**
 * Generic function to update a skill/tech tree display.
 * @param {HTMLElement} container - The HTML element to populate.
 * @param {object} treeObject - The JavaScript object representing the tree.
 * @param {string} treeKey - A string key identifying the tree (e.g., 'science').
 */
function updateTreeDisplay(container, treeObject, treeKey) {
    container.innerHTML = ''; // Clear current content
    const ul = document.createElement('ul');
    ul.classList.add('skill-tree');
    let hasContent = false;
    for (const key in treeObject) {
        if (Object.hasOwnProperty.call(treeObject, key)) {
            hasContent = true;
            const upgrade = treeObject[key];
            const li = createUpgradeListItem(key, upgrade, treeKey);
            ul.appendChild(li);
        }
    }
    if (!hasContent) {
        container.innerHTML = `<p style="text-align:center; color: var(--text-color-secondary);">No ${treeKey} upgrades available yet.</p>`;
    } else {
        container.appendChild(ul);
    }
}

// Specific tree update functions
function updateScienceTreeDisplay() {
    updateTreeDisplay(scienceTreeDisplayContainer, scienceTree, 'science');
}
function updateManufacturingTreeDisplay() {
    // The UI label is "Material", but the tree object might be 'manufacturingTree'
    updateTreeDisplay(manufacturingTreeDisplayContainer, manufacturingTree, 'manufacturing');
}
function updateBankingTreeDisplay() {
    updateTreeDisplay(bankingTreeDisplayContainer, bankingTree, 'banking');
}

/**
 * Updates all skill/tech tree displays and the research options.
 */
function updateAllTreesDisplay() {
    updateScienceTreeDisplay();
    updateManufacturingTreeDisplay();
    updateBankingTreeDisplay();
    displayCharacterSpecificTree(characterUpgradeSelect.value); // Refresh based on current selection
    updateResearchDisplay(); // Research options can depend on tree unlocks
}

/**
 * Updates the display of available and active research projects.
 */
function updateResearchDisplay() {
    researchOptionsContainer.innerHTML = ''; // Clear current options
    const ul = document.createElement('ul');
    ul.classList.add('research-options-list');

    if (activeResearch) { // If a research project is currently active
        const li = document.createElement('li');
        const progressPercent = Math.min(100, (researchProgress / activeResearch.duration) * 100);
        li.innerHTML = `
            <strong>ACTIVE PROJECT: ${activeResearch.name}</strong><br>
            <small>Progress: ${progressPercent.toFixed(1)}% (${researchProgress.toFixed(1)}s / ${activeResearch.duration}s)</small>
            <div class="research-progress-bar-bg">
                <div class="research-progress-bar-fill" style="width: ${progressPercent}%;"></div>
            </div>
        `;
        ul.appendChild(li);
    } else { // Display available research projects
        let availableResearchCount = 0;
        for (const key in researchProjects) {
            if (Object.hasOwnProperty.call(researchProjects, key)) {
                const project = researchProjects[key];
                if (project.unlocked) continue; // Skip already completed research

                // Check if science prerequisites from the tech matrix are met
                let scienceReqMet = true;
                if (project.requiresScienceUnlock) {
                    const scienceUnlock = scienceTree[project.requiresScienceUnlock];
                    if (!scienceUnlock || !scienceUnlock.unlocked) {
                        scienceReqMet = false;
                    }
                }
                if (!scienceReqMet) continue; // Skip if prerequisite not met

                availableResearchCount++;
                const li = document.createElement('li');
                let costString = Object.entries(project.cost).map(([res, val]) => `${formatNumber(val)} ${res.charAt(0).toUpperCase() + res.slice(1)}`).join(', ');
                let prereqString = "";
                if (project.requiresScienceUnlock && scienceTree[project.requiresScienceUnlock]) {
                    prereqString = ` (Requires: ${scienceTree[project.requiresScienceUnlock].name})`;
                }

                li.innerHTML = `
                    <strong>${project.name}</strong><small class="req-text">${prereqString}</small><br>
                    <small class="desc-text">${project.description}</small><br>
                    <span class="cost-text">Cost: ${costString} - Duration: ${project.duration}s</span>
                    <button class="futuristic-button" data-id="${key}">Initiate</button>
                `;
                const button = li.querySelector('button');
                if (!canStartResearch(key)) { // canStartResearch also checks resource cost
                    button.disabled = true;
                    button.title = "Cannot start: Check requirements or resources.";
                }
                button.addEventListener('click', () => startResearch(key));
                ul.appendChild(li);
            }
        }
        if (availableResearchCount === 0 && !activeResearch) {
            ul.innerHTML = '<li><p style="text-align:center; color: var(--text-color-secondary);">No new research projects available. Expand Tech Matrix for more options.</p></li>';
        }
    }
    researchOptionsContainer.appendChild(ul);
}

// Event listener for DOMContentLoaded to initialize UI elements
document.addEventListener('DOMContentLoaded', () => {
    populateInitialTeamChoices();
    updatePurchaseButton(); // Set initial state of purchase button
    buyMemberButton.addEventListener('click', purchaseNewTeamMember);
    characterUpgradeSelect.addEventListener('change', (e) => displayCharacterSpecificTree(e.target.value));

    // Set initial visibility of sections
    teamManagementSection.classList.add('hidden-section');
    researchSection.classList.add('hidden-section');
    upgradesSection.classList.add('hidden-section');
    teamSelectionSection.classList.add('active-section'); // Start with team selection

    // Ensure buy button is disabled initially if conditions aren't met
    const buyButtonInitialCheck = document.getElementById('buy-member-button');
    if (buyButtonInitialCheck) { // Check if element exists
         // Initial state handled by updatePurchaseButton, but ensure it's disabled if no team yet.
        if (getTeamMembers().length === 0) {
            buyButtonInitialCheck.disabled = true;
        }
    }


    updateAllTreesDisplay(); // Populate all trees on load
});
