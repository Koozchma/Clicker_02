// js/ui.js

const energyCountEl = document.getElementById('energy-count');
const manufacturingCountEl = document.getElementById('manufacturing-count');
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


function formatNumber(num) {
    if (num === null || num === undefined) return '0.00';
    if (num < 0.005 && num > -0.005 && num !==0) return num.toExponential(2); // for very small non-zero numbers
    if (Math.abs(num) < 1) return num.toFixed(2); // Show decimals for numbers < 1
    if (Math.abs(num) < 1000) return num.toFixed(2); // Show two decimal places for numbers < 1000
    
    const tiers = [
        { divisor: 1e12, suffix: 'T' }, // Trillion
        { divisor: 1e9, suffix: 'B' },  // Billion
        { divisor: 1e6, suffix: 'M' },  // Million
        { divisor: 1e3, suffix: 'K' }   // Thousand
    ];
    for (const tier of tiers) {
        if (Math.abs(num) >= tier.divisor) {
            return (num / tier.divisor).toFixed(2) + tier.suffix;
        }
    }
    return num.toFixed(2); // Default for numbers < 1000
}

function updateResourceDisplay() {
    energyCountEl.textContent = formatNumber(getResource('energy'));
    manufacturingCountEl.textContent = formatNumber(getResource('manufacturing'));
    coinCountEl.textContent = formatNumber(getResource('coin'));
    scienceCountEl.textContent = formatNumber(getResource('science'));
}

