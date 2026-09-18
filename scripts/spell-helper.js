globalThis.ryuCCTools = globalThis.ryuCCTools || {};

/**
 * Modern Spell Picker via native 5e Compendium Browser Filters
 * @param {Object} context
 * @param {Actor} context.actor             - The target character sheet actor
 * @param {String} context.classIdentifier   - E.g., "warlock", "wizard", "cleric"
 * @param {Number} context.spellLevel        - 0 for Cantrip, 1 for Level 1, etc.
 */
globalThis.ryuCCTools.launchSpellPicker = async function({ actor, classIdentifier = "warlock", spellLevel = 0 }) {
    const currentActor = actor;
    if (!currentActor) {
        return ui.notifications.warn("Could not find a valid character to map spells onto.");
    }

    // 1. Initialize the system's native core Compendium Browser application instance
    const browser = new dnd5e.applications.CompendiumBrowser();

    // 2. Open the browser and programmatically intercept the active tab and filter arrays
    // We force open the "spells" tab index instantly
    await browser.render(true, { tab: "spells" });

    // 3. Inject our search filtering rules directly into the live browser UI state
    // We target the class list string and the requested spell slot level integer
    setTimeout(() => {
        // Toggles the specific class list page registry filter tag
        browser.activateTab("spells");
        
        // Formulate the modern dictionary properties for the browser engine query
        const searchFilters = {
            "system.level": { [spellLevel]: true },
            "spellList": { [classIdentifier.toLowerCase().trim()]: true }
        };

        // Inject the filter data model straight into the application state object
        browser.filters.spells = searchFilters;

        // Force the browser UI component to re-render the matching cards grid instantly
        browser.render(false);
        
        ui.notifications.info(`Opened Compendium Browser pre-filtered for ${classIdentifier} Level ${spellLevel} spells!`);
    }, 100); 
};


// --- AUTOMATED HOOK FOR LONG RESTS ---
Hooks.on("dnd5e.restCompleted", async (actor, restData) => {
    if (restData.type !== "long" || !actor.hasPlayerOwner) return;
    
    console.log(`[Ryu Roller] Long Rest detected. Prompting spell options framework for ${actor.name}...`);
    await ryuCCTools.launchSpellPicker({ actor: actor });
});
