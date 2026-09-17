globalThis.ryuCCTools = globalThis.ryuCCTools || {};

/**
 * Master Stat Rolling Engine
 * @param {Object} context
 * @param {Actor} context.actor       - The character actor document
 * @param {Item} context.item         - The feature item triggering the macro
 * @param {String} context.statKey     - E.g., "str", "dex", "con"
 * @param {String} context.mode        - "standard" or "hardcore" (Defaults to "standard")
 */

globalThis.ryuCCTools.rollStat = async function({ actor, item, statKey = "str", mode = "standard" }) {
    // Dynamically generate the full name capitalized
    const STAT_NAMES = {
        str: "Strength",
        dex: "Dexterity",
        con: "Constitution",
        int: "Intelligence",
        wis: "Wisdom",
        cha: "Charisma"
    };
    const STAT_NAME = STAT_NAMES[statKey] || "Unknown Stat";

    // Use the explicit actor passed from the sheet context
    const currentActor = actor;
    if (!currentActor) {
        return ui.notifications.warn("Could not find a valid character for this feature.");
    }

    // --- DETERMINE DICE & RULES BY LEVEL & MODE ---
    const charLevel = currentActor.system.details.level ?? 1;
    const currentStatValue = currentActor.system.abilities[statKey]?.value ?? 0;

    // Default to standard Level 1 formula
    let diceFormula = "4d6kh3"; 
    let rollTypeTitle = `Base ${STAT_NAME} Roll`;
    
    // Check for hardcore mode
    if (mode === "hardcore") {
        diceFormula = "3d6";
    }
    
    // Check if this is a stat re-roll.
    if (charLevel > 1) {
        diceFormula = "3d6"; // Level 2+ is always 3d6 regardless of mode
        rollTypeTitle = `${STAT_NAME} Re-roll`;
    }

    // 1. Roll the dynamically selected formula
    let r = await new Roll(diceFormula).evaluate();

    // 2. Universal Scout: Scan EVERYTHING for the designated attribute bonuses
    let totalAsiBonus = 0;
    for (let currentItem of currentActor.items) {
        const advancements = currentItem.system.advancement || [];
        for (let adv of advancements) {
            if (adv.type === "AbilityScoreImprovement" && adv.value?.assignments) {
                let assignedBonus = adv.value.assignments[statKey] || 0;
                totalAsiBonus += assignedBonus;
            }
        }
    }

    // 3. Add the gathered total back on top of the roll
    let finalStatValue = r.total + totalAsiBonus;
    let shouldUpdate = true;
    let flavorNote = `Total Saved to Sheet: <strong>${finalStatValue}</strong>`;

    // Apply high-level safety rules
    if (charLevel > 1) {
        if (finalStatValue > currentStatValue) {
            flavorNote = `New score (${finalStatValue}) is higher than current (${currentStatValue}). <strong>Sheet Updated!</strong>`;
            ui.notifications.info(`Stat upgraded to ${finalStatValue}!`);
        } else {
            shouldUpdate = false;
            flavorNote = `New score (${finalStatValue}) is NOT higher than current (${currentStatValue}). <strong>Sheet kept unchanged.</strong>`;
            ui.notifications.warn(`Re-roll (${finalStatValue}) was lower or equal. No change made.`);
        }
    }

    // 4. Output the full audit breakdown to Chat
    await r.toMessage({
        flavor: `<h3>${rollTypeTitle}</h3>
        <p>Dice Total (${diceFormula}): <strong>${r.total}</strong></p>
        <p>Total Saved ASI/Background Bonuses: <strong>+${totalAsiBonus}</strong></p>
        <hr>
        <p>${flavorNote}</p>`
    });

    // 5. Safely update the sheet database only if criteria are met
    if (shouldUpdate) {
        await currentActor.update({[`system.abilities.${statKey}.value`]: finalStatValue});
    }
};