function showSection(sectionId) {
    // This function remains largely the same, ensures only one main content section is active
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

function populateInitialTeamChoices() {
    initialTeamOptionsContainer.innerHTML = '';
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

function selectInitialTeamMember(choiceData) {
    const member = addTeamMember(choiceData);
    if (member) {
        // Show relevant sections after first pick
        teamSelectionSection.classList.add('hidden-section');
        teamSelectionSection.classList.remove('active-section');

        teamManagementSection.classList.remove('hidden-section');
        teamManagementSection.classList.add('active-section');

        researchSection.classList.remove('hidden-section'); // Make R&D available
        upgradesSection.classList.remove('hidden-section'); // Make Upgrades available

        updateTeamDisplay();
        updatePurchaseButton();
        populateCharacterUpgradeSelect();
        updateAllTreesDisplay(); // Update all skill/tech trees
    }
}


function updateTeamDisplay() {
    teamMembersContainer.innerHTML = '';
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
                <button data-task="manufacturing" class="${member.assignment === 'manufacturing' ? 'assigned' : ''}">Materiel</button>
                <button data-task="coin" class="${member.assignment === 'coin' ? 'assigned' : ''}">Credits</button>
                <button data-task="science" class="${member.assignment === 'science' ? 'assigned' : ''}">Research</button>
            </div>
        `;
        card.querySelectorAll('.assignment-buttons button').forEach(button => {
            button.addEventListener('click', (e) => {
                assignMemberToTask(member.id, e.target.dataset.task);
            });
        });
        teamMembersContainer.appendChild(card);
    });

    if (members.length > 0 && characterUpgradeSelect.classList.contains('hidden')) {
        characterUpgradeSelect.classList.remove('hidden');
    } else if (members.length === 0 && !characterUpgradeSelect.classList.contains('hidden')) {
         characterUpgradeSelect.classList.add('hidden');
    }
    populateCharacterUpgradeSelect();
}


function updatePurchaseButton() {
    if (buyMemberButton) {
        newMemberCostSpan.textContent = formatNumber(getNextMemberCost());
        const canBuy = canPurchaseNewMember();
        const enoughCoin = getResource('coin') >= getNextMemberCost();
        // Check if the science unlock for purchasing members (beyond the first free one) is achieved
        const purchaseUnlocked = scienceTree.unlockTeamSlot2 && scienceTree.unlockTeamSlot2.unlocked;

        if (!canBuy) {
            buyMemberButton.disabled = true;
            buyMemberButton.innerHTML = "OPERATIVE CAPACITY MAX"; // Changed text
        } else if (getTeamMembers().length > 0 && !purchaseUnlocked) { // If trying to buy 2nd+ member but not unlocked
            buyMemberButton.disabled = true;
            buyMemberButton.title = "Requires 'Expanded Command Structure' from Tech Matrix.";
            buyMemberButton.innerHTML = `RECRUIT (COST: ${formatNumber(getNextMemberCost())} CREDITS)`;
        }
        else {
            buyMemberButton.disabled = !enoughCoin;
            buyMemberButton.title = !enoughCoin ? "Insufficient Credits." : "Recruit new operative.";
            buyMemberButton.innerHTML = `RECRUIT (COST: ${formatNumber(getNextMemberCost())} CREDITS)`;
        }
    }
}


function populateCharacterUpgradeSelect() {
    const members = getTeamMembers();
    const currentSelected = characterUpgradeSelect.value;
    characterUpgradeSelect.innerHTML = '<option value="">-- SELECT OPERATIVE --</option>';
    members.forEach(member => {
        const option = document.createElement('option');
        option.value = member.id;
        option.textContent = member.name;
        characterUpgradeSelect.appendChild(option);
    });

    if (members.find(m => m.id === currentSelected)) {
        characterUpgradeSelect.value = currentSelected;
    } else if (members.length > 0) {
        characterUpgradeSelect.value = ""; // Default to "Select Operative"
    } else {
         characterUpgradeSelect.value = "";
    }
    displayCharacterSpecificTree(characterUpgradeSelect.value);
}

function displayCharacterSpecificTree(characterId) {
    selectedCharacterTreeContainer.innerHTML = '';
    if (!characterId) {
        selectedCharacterTreeContainer.innerHTML = '<p style="text-align:center; color: var(--text-color-secondary);">Select an operative to view specific enhancements.</p>';
        return;
    }
    const character = getTeamMembers().find(m => m.id === characterId);
    if (!character) return;

    // Placeholder for character-specific upgrades. These would be defined on the character object.
    // Example: character.upgrades = { boostEnergy1: { name: "Energy Focus I", ... } }
    const ul = document.createElement('ul');
    ul.classList.add('skill-tree');
    let hasUpgrades = false;

    // This part needs actual upgrade definitions on character objects in teams.js
    // For now, it will likely be empty.
    if (character.upgrades && Object.keys(character.upgrades).length > 0) {
        for (const upgradeId in character.upgrades) {
            hasUpgrades = true;
            const upgrade = character.upgrades[upgradeId];
            const li = createUpgradeListItem(upgradeId, upgrade, 'character', character.id); // Pass charId for specific purchase
            ul.appendChild(li);
        }
    }

    if (!hasUpgrades) {
        selectedCharacterTreeContainer.innerHTML = `<p style="text-align:center; color: var(--text-color-secondary);">${character.name} has no unique enhancements available yet.</p>`;
    } else {
        selectedCharacterTreeContainer.appendChild(ul);
    }
}

function createUpgradeListItem(upgradeId, upgrade, treeKey, characterId = null) {
    const li = document.createElement('li');
    let costString = Object.entries(upgrade.cost).map(([res, val]) => `${formatNumber(val)} ${res.charAt(0).toUpperCase() + res.slice(1)}`).join(', ');
    let requirementString = "";
    if (upgrade.requires && upgrade.requires.length > 0) {
        requirementString = ` (Req: ${upgrade.requires.map(reqId => (scienceTree[reqId]?.name || reqId)).join(', ')})`;
    }

    li.innerHTML = `
        <strong>${upgrade.name}</strong><small class="req-text">${requirementString}</small><br>
        <small class="desc-text">${upgrade.description}</small><br>
        <span class="cost-text">Cost: ${costString}</span>
        <button class="futuristic-button" data-id="${upgradeId}" ${upgrade.unlocked ? 'disabled' : ''}>
            ${upgrade.unlocked ? 'ACQUIRED' : 'ACQUIRE'}
        </button>
    `;

    if (!upgrade.unlocked) {
        const button = li.querySelector('button');
        button.addEventListener('click', () => {
            if (treeKey === 'character' && characterId) {
                // purchaseCharacterUpgrade(characterId, upgradeId); // Needs implementation
                alert(`Character upgrade purchase for ${upgrade.name} not fully implemented.`);
            } else {
                purchaseUpgrade(treeKey, upgradeId);
            }
        });

        let reqsMet = true;
        if(upgrade.requires && upgrade.requires.length > 0) {
            reqsMet = upgrade.requires.every(reqId => {
                const reqUp = scienceTree[reqId] || (window[treeKey + 'Tree'] && window[treeKey + 'Tree'][reqId]);
                return reqUp && reqUp.unlocked;
            });
        }
        const affordable = canAffordUpgrade(upgrade);

        if(!reqsMet) {
            button.disabled = true;
            button.title = `Requires: ${upgrade.requires.map(reqId => (scienceTree[reqId]?.name || reqId)).join(', ')}`;
        } else if (!affordable) {
             button.disabled = true;
             button.title = `Insufficient resources.`;
        }
    }
    return li;
}


function updateTreeDisplay(container, treeObject, treeKey) {
    container.innerHTML = '';
    const ul = document.createElement('ul');
    ul.classList.add('skill-tree');
    let hasContent = false;
    for (const key in treeObject) {
        hasContent = true;
        const upgrade = treeObject[key];
        const li = createUpgradeListItem(key, upgrade, treeKey);
        ul.appendChild(li);
    }
    if (!hasContent) {
        container.innerHTML = `<p style="text-align:center; color: var(--text-color-secondary);">No ${treeKey} upgrades available yet.</p>`;
    } else {
        container.appendChild(ul);
    }
}

function updateScienceTreeDisplay() {
    updateTreeDisplay(scienceTreeDisplayContainer, scienceTree, 'science');
}
function updateManufacturingTreeDisplay() {
    updateTreeDisplay(manufacturingTreeDisplayContainer, manufacturingTree, 'manufacturing');
}
function updateBankingTreeDisplay() {
    updateTreeDisplay(bankingTreeDisplayContainer, bankingTree, 'banking');
}
function updateAllTreesDisplay() {
    updateScienceTreeDisplay();
    updateManufacturingTreeDisplay();
    updateBankingTreeDisplay();
    displayCharacterSpecificTree(characterUpgradeSelect.value); // Refresh current character tree
    updateResearchDisplay(); // Research options might depend on tree unlocks
}


function updateResearchDisplay() {
    researchOptionsContainer.innerHTML = '';
    const ul = document.createElement('ul');
    ul.classList.add('research-options-list');

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
        for (const key in researchProjects) {
            const project = researchProjects[key];
            if (project.unlocked) continue;

            let scienceReqMet = true;
            if (project.requiresScienceUnlock) {
                const scienceUnlock = scienceTree[project.requiresScienceUnlock];
                if (!scienceUnlock || !scienceUnlock.unlocked) {
                    scienceReqMet = false;
                }
            }
            if (!scienceReqMet) continue;

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
            if (!canStartResearch(key)) {
                button.disabled = true;
                button.title = "Cannot start: Check requirements or resources.";
            }
            button.addEventListener('click', () => startResearch(key));
            ul.appendChild(li);
        }
        if (availableResearchCount === 0 && !activeResearch) {
            ul.innerHTML = '<li><p style="text-align:center; color: var(--text-color-secondary);">No new research projects available. Expand Tech Matrix for more options.</p></li>';
        }
    }
    researchOptionsContainer.appendChild(ul);
}


document.addEventListener('DOMContentLoaded', () => {
    populateInitialTeamChoices();
    updatePurchaseButton();
    buyMemberButton.addEventListener('click', purchaseNewTeamMember);
    characterUpgradeSelect.addEventListener('change', (e) => displayCharacterSpecificTree(e.target.value));

    teamManagementSection.classList.add('hidden-section');
    researchSection.classList.add('hidden-section');
    upgradesSection.classList.add('hidden-section');
    teamSelectionSection.classList.add('active-section');

    const buyButtonInitialCheck = document.getElementById('buy-member-button');
    if (buyButtonInitialCheck) buyButtonInitialCheck.disabled = true;

    updateAllTreesDisplay(); // Initial population of all trees
});
