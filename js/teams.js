// js/teams.js

let teamMembers = [];
const MAX_TEAM_MEMBERS = 7;
let nextMemberCost = 100;

const initialTeamChoices = [
    {
        id: 'alpha_01',
        name: 'Jax "Spark" Volkov',
        stats: { energy: 0.3, manufacturing: 0.1, coin: 0.1, science: 0.1 }, // Stats are now per/sec contribution
        excelsAt: 'energy',
        description: 'Energy systems specialist. Provides a base ENERGY income.',
        cost: 0,
        assignment: null,
        upgrades: {}
    },
    {
        id: 'beta_01',
        name: 'Lyra "Forge" Chen',
        stats: { energy: 0.1, manufacturing: 0.3, coin: 0.1, science: 0.1 },
        excelsAt: 'manufacturing',
        description: 'Material fabrication expert. Provides a base MATERIAL income.',
        cost: 0,
        assignment: null,
        upgrades: {}
    },
    {
        id: 'gamma_01',
        name: 'Silas "Broker" Sterling',
        stats: { energy: 0.1, manufacturing: 0.1, coin: 0.3, science: 0.1 },
        excelsAt: 'coin',
        description: 'Economic strategist. Provides a base CREDITS income.',
        cost: 0,
        assignment: null,
        upgrades: {}
    },
    {
        id: 'delta_01',
        name: 'Dr. Aris "Insight" Thorne',
        stats: { energy: 0.1, manufacturing: 0.1, coin: 0.1, science: 0.3 },
        excelsAt: 'science',
        description: 'Lead researcher. Provides a base RESEARCH DATA income.',
        cost: 0,
        assignment: null,
        upgrades: {}
    }
];

function getTeamMembers() {
    return teamMembers;
}

function addTeamMember(memberData) {
    if (teamMembers.length < MAX_TEAM_MEMBERS) {
        const newMember = {
            ...memberData,
            id: `${memberData.name.split(' ')[0].toLowerCase()}_${Date.now()}`,
            assignment: null, // Operatives now primarily provide a *passive* bonus based on their stats when recruited.
                              // Assignment could be re-introduced for specialized tasks or boosts later.
            upgrades: {}
        };
        teamMembers.push(newMember);
        if (teamMembers.length > 1) {
            nextMemberCost = Math.floor(nextMemberCost * 1.75);
        }
        console.log(`Operative ${newMember.name} recruited. (v4)`);
        // Recalculate passive bonuses when a new member is added.
        // This function will be part of the main loop or called explicitly.
        return newMember;
    }
    console.warn("Maximum operative capacity reached. (v4)");
    return null;
}

// Operative assignment to specific tasks is being de-emphasized in favor of buildings.
// Operatives now provide a small global passive income based on their stats.
// The assignMemberToTask function can be removed or repurposed if assignments get a new role.
/*
function assignMemberToTask(memberId, task) {
    const member = teamMembers.find(m => m.id === memberId);
    if (member) {
        member.assignment = task;
        console.log(`${member.name} assigned to ${task.toUpperCase()} protocol. (v4)`);
        updateTeamDisplay();
        return true;
    }
    return false;
}
*/

/**
 * Calculates the total passive resource generation from all recruited team members.
 * This is a flat per-second bonus, not tied to specific assignments anymore.
 * @returns {object} An object with per-second generation rates for each resource.
 */
function calculateTeamPassiveGeneration() {
    let passiveGeneration = {
        energy: 0,
        manufacturing: 0,
        coin: 0,
        science: 0
    };
    teamMembers.forEach(member => {
        for (const stat in member.stats) {
            if (passiveGeneration.hasOwnProperty(stat)) {
                let bonus = member.stats[stat];
                if (member.excelsAt === stat) {
                    bonus *= 1.5; // 50% bonus if member excels in that area
                }
                passiveGeneration[stat] += bonus;
            }
        }
    });
    return passiveGeneration;
}


function canPurchaseNewMember() {
    return teamMembers.length < MAX_TEAM_MEMBERS;
}

function getNextMemberCost() {
    return nextMemberCost;
}

function purchaseNewTeamMember() {
    // Ensure scienceTree is available for the check
    if (typeof scienceTree === 'undefined' || !scienceTree.unlockTeamSlot2) {
        console.error("Tech Tree for team slot unlock not available!");
        alert("Error: Prerequisite data for team expansion not loaded.");
        return null;
    }

    if (canPurchaseNewMember() &&
        scienceTree.unlockTeamSlot2.unlocked && // Check if tech is unlocked
        spendResource('coin', getNextMemberCost())) {
        const newMemberData = {
            name: `Operative Unit ${teamMembers.length + 1}`,
            stats: { energy: 0.05, manufacturing: 0.05, coin: 0.05, science: 0.05 }, // Purchased members are less specialized initially
            excelsAt: null,
            description: 'A standard operative unit, contributing to overall passive income.',
            cost: getNextMemberCost()
        };
        const added = addTeamMember(newMemberData);
        if (added) {
            updateTeamDisplay();
            updateResourceDisplay();
            updatePurchaseButton();
        }
        return added;
    }
    console.warn("Recruitment failed. Check prerequisites, credits, or team capacity. (v4)");
    return null;
}

function initTeams() {
    console.log("Team Management Systems Online (v4)");
}
