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
// Ensure these containers are correctly selected (the '.skill-tree-wrapper' div inside them)
const scienceTreeDisplayContainer = document.getElementById('science-tree-container')?.querySelector('.skill-tree-wrapper');
const manufacturingTreeDisplayContainer = document.getElementById('manufacturing-tree-container')?.querySelector('.skill-tree-wrapper');
const bankingTreeDisplayContainer = document.getElementById('banking-tree-container')?.querySelector('.skill-tree-wrapper');
const selectedCharacterTreeContainer = document.getElementById('selected-character-tree'); // This is already the wrapper
const characterUpgradeSelect = document.getElementById('character-upgrade-select');


/**
 * Formats a number for display, using suffixes for large numbers (K, M, B, T)
 * and fixed decimal places for smaller numbers.
 * @param {number} num - The number to format.
 * @returns {string} The formatted number string.
 */
function formatNumber(num) {
    if (num === null || num === undefined) return '0.00';
    if (num < 0.005 && num > -0.005 && num !==0) return num.toExponential(2); // For very small non-zero numbers
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
    if(energyCountEl) energyCountEl.textContent = formatNumber(getResource('energy'));
    if(manufacturingCountEl) manufacturingCountEl.textContent = formatNumber(getResource('manufacturing'));
    if(coinCountEl) coinCountEl.textContent = formatNumber(getResource('coin'));
    if(scienceCountEl) scienceCountEl.textContent = formatNumber(getResource('science'));
}

/**
 * Shows a specific section and hides others.
 * @param {string} sectionId - The ID of the section to show.
 */
function showSection(sectionId) {
    const sections = [teamSelectionSection, teamManagementSection, researchSection, upgradesSection];
    sections.forEach(sec => {
        if (sec) { // Check if the section element exists
            if (sec.id === sectionId) {
                sec.classList.remove('hidden-section');
                sec.classList.add('active-section');
            } else {
                sec.classList.add('hidden-section');
                sec.classList.remove('active-section');
            }
        }
    });
}

/**
 * Populates the initial team member choices in the UI.
 */
function populateInitialTeamChoices() {
    if (!initialTeamOptionsContainer) return;
    initialTeamOptionsContainer.innerHTML = ''; // Clear existing options
    initialTeamChoices.forEach(choice => { // initialTeamChoices from teams.js
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
    const member = addTeamMember(choiceData); // From teams.js
    if (member) {
        showSection('team-management'); // Show team management after first pick
        // Also make other core sections visible
        if(researchSection) researchSection.classList.remove('hidden-section');
        if(upgradesSection) upgradesSection.classList.remove('hidden-section');


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
    if (!teamMembersContainer) return;
    teamMembersContainer.innerHTML = '';
    const members = getTeamMembers(); // From teams.js
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
                <button data-task="manufacturing" class="${member.assignment === 'manufacturing' ? 'assigned' : ''}">Material</button>
                <button data-task="coin" class="${member.assignment === 'coin' ? 'assigned' : ''}">Credits</button>
                <button data-task="science" class="${member.assignment === 'science' ? 'assigned' : ''}">Research</button>
            </div>
        `;
        card.querySelectorAll('.assignment-buttons button').forEach(button => {
            button.addEventListener('click', (e) => {
                assignMemberToTask(member.id, e.target.dataset.task); // From teams.js
            });
        });
        teamMembersContainer.appendChild(card);
    });

    if (characterUpgradeSelect) {
        if (members.length > 0 && characterUpgradeSelect.classList.contains('hidden')) {
            characterUpgradeSelect.classList.remove('hidden');
        } else if (members.length === 0 && !characterUpgradeSelect.classList.contains('hidden')) {
            characterUpgradeSelect.classList.add('hidden');
        }
    }
    populateCharacterUpgradeSelect();
}


/**
 * Updates the state and text of the "Purchase New Member" button.
 */
function updatePurchaseButton() {
    if (buyMemberButton && newMemberCostSpan) {
        newMemberCostSpan.textContent = formatNumber(getNextMemberCost()); // from teams.js
        const canBuyAnother = canPurchaseNewMember(); // from teams.js
        const enoughCoin = getResource('coin') >= getNextMemberCost(); // from resources.js, teams.js

        // scienceTree must be defined (from upgrades.js)
        const purchaseAbilityUnlocked = (typeof scienceTree !== 'undefined' && scienceTree.unlockTeamSlot2 && scienceTree.unlockTeamSlot2.unlocked);

        if (!canBuyAnother) {
            buyMemberButton.disabled = true;
            buyMemberButton.innerHTML = "OPERATIVE CAPACITY MAX";
        } else if (getTeamMembers().length > 0 && !purchaseAbilityUnlocked) {
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
    if (!characterUpgradeSelect) return;
    const members = getTeamMembers();
    const currentSelectedValue = characterUpgradeSelect.value;
    characterUpgradeSelect.innerHTML = '<option value="">-- SELECT OPERATIVE --</option>';

    members.forEach(member => {
        const option = document.createElement('option');
        option.value = member.id;
        option.textContent = member.name;
        characterUpgradeSelect.appendChild(option);
    });

    if (members.find(m => m.id === currentSelectedValue)) {
        characterUpgradeSelect.value = currentSelectedValue;
    } else {
        characterUpgradeSelect.value = ""; // Default to "Select Operative"
    }
    displayCharacterSpecificTree(characterUpgradeSelect.value);
}

/**
 * Displays the specific upgrade tree for the selected character.
 * @param {string} characterId - The ID of the character whose upgrades to display.
 */
function displayCharacterSpecificTree(characterId) {
    if (!selectedCharacterTreeContainer) return;
    selectedCharacterTreeContainer.innerHTML = '';
    if (!characterId) {
        selectedCharacterTreeContainer.innerHTML = '<p style="text-align:center; color: var(--text-color-secondary);">Select an operative to view specific enhancements.</p>';
        return;
    }
    // getCharacterUpgrades is from upgrades.js, which needs teamMembers from teams.js
    const characterSpecificUpgrades = getCharacterUpgrades(characterId);
    const character = getTeamMembers().find(m => m.id === characterId);


    if (!character) return;

    const ul = document.createElement('ul');
    ul.classList.add('skill-tree');
    let hasUpgrades = false;

    if (characterSpecificUpgrades && Object.keys(characterSpecificUpgrades).length > 0) {
        for (const upgradeId in characterSpecificUpgrades) {
            hasUpgrades = true;
            const upgrade = characterSpecificUpgrades[upgradeId];
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
 * @param {string} treeKey - The key of the tree this upgrade belongs to.
 * @param {string|null} characterId - Optional character ID for character-specific upgrades.
 * @returns {HTMLLIElement} The created list item.
 */
function createUpgradeListItem(upgradeId, upgrade, treeKey, characterId = null) {
    const li = document.createElement('li');
    let costString = Object.entries(upgrade.cost).map(([res, val]) => `${formatNumber(val)} ${res.charAt(0).toUpperCase() + res.slice(1)}`).join(', ');
    let requirementString = "";

    if (upgrade.requires && upgrade.requires.length > 0) {
        requirementString = ` (Req: ${upgrade.requires.map(reqId => {
            // Access trees safely
            const sTree = (typeof scienceTree !== 'undefined') ? scienceTree : {};
            let currentTreeObj;
            switch(treeKey) {
                case 'science': currentTreeObj = sTree; break;
                case 'manufacturing': currentTreeObj = (typeof manufacturingTree !== 'undefined') ? manufacturingTree : {}; break;
                case 'banking': currentTreeObj = (typeof bankingTree !== 'undefined') ? bankingTree : {}; break;
                default: currentTreeObj = {};
            }
            const reqUp = sTree[reqId] || currentTreeObj[reqId];
            return reqUp ? reqUp.name : reqId;
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
                console.warn(`Character upgrade purchase for ${upgrade.name} (char ID: ${characterId}) needs specific implementation.`);
                alert(`Character upgrade purchasing for "${upgrade.name}" is not fully implemented yet.`);
            } else {
                purchaseUpgrade(treeKey, upgradeId); // from upgrades.js
            }
        });

        let requirementsMet = true;
        if(upgrade.requires && upgrade.requires.length > 0) {
            requirementsMet = upgrade.requires.every(reqId => {
                 const sTree = (typeof scienceTree !== 'undefined') ? scienceTree : {};
                 let currentTreeObj;
                 switch(treeKey) {
                    case 'science': currentTreeObj = sTree; break;
                    case 'manufacturing': currentTreeObj = (typeof manufacturingTree !== 'undefined') ? manufacturingTree : {}; break;
                    case 'banking': currentTreeObj = (typeof bankingTree !== 'undefined') ? bankingTree : {}; break;
                    default: currentTreeObj = {};
                 }
                const reqUp = sTree[reqId] || currentTreeObj[reqId];
                return reqUp && reqUp.unlocked;
            });
        }
        const affordable = canAffordUpgrade(upgrade); // from upgrades.js

        if(!requirementsMet) {
            button.disabled = true;
            button.title = `Requires: ${upgrade.requires.map(reqId => ((typeof scienceTree !== 'undefined' && scienceTree[reqId]?.name) || reqId)).join(', ')}`;
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
 * @param {string} treeKey - A string key identifying the tree.
 */
function updateTreeDisplay(container, treeObject, treeKey) {
    if (!container || !treeObject) {
        // console.warn(`updateTreeDisplay: Container or TreeObject is null for ${treeKey}`);
        if(container) container.innerHTML = `<p style="text-align:center; color: var(--text-color-secondary);">Error loading ${treeKey} tree.</p>`;
        return;
    }
    container.innerHTML = '';
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

function updateScienceTreeDisplay() {
    if (typeof scienceTree !== 'undefined') updateTreeDisplay(scienceTreeDisplayContainer, scienceTree, 'science');
    else if(scienceTreeDisplayContainer) scienceTreeDisplayContainer.innerHTML = "<p>Science tree data not loaded.</p>";
}
function updateManufacturingTreeDisplay() {
    if (typeof manufacturingTree !== 'undefined') updateTreeDisplay(manufacturingTreeDisplayContainer, manufacturingTree, 'manufacturing');
     else if(manufacturingTreeDisplayContainer) manufacturingTreeDisplayContainer.innerHTML = "<p>Material tree data not loaded.</p>";
}
function updateBankingTreeDisplay() {
    if (typeof bankingTree !== 'undefined') updateTreeDisplay(bankingTreeDisplayContainer, bankingTree, 'banking');
    else if(bankingTreeDisplayContainer) bankingTreeDisplayContainer.innerHTML = "<p>Credits tree data not loaded.</p>";
}

/**
 * Updates all skill/tech tree displays and the research options.
 */
function updateAllTreesDisplay() {
    updateScienceTreeDisplay();
    updateManufacturingTreeDisplay();
    updateBankingTreeDisplay();
    if (characterUpgradeSelect) displayCharacterSpecificTree(characterUpgradeSelect.value);
    updateResearchDisplay();
}

/**
 * Updates the display of available and active research projects.
 */
function updateResearchDisplay() {
    if (!researchOptionsContainer) return;
    researchOptionsContainer.innerHTML = '';
    const ul = document.createElement('ul');
    ul.classList.add('research-options-list');

    // activeResearch and researchProjects from research.js
    if (activeResearch) {
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
    } else {
        let availableResearchCount = 0;
        if (typeof researchProjects !== 'undefined') { // Ensure researchProjects is loaded
            for (const key in researchProjects) {
                if (Object.hasOwnProperty.call(researchProjects, key)) {
                    const project = researchProjects[key];
                    if (project.unlocked) continue;

                    let scienceReqMet = true;
                    if (project.requiresScienceUnlock) {
                        if (typeof scienceTree === 'undefined' || !scienceTree[project.requiresScienceUnlock] || !scienceTree[project.requiresScienceUnlock].unlocked) {
                            scienceReqMet = false;
                        }
                    }
                    if (!scienceReqMet) continue;

                    availableResearchCount++;
                    const li = document.createElement('li');
                    let costString = Object.entries(project.cost).map(([res, val]) => `${formatNumber(val)} ${res.charAt(0).toUpperCase() + res.slice(1)}`).join(', ');
                    let prereqString = "";
                    if (project.requiresScienceUnlock && (typeof scienceTree !== 'undefined' && scienceTree[project.requiresScienceUnlock])) {
                        prereqString = ` (Requires: ${scienceTree[project.requiresScienceUnlock].name})`;
                    }

                    li.innerHTML = `
                        <strong>${project.name}</strong><small class="req-text">${prereqString}</small><br>
                        <small class="desc-text">${project.description}</small><br>
                        <span class="cost-text">Cost: ${costString} - Duration: ${project.duration}s</span>
                        <button class="futuristic-button" data-id="${key}">Initiate</button>
                    `;
                    const button = li.querySelector('button');
                    if (!canStartResearch(key)) { // from research.js
                        button.disabled = true;
                        button.title = "Cannot start: Check requirements or resources.";
                    }
                    button.addEventListener('click', () => startResearch(key)); // from research.js
                    ul.appendChild(li);
                }
            }
        }
        if (availableResearchCount === 0 && !activeResearch) {
            ul.innerHTML = '<li><p style="text-align:center; color: var(--text-color-secondary);">No new research projects available. Expand Tech Matrix for more options.</p></li>';
        }
    }
    researchOptionsContainer.appendChild(ul);
}

// Event listener for DOMContentLoaded to initialize UI elements that don't depend on game data being fully loaded.
// Core game data dependent UI updates are called from initGame in main.js
document.addEventListener('DOMContentLoaded', () => {
    // Event listeners that can be set up immediately
    if(buyMemberButton) buyMemberButton.addEventListener('click', purchaseNewTeamMember);
    if(characterUpgradeSelect) characterUpgradeSelect.addEventListener('change', (e) => displayCharacterSpecificTree(e.target.value));

    // Initial setup of section visibility (can be refined in initGame if needed)
    // showSection('team-selection'); // initGame will handle this for better control flow.

    // Initial state of buy button if no team members yet.
    // updatePurchaseButton will handle more complex logic once game data is ready.
    if (buyMemberButton && typeof getTeamMembers !== 'undefined' && getTeamMembers().length === 0) {
        buyMemberButton.disabled = true;
    }
});
