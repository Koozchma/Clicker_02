// js/teams.js

let teamMembers = [];
const MAX_TEAM_MEMBERS = 7;
let nextMemberCost = 100; // Initial cost for the second member

const initialTeamChoices = [
    {
        id: 'alpha_01',
        name: 'Jax "Sparky" Volkov',
        stats: { energy: 3, manufacturing: 1, coin: 1, science: 1 },
        excelsAt: 'energy',
        description: 'A brilliant engineer, always tinkering. Excels at energy harvesting.',
        cost: 0, // First one is free
        assignment: null, // 'energy', 'manufacturing', 'coin'
        upgrades: {} // Character specific upgrades
    },
    {
        id: 'beta_01',
        name: 'Lyra "Forge" Chen',
        stats: { energy: 1, manufacturing: 3, coin: 1, science: 1 },
        excelsAt: 'manufacturing',
        description: 'Master craftswoman with an eye for efficiency. Excels at manufacturing.',
        cost: 0,
        assignment: null,
        upgrades: {}
    },
    {
        id: 'gamma_01',
        name: 'Silas "Goldfinger" Sterling',
        stats: { energy: 1, manufacturing: 1, coin: 3, science: 1 },
        excelsAt: 'coin',
        description: 'A shrewd negotiator with a knack for finding profit. Excels at coin generation.',
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
        const newMember = { ...memberData, id: `${memberData.name.split(' ')[0]}_${Date.now()}`, assignment: null, upgrades: {} };
        teamMembers.push(newMember);
        if (teamMembers.length > 1) { // First member is free
            nextMemberCost = Math.floor(nextMemberCost * 1.8); // Increase cost for the next one
        }
        console.log(`${newMember.name} added to the team.`);
        return newMember;
    }
    console.log("Maximum team members reached.");
    return null;
}

function assignMemberToTask(memberId, task) { // task: 'energy', 'manufacturing', 'coin'
    const member = teamMembers.find(m => m.id === memberId);
    if (member) {
        member.assignment = task;
        console.log(`${member.name} assigned to ${task}.`);
        updateTeamDisplay(); // Refresh UI
        return true;
    }
    return false;
}

function getMemberContribution(member, taskType) {
    let contribution = 1; // Base contribution
    if (member.stats && member.stats[taskType]) {
        contribution = member.stats[taskType]; // Use base stat for the task
    }
    if (member.excelsAt === taskType) {
        contribution *= 1.5; // Bonus for excelling (example)
    }
    // Later, add effects from character-specific upgrades
    // e.g., if (member.upgrades.someUpgrade) contribution *= upgradeBonus;
    return contribution;
}

function calculateResourceGeneration() {
    let energyGeneration = 0;
    let manufacturingGeneration = 0;
    let coinGeneration = 0;

    teamMembers.forEach(member => {
        if (member.assignment) {
            const contribution = getMemberContribution(member, member.assignment);
            switch (member.assignment) {
                case 'energy':
                    energyGeneration += contribution;
                    break;
                case 'manufacturing':
                    manufacturingGeneration += contribution;
                    break;
                case 'coin':
                    coinGeneration += contribution;
                    break;
            }
        }
    });

    return { energy: energyGeneration, manufacturing: manufacturingGeneration, coin: coinGeneration };
}

function canPurchaseNewMember() {
    return teamMembers.length < MAX_TEAM_MEMBERS;
}

function getNextMemberCost() {
    return nextMemberCost;
}

function purchaseNewTeamMember() {
    if (canPurchaseNewMember() && spendResource('coin', getNextMemberCost())) {
        // For now, let's add a generic member. Later, this could be a choice.
        const newMemberData = {
            name: `Recruit #${teamMembers.length +1}`,
            stats: { energy: 1, manufacturing: 1, coin: 1, science: 0.5 }, // Lesser stats for purchased ones initially
            excelsAt: null, // Can be specialized later
            description: 'A new recruit, eager to learn.',
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
    console.log("Cannot purchase new member. Not enough coins or team is full.");
    return null;
}