globalThis.ryuCCTools = globalThis.ryuCCTools || {};

/**
 * Executes a class starting wealth roll, applies gold, and opens the shop
 * @param {Object} context
 * @param {Actor} context.actor   - The target character sheet actor
 * @param {String} context.classKey- The exact lookup key from your json file (e.g. "fighter")
 */
globalThis.ryuCCTools.rollStartingWealth = async function({ actor, classKey }) {
    const currentActor = actor;
    if (!currentActor) {
        return ui.notifications.warn("Could not find a valid character to assign gold to.");
    }

    // Fetch your class formula definitions dynamically
    const response = await fetch(`modules/ryus-cctools/data/class-wealth.json`);
    if (!response.ok) {
        ui.notifications.error("Failed to load class-wealth.json from the module directory.");
        return;
    }
    const wealthDataMap = await response.json();

    const config = wealthDataMap[classKey.toLowerCase().trim()];
    if (!config) {
        return ui.notifications.error(`No starting wealth configuration mapped for class key: "${classKey}"`);
    }

    ui.notifications.info(`Rolling starting wealth for ${currentActor.name}...`);

       // --- DYNAMIC CURRENCY COMPILER WITH VISUAL/AUDIO DICE FIXED ---
    const updates = {};
    let totalCoinsLogged = [];

    // Case A: Multi-Currency definition exists
    if (config.currencies) {
        for (const [denom, formula] of Object.entries(config.currencies)) {
            const roll = await new Roll(formula).evaluate();
            const currentAmount = Number(currentActor.system.currency?.[denom]) || 0;
            
            updates[`system.currency.${denom}`] = currentAmount + roll.total;
            totalCoinsLogged.push(`${roll.total}${denom}`);
            
            // FIX: Pass the true roll structure into a standard chat message.
            // This triggers the 3D dice animation and playing the audio effects!
            await roll.toMessage({
                speaker: ChatMessage.getSpeaker({ actor: currentActor }),
                flavor: `<h3>🎲 ${config.label} ${denom.toUpperCase()} Roll</h3>`
            }); 
        }
    } 
    // Case B: Standard fallback (Old single-formula approach defaults to GP)
    else if (config.formula) {
        const roll = await new Roll(config.formula).evaluate();
        const currentGp = Number(currentActor.system.currency?.gp) || 0;
        
        updates["system.currency.gp"] = currentGp + roll.total;
        totalCoinsLogged.push(`${roll.total}gp`);
        
        // FIX: Triggers full 3D visual & sound effects natively
        await roll.toMessage({
            speaker: ChatMessage.getSpeaker({ actor: currentActor }),
            flavor: `<h3>💰 ${config.label} Starting Wealth</h3>`
        });
    }

    // 1. Commit batch database modifications cleanly in one transaction
    if (Object.keys(updates).length > 0) {
        await currentActor.update(updates);
    }

    // 2. Clear notification confirmation
    ui.notifications.info(`Successfully added ${totalCoinsLogged.join(", ")} to your inventory wallet!`);

    // 3. Open Item Piles interface automatically if active
    if (game.modules.get("item-piles")?.active) {
        const merchant = game.actors.getName("Character Creation Market");
        if (merchant) {
            setTimeout(() => {
                // FIX: Swapped to modern game.itempiles.API endpoint architecture
                game.itempiles.API.renderItemPileInterface(merchant, {
                    inspectingActor: currentActor
                });
            }, 250);
        } else {
            console.warn(`[Ryu Roller] Merchant actor "Character Creation Market" was not found in the sidebar directory.`);
        }
    }
};
