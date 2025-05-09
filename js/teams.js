// js/teams.js

// Array to store active team members
let teamMembers = []; // This is the single source of truth for team members
const MAX_TEAM_MEMBERS = 7; // Maximum number of operatives allowed
let nextMemberCost = 100; // Initial cost in Credits for the second operative

// Predefined choices for the first free team member
const initialTeamChoices = [
    {
        id: 'alpha_01',
        name: 'Jax "Spark" Volkov',
        stats: { energy: 3, manufacturing: 1, coin: 1, science: 1 },
        excelsAt: 'energy',
        description: 'Energy systems specialist. Boosts ENERGY output.',
        cost: 0, // First operative is free
        assignment: null, // Current task: 'energy', 'manufacturing', 'coin', 'science', or null
        upgrades: {} // Placeholder for character-specific upgrades
    },
    {
        id: 'beta_01',
        name: 'Lyra "Forge" Chen',
        stats: { energy: 1, manufacturing: 3, coin: 1, science: 1 },
        excelsAt: 'manufacturing',
        description: 'Material fabrication expert. Boosts MATERIAL output.',
        cost: 0,
        assignment: null,
        upgrades: {}
    },
    {
        id: 'gamma_01',
        name: 'Silas "Broker" Sterling',
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

/**
 * Returns the array of current team members.
 * @returns {Array<object>} The list of team members.
 */
function getTeamMembers() {
    return teamMembers;
}

/**
 * Adds a new member to the team if not at max capacity.
 * @param {object} memberData - The data for the new member.
 * @returns {object|null} The newly added member object or null if failed.
 */
function addTeamMember(memberData) {
    if (teamMembers.length < MAX_TEAM_MEMBERS) {
        // Create a new member object, ensuring a unique ID and default properties
        const newMember = {
            ...memberData,
            id: `${memberData.name.split(' ')[0].toLowerCase()}_${Date.now()}`, // Unique ID
            assignment: null,
            upgrades: {} // Initialize empty upgrades object
        };
        teamMembers.push(newMember);

        // Increase cost for the next operative if this isn't the first free one
        if (teamMembers.length > 1) { // Cost increase applies after the first (free) member
            nextMemberCost = Math.floor(nextMemberCost * 1.75);
        }
        console.log(`Operative ${newMember.name} recruited. (v3)`);
        return newMember;
    }
    console.warn("Maximum operative capacity reached. Cannot add new member. (v3)");
    return null;
}

/**
 * Assigns a team member to a specific task.
 * @param {string} memberId - The ID of the member to assign.
 * @param {string} task - The task to assign ('energy', 'manufacturing', 'coin', 'science').
 * @returns {boolean} True if assignment was successful, false otherwise.
 */
function assignMemberToTask(memberId, task) {
    const member = teamMembers.find(m => m.id === memberId);
    if (member) {
        member.assignment = task;
        console.log(`${member.name} assigned to ${task.toUpperCase()} protocol. (v3)`);
        updateTeamDisplay(); // Refresh UI to show new assignment
        return true;
    }
    console.warn(`Failed to assign task: Member with ID ${memberId} not found. (v3)`);
    return false;
}

/**
 * Calculates the resource contribution of a member for a given task.
 * @param {object} member - The team member object.
 * @param {string} taskType - The type of task.
 * @returns {number} The calculated contribution amount.
 */
function getMemberContribution(member, taskType) {
    let contribution = 1; // Base contribution per tick if no specific stat
    if (member.stats && member.stats[taskType] !== undefined) {
        contribution = member.stats[taskType];
    }
    if (member.excelsAt === taskType) {
        contribution *= 1.5; // 50% bonus if member excels at the task
    }
    // TODO: Factor in character-specific upgrades that might boost this contribution
    return contribution;
}

/**
 * Calculates the total per-second generation for all resources based on team assignments.
 * @returns {object} An object containing the total generation for each resource type.
 */
function calculateResourceGeneration() {
    let generation = {
        energy: 0,
        manufacturing: 0,
        coin: 0,
        science: 0
    };

    teamMembers.forEach(member => {
        if (member.assignment) {
            const contribution = getMemberContribution(member, member.assignment);
            if (generation.hasOwnProperty(member.assignment)) {
                generation[member.assignment] += contribution;
            }
        }
    });
    return generation;
}

/**
 * Checks if a new team member can be purchased (i.e., team is not full).
 * @returns {boolean} True if a new member can be purchased.
 */
function canPurchaseNewMember() {
    return teamMembers.length < MAX_TEAM_MEMBERS;
}

/**
 * Gets the cost for the next team member.
 * @returns {number} The cost in Credits.
 */
function getNextMemberCost() {
    return nextMemberCost;
}

/**
 * Attempts to purchase a new team member.
 * Spends Credits if successful and adds a generic new recruit.
 * @returns {object|null} The newly purchased member or null if failed.
 */
function purchaseNewTeamMember() {
    if (canPurchaseNewMember() && spendResource('coin', getNextMemberCost())) {
        // Define a generic new recruit; could be expanded to offer choices later
        const newMemberData = {
            name: `Operative Unit ${teamMembers.length + 1}`, // Generic name
            stats: { energy: 1, manufacturing: 1, coin: 1, science: 1 }, // Base stats
            excelsAt: null, // No specialization initially
            description: 'A versatile operative unit, awaiting specialization.',
            cost: getNextMemberCost() // Store the cost they were purchased at (optional)
        };
        const addedMember = addTeamMember(newMemberData);
        if (addedMember) {
            // Update UI after successful purchase
            updateTeamDisplay();
            updateResourceDisplay();
            updatePurchaseButton(); // Cost for the *next* one will now be higher
        }
        return addedMember;
    }
    console.warn("Recruitment failed: Insufficient CREDITS or operative capacity full. (v3)");
    return null;
}

/**
 * Initializes the team management system.
 * (Currently, no specific initialization actions are needed here beyond global setup)
 */
function initTeams() {
    // This function can be expanded if teams need specific setup on game load.
    console.log("Team Management Systems Online (v3)");
}
