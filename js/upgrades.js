// js/teams.js

let teamMembers = [];
const MAX_TEAM_MEMBERS = 7;
let nextMemberCost = 100; // Initial cost for the second member (Credits)

const initialTeamChoices = [
    {
        id: 'alpha_01',
        name: 'Jax "Spark" Volkov', // Shortened name
        stats: { energy: 3, manufacturing: 1, coin: 1, science: 1 },
        excelsAt: 'energy',
        description: 'Energy systems specialist. Boosts ENERGY output.',
        cost: 0,
        assignment: null,
        upgrades: {}
    },
    {
        id: 'beta_01',
        name: 'Lyra "Forge" Chen',
        stats: { energy: 1, manufacturing: 3, coin: 1, science: 1 },
        excelsAt: 'manufacturing',
        description: 'Materiel fabrication expert. Boosts MATERIEL output.',
        cost: 0,
        assignment: null,
        upgrades: {}
    },
    {
        id: 'gamma_01',
        name: 'Silas "Broker" Sterling', // Changed nickname
        stats: { energy: 1, manufacturing: 1, coin: 3, science: 1 },
        excelsAt: 'coin',
        description: 'Economic strategist. Boosts CREDITS acquisition.',
        cost: 0,
        assignment: null,
        upgrades: {}
    },
    {
        id: 'delta_01',
        name: 'Dr. Aris "Insight" Thorne',
        stats: { energy: 1, manufacturing: 1, coin: 1, science: 3 },
        excelsAt: 'science',
        description: 'Lead researcher. Boosts RESEARCH DATA generation.',
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
        if (teamMembers.length > 1) {
            nextMemberCost = Math.floor(nextMemberCost * 1.75); // Slightly adjusted cost curve
        }
        console.log(`Operative ${newMember.name} recruited.`);
        return newMember;
    }
    console.log("Maximum operative capacity reached.");
    return null;
}

function assignMemberToTask(memberId, task) { // task: 'energy', 'manufacturing', 'coin', 'science'
    const member = teamMembers.find(m => m.id === memberId);
    if (member) {
        member.assignment = task;
        console.log(`${member.name} assigned to ${task.toUpperCase()} protocol.`);
        updateTeamDisplay(); // Refresh UI
        return true;
    }
    return false;
}

function getMemberContribution(member, taskType) {
    let contribution = 1; // Base contribution per tick
    if (member.stats && member.stats[taskType]) {
        contribution = member.stats[taskType];
    }
    if (member.excelsAt === taskType) {
        contribution *= 1.5; // 50% bonus for excelling
    }
    // TODO: Add effects from character-specific upgrades
    // e.g., if (member.upgrades.someUpgradeForTaskType) contribution *= upgradeBonus;
    return contribution;
}

function calculateResourceGeneration() {
    let energyGeneration = 0;
    let manufacturingGeneration = 0;
    let coinGeneration = 0;
    let scienceGeneration = 0;

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
                case 'science':
                    scienceGeneration += contribution;
                    break;
            }
        }
    });

    return {
        energy: energyGeneration,
        manufacturing: manufacturingGeneration,
        coin: coinGeneration,
        science: scienceGeneration
    };
}

function canPurchaseNewMember() {
    return teamMembers.length < MAX_TEAM_MEMBERS;
}

function getNextMemberCost() {
    return nextMemberCost;
}

function purchaseNewTeamMember() {
    if (canPurchaseNewMember() && spendResource('coin', getNextMemberCost())) {
        const newMemberData = {
            name: `Operative Unit ${teamMembers.length + 1}`,
            stats: { energy: 1, manufacturing: 1, coin: 1, science: 1 }, // Generic stats for purchased ones
            excelsAt: null,
            description: 'A versatile operative unit, awaiting specialization.',
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
    console.log("Recruitment failed: Insufficient CREDITS or operative capacity full.");
    return null;
}
