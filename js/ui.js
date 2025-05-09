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
const scienceTreeContainer = document.getElementById('science-tree-container').querySelector('div'); // Get the inner div

const characterUpgradeSelect = document.getElementById('character-upgrade-select');
const selectedCharacterTreeContainer = document.getElementById('selected-character-tree');
const manufacturingTreeContainer = document.getElementById('manufacturing-tree-container').querySelector('div');
const bankingTreeContainer = document.getElementById('banking-tree-container').querySelector('div');


function formatNumber(num) {
    if (num < 1000) return num.toFixed(2);
    if (num < 1000000) return (num / 1000).toFixed(2) + 'K';
    if (num < 1000000000) return (num / 1000000).toFixed(2) + 'M';
    return (num / 1000000000).toFixed(2) + 'B';
}

function updateResourceDisplay() {
    energyCountEl.textContent = formatNumber(getResource('energy'));
    manufacturingCountEl.textContent = formatNumber(getResource('manufacturing'));
    coinCountEl.textContent = formatNumber(getResource('coin'));
    scienceCountEl.textContent = formatNumber(getResource('science'));
}

function showSection(sectionId) {
    teamSelectionSection.classList.remove('active-section');
    teamManagementSection.classList.remove('active-section');
    researchSection.classList.remove('active-section');
    upgradesSection.classList.remove('active-section');

    teamSelectionSection.classList.add('hidden-section');
    teamManagementSection.classList.add('hidden-section');
    researchSection.classList.add('hidden-section');
    upgradesSection.classList.add('hidden-section');

    const sectionToShow = document.getElementById(sectionId);
    if (sectionToShow) {
        sectionToShow.classList.remove('hidden-section');
        sectionToShow.classList.add('active-section');
    }
}

function populateInitialTeamChoices() {
    initialTeamOptionsContainer.innerHTML = ''; // Clear existing options
    initialTeamChoices.forEach(choice => {
        const div = document.createElement('div');
        div.classList.add('team-option');
        div.innerHTML = `
            <h4>${choice.name}</h4>
            <p>${choice.description}</p>
            <p><strong>Stats:</strong> E:${choice.stats.energy}, M:${choice.stats.manufacturing}, C:${choice.stats.coin}, S:${choice.stats.science}</p>
            <p><strong>Excels at:</strong> ${choice.excelsAt.charAt(0).toUpperCase() + choice.excelsAt.slice(1)}</p>
            <button data-id="${choice.id}">Select ${choice.name.split(' ')[0]}</button>
        `;
        div.querySelector('button').addEventListener('click', () => selectInitialTeamMember(choice));
        initialTeamOptionsContainer.appendChild(div);
    });
}

function selectInitialTeamMember(choiceData) {
    const member = addTeamMember(choiceData); // Add to our actual team
    if (member) {
        showSection('team-management');
        showSection('research-section'); // Show research after first pick
        showSection('upgrades-section'); // Show upgrades after first pick

        teamSelectionSection.classList.add('hidden-section');
        teamSelectionSection.classList.remove('active-section');

        teamManagementSection.classList.remove('hidden-section');
        teamManagementSection.classList.add('active-section');

        researchSection.classList.remove('hidden-section');
        // researchSection.classList.add('active-section'); // Decided to show T.M. first

        upgradesSection.classList.remove('hidden-section');
        // upgradesSection.classList.add('active-section');

        updateTeamDisplay();
        updatePurchaseButton();
        populateCharacterUpgradeSelect();
        updateScienceTreeDisplay(); // Initial population of science tree
        updateResearchDisplay(); // Initial population of research options
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
            <h4>${member.name} <span style="font-size:0.8em; color: #aaa;">(ID: ${member.id.substring(0,6)})</span></h4>
            <p><strong>Stats:</strong> E:${member.stats.energy}, M:${member.stats.manufacturing}, C:${member.stats.coin}, S:${member.stats.science}</p>
            <p><strong>Excels at:</strong> ${member.excelsAt ? member.excelsAt.charAt(0).toUpperCase() + member.excelsAt.slice(1) : 'N/A'}</p>
            <p><strong>Current Assignment:</strong> <span class="current-assignment">${member.assignment || 'None'}</span></p>
            <div class="assignment-buttons">
                <button data-task="energy" class="${member.assignment === 'energy' ? 'assigned' : ''}">Assign Energy</button>
                <button data-task="manufacturing" class="${member.assignment === 'manufacturing' ? 'assigned' : ''}">Assign Manufacturing</button>
                <button data-task="coin" class="${member.assignment === 'coin' ? 'assigned' : ''}">Assign Coin</button>
            </div>
        `;
        card.querySelectorAll('.assignment-buttons button').forEach(button => {
            button.addEventListener('click', (e) => {
                assignMemberToTask(member.id, e.target.dataset.task);
                // Button active state is handled by re-rendering updateTeamDisplay
            });
        });
        teamMembersContainer.appendChild(card);
    });

    if (members.length > 0 && characterUpgradeSelect.classList.contains('hidden')) {
        characterUpgradeSelect.classList.remove('hidden');
    } else if (members.length === 0) {
         characterUpgradeSelect.classList.add('hidden');
    }
    populateCharacterUpgradeSelect(); // Refresh dropdown
}


function updatePurchaseButton() {
    if (buyMemberButton) {
        newMemberCostSpan.textContent = formatNumber(getNextMemberCost());
        if (canPurchaseNewMember()) {
            const scienceUnlockForPurchase = scienceTree.unlockTeamSlot2; // Check if the research to allow purchasing is done
            if (getTeamMembers().length === 0) { // First member is free, button shouldn't be for purchase
                 buyMemberButton.disabled = true;
            } else if (scienceUnlockForPurchase && !scienceUnlockForPurchase.unlocked && getTeamMembers().length >= 1) {
                buyMemberButton.disabled = true; // Disabled until researched
                buyMemberButton.title = "Requires 'Expanded Team Rosters' research.";
            }
            else {
                 buyMemberButton.disabled = getResource('coin') < getNextMemberCost();
                 buyMemberButton.title = buyMemberButton.disabled ? "Not enough coin." : "";
            }
        } else {
            buyMemberButton.disabled = true;
            buyMemberButton.textContent = "Team Full";
        }
    }
}


function populateCharacterUpgradeSelect() {
    const members = getTeamMembers();
    const currentSelected = characterUpgradeSelect.value;
    characterUpgradeSelect.innerHTML = '<option value="">-- Select Character --</option>';
    members.forEach(member => {
        const option = document.createElement('option');
        option.value = member.id;
        option.textContent = member.name;
        characterUpgradeSelect.appendChild(option);
    });
    if (members.find(m => m.id === currentSelected)) {
        characterUpgradeSelect.value = currentSelected;
    } else if (members.length > 0) {
        characterUpgradeSelect.value = members[0].id; // Select first if previous is gone or none
    }
    displayCharacterSpecificTree(characterUpgradeSelect.value); // Display tree for current selection
}

function displayCharacterSpecificTree(characterId) {
    selectedCharacterTreeContainer.innerHTML = '';
    if (!characterId) {
        selectedCharacterTreeContainer.innerHTML = '<p>Select a character to see their unique upgrades.</p>';
        return;
    }
    const character = getTeamMembers().find(m => m.id === characterId);
    if (!character) return;

    // Placeholder: Actual character upgrades will be defined in teams.js on the character object
    // For now, let's assume a structure like:
    // character.upgrades = {
    //    boostEnergy1: { name: "Energy Focus I", cost: {coin: 50}, unlocked: false, effect: () => character.stats.energy *=1.1 }
    // }
    let hasUpgrades = false;
    const ul = document.createElement('ul');
    ul.classList.add('skill-tree');

    for (const upgradeId in character.upgrades) {
        hasUpgrades = true;
        const upgrade = character.upgrades[upgradeId];
        const li = document.createElement('li');
        li.innerHTML = `
            <strong>${upgrade.name}</strong> - Cost: ${Object.entries(upgrade.cost).map(([res, val]) => `${val} ${res}`).join(', ')}
            <p>${upgrade.description || ""}</p>
            <button data-id="${upgradeId}" ${upgrade.unlocked ? 'disabled' : ''}>${upgrade.unlocked ? 'Unlocked' : 'Purchase'}</button>
        `;
        if (!upgrade.unlocked) {
            li.querySelector('button').addEventListener('click', () => {
                // Need a purchaseCharacterUpgrade function in teams.js or upgrades.js
                // purchaseCharacterUpgrade(character.id, upgradeId);
                console.log(`Attempt to purchase char upgrade: ${character.id} - ${upgradeId}`);
                alert("Character upgrade purchasing not fully implemented yet.");
            });
        }
        ul.appendChild(li);
    }

    if (!hasUpgrades) {
        selectedCharacterTreeContainer.innerHTML = `<p>${character.name} has no specific upgrades available yet.</p>`;
    } else {
        selectedCharacterTreeContainer.appendChild(ul);
    }
}


function updateScienceTreeDisplay() {
    scienceTreeContainer.innerHTML = '';
    const ul = document.createElement('ul');
    ul.classList.add('skill-tree');
    for (const key in scienceTree) {
        const upgrade = scienceTree[key];
        const li = document.createElement('li');
        let costString = Object.entries(upgrade.cost).map(([res, val]) => `${val} ${res}`).join(', ');
        let requirementString = "";
        if (upgrade.requires && upgrade.requires.length > 0) {
            requirementString = ` (Req: ${upgrade.requires.map(reqId => scienceTree[reqId]?.name || reqId).join(', ')})`;
        }

        li.innerHTML = `
            <strong>${upgrade.name}</strong> ${requirementString}<br>
            <small>${upgrade.description}</small><br>
            Cost: ${costString}
            <button data-id="${key}" ${upgrade.unlocked ? 'disabled' : ''}>
                ${upgrade.unlocked ? 'Researched' : 'Research'}
            </button>
        `;
        if (!upgrade.unlocked) {
            const button = li.querySelector('button');
            button.addEventListener('click', () => purchaseUpgrade('science', key));
            // Check if requirements are met to enable/disable button more finely
            let reqsMet = true;
            if(upgrade.requires) {
                reqsMet = upgrade.requires.every(reqId => scienceTree[reqId] && scienceTree[reqId].unlocked);
            }
            if(!reqsMet) {
                button.disabled = true;
                button.title = `Requires: ${upgrade.requires.map(reqId => scienceTree[reqId]?.name || reqId).join(', ')}`;
            } else if (!canAffordUpgrade(upgrade)) {
                 button.disabled = true;
                 button.title = `Not enough resources.`;
            }

        }
        ul.appendChild(li);
    }
    scienceTreeContainer.appendChild(ul);
}


function updateResearchDisplay() {
    researchOptionsContainer.innerHTML = '';
    const ul = document.createElement('ul');
    ul.classList.add('research-options-list');

    if (activeResearch) {
        const li = document.createElement('li');
        const progressPercent = (researchProgress / activeResearch.duration) * 100;
        li.innerHTML = `
            <strong>Researching: ${activeResearch.name}</strong><br>
            Progress: ${progressPercent.toFixed(1)}%
            <div style="width: 100%; background-color: #555; border-radius: 3px; margin-top: 5px;">
                <div style="width: ${progressPercent}%; background-color: #fca311; height: 10px; border-radius: 3px;"></div>
            </div>
        `;
        ul.appendChild(li);
    } else {
        let availableResearchCount = 0;
        for (const key in researchProjects) {
            const project = researchProjects[key];
            if (project.unlocked) continue; // Skip already completed research

            // Check if science prerequisites are met
            let scienceReqMet = true;
            if (project.requiresScienceUnlock) {
                const scienceUnlock = scienceTree[project.requiresScienceUnlock];
                if (!scienceUnlock || !scienceUnlock.unlocked) {
                    scienceReqMet = false;
                }
            }
             // Check if the manufacturing category is unlocked for this research (if applicable)
            let manuCategoryMet = true;
            // Example: if (project.requiresManufacturingCategory && !manufacturingCategories[project.requiresManufacturingCategory]) {
            //    manuCategoryMet = false
            // }


            if (!scienceReqMet || !manuCategoryMet) continue; // Skip if prerequisites not met

            availableResearchCount++;
            const li = document.createElement('li');
            let costString = Object.entries(project.cost).map(([res, val]) => `${val} ${res}`).join(', ');
            let prereqString = "";
            if (project.requiresScienceUnlock && scienceTree[project.requiresScienceUnlock]) {
                prereqString = ` (Requires: ${scienceTree[project.requiresScienceUnlock].name})`;
            }

            li.innerHTML = `
                <strong>${project.name}</strong> ${prereqString}<br>
                <small>${project.description}</small><br>
                Cost: ${costString} - Duration: ${project.duration}s
                <button data-id="${key}">Start Research</button>
            `;
            const button = li.querySelector('button');
            if (!canStartResearch(key)) { // This also checks resource cost
                button.disabled = true;
                button.title = "Cannot start: Check requirements or resources.";
            }
            button.addEventListener('click', () => startResearch(key));
            ul.appendChild(li);
        }
        if (availableResearchCount === 0 && !activeResearch) {
            ul.innerHTML = '<li>No new research projects available at this time. Try unlocking more via the Science Tree.</li>';
        }
    }
    researchOptionsContainer.appendChild(ul);
}


// Initial setup calls
document.addEventListener('DOMContentLoaded', () => {
    populateInitialTeamChoices();
    updatePurchaseButton(); // Initially disable if needed
    buyMemberButton.addEventListener('click', purchaseNewTeamMember);
    characterUpgradeSelect.addEventListener('change', (e) => displayCharacterSpecificTree(e.target.value));

    // Initially hide sections that are not team selection
    teamManagementSection.classList.add('hidden-section');
    researchSection.classList.add('hidden-section');
    upgradesSection.classList.add('hidden-section');
    teamSelectionSection.classList.add('active-section'); // Start here

    // The 'buy-member-button' should be disabled until the specific research 'unlockTeamSlot2' is completed.
    // This is handled in updatePurchaseButton by checking scienceTree.unlockTeamSlot2.unlocked.
    // And the scienceTree.unlockTeamSlot2 onUnlock callback will enable it.
    const buyButtonInitialCheck = document.getElementById('buy-member-button');
    if (buyButtonInitialCheck) buyButtonInitialCheck.disabled = true; // Ensure it starts disabled.

});