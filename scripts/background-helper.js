globalThis.ryuCCTools = globalThis.ryuCCTools || {};

/**
 * Master Background Rolling Engine
 * @param {Object} context
 * @param {Actor} context.actor - The character actor document executing the creation routine
 */
globalThis.ryuCCTools.rollBackground = async function({ actor }) {
    const compendiumKey = "ryus-cctools.background-roll-tables";
    const baseTableName = "Backgrounds";

    const currentActor = actor;
    if (!currentActor) {
        return ui.notifications.warn("Could not find a valid character for this feature.");
    }

    // 1. Load your background mapping file dynamically from your module directory
    const responseMap = await fetch(`modules/ryus-cctools/data/background-mappings.json`);
    if (!responseMap.ok) {
        ui.notifications.error("Failed to load background-mappings.json from the module directory.");
        return;
    }
    const backgroundItemDataMap = await responseMap.json();

    // 2. Load your new equipment file dynamically from your module directory
    const responseEquip = await fetch(`modules/ryus-cctools/data/background-equipment.json`);
    if (!responseEquip.ok) {
        ui.notifications.error("Failed to load background-equipment.json from the module directory.");
        return;
    }
    const BACKGROUND_EQUIPMENT_DATA = await responseEquip.json();

    const subBackgroundTableMap = {};

    // 3. Compendium Automation Logic
    const pack = game.packs.get(compendiumKey);
    if (!pack) {
        ui.notifications.error(`Compendium pack "${compendiumKey}" not found!`);
        return;
    }

    const index = await pack.getIndex();
    const baseTableEntry = index.find(t => t.name === baseTableName);
    if (!baseTableEntry) {
        ui.notifications.error(`Main table "${baseTableName}" not found inside compendium.`);
        return;
    }

    const baseTable = await pack.getDocument(baseTableEntry._id);
    const draw = await baseTable.draw();

    if (!draw.results || draw.results.length === 0) return;

    const firstResult = draw.results[0];
    const rolledBackground = firstResult.name ? firstResult.name.trim() : firstResult.text?.trim();

    console.log(`[Ryu Roller] Initial Background Rolled: "${rolledBackground}"`);

    if (rolledBackground && subBackgroundTableMap[rolledBackground]) {
        // Sub-table routing left intact for future design options
    } else {
        await processFinalBackgroundSelection(rolledBackground, currentActor, backgroundItemDataMap, BACKGROUND_EQUIPMENT_DATA);
    }
};

// --- PRIVATE HELPER FUNCTIONS (Scoped internally to isolate operational logic) ---

async function processFinalBackgroundSelection(finalBgName, actor, backgroundItemDataMap, backgroundEquipData) {
    const choiceData = backgroundItemDataMap[finalBgName];
    if (!choiceData) {
        ui.notifications.warn(`No mapping configuration found for "${finalBgName}" inside background-mappings.json.`);
        return;
    }

    if (Array.isArray(choiceData)) {
        // Flavor array choices logic left intact for future variants
    } else {
        await applyBackgroundToActor(actor, choiceData, backgroundEquipData);
    }
}

async function applyBackgroundToActor(actor, targetConfig, backgroundEquipData) {
    const bgItem = await fromUuid(targetConfig.uuid);
    if (!bgItem) {
        ui.notifications.error(`Could not locate background item with UUID: ${targetConfig.uuid}`);
        return;
    }

    const itemData = bgItem.toObject();
    itemData.name = targetConfig.name;
    itemData._id = foundry.utils.randomID();

    // Native v14 syntax for the advancement manager framework configuration
    const manager = dnd5e.applications.advancement.AdvancementManager.forNewItem(actor, itemData);
    
    // Await player completing the stats and origin feat choices
    await new Promise((resolve) => {
        manager.render(true);
        Hooks.once("dnd5e.advancementManagerComplete", (mgr) => {
            if (mgr.actor.id === actor.id) resolve();
        });
        Hooks.once("closeAdvancementManager", (app) => {
            resolve();
        });
    });

    console.log(`[Ryu Roller] Advancement window closed. Unpacking starting equipment from JSON mapping...`);

    // --- AUTOMATED STARTING EQUIPMENT & CURRENCY FETCH FROM DATA FILE ---
    const configData = backgroundEquipData[targetConfig.name];
    if (!configData) {
        console.warn(`[Ryu Roller] No equipment configuration found in JSON for background: ${targetConfig.name}`);
        ui.notifications.info(`Successfully initialized "${targetConfig.name}" background on ${actor.name}'s sheet!`);
        return;
    }

    // 1. Prepare Actor Updates (Currency)
    const updates = {};
    let coinsAddedLog = [];
    if (configData.currency) {
        for (const [denom, amount] of Object.entries(configData.currency)) {
            if (amount && amount > 0) {
                const currentAmount = Number(actor.system.currency?.[denom]) || 0;
                updates[`system.currency.${denom}`] = currentAmount + Number(amount);
                coinsAddedLog.push(`${amount}${denom}`);
            }
        }
    }

    // 2. Prepare Items (Handling names and numeric quantities)
    const itemsToAdd = [];
    if (configData.items && configData.items.length > 0) {
        for (const itemConfig of configData.items) {
            const uuid = itemConfig.uuid;
            const quantity = Number(itemConfig.quantity) || 1; 
            const customName = itemConfig.name;

            const itemDoc = await fromUuid(uuid);
            if (itemDoc) {
                const itemData = itemDoc.toObject();
                
                if (customName) itemData.name = customName;
                if (!itemData.system) itemData.system = {};
                itemData.system.quantity = quantity;

                itemsToAdd.push(itemData);
            } else {
                console.warn(`[Ryu Roller] Could not find item with UUID: ${uuid}`);
            }
        }
    }

    // 3. Batch DB Transactions (Bypasses execution latency and security loops seamlessly)
    if (Object.keys(updates).length > 0) {
        await actor.update(updates);
    }
    if (itemsToAdd.length > 0) {
        await actor.createEmbeddedDocuments("Item", itemsToAdd);
    }

    // 4. Output User Summary
    if (coinsAddedLog.length > 0) {
        ui.notifications.info(`Successfully unpacked all ${targetConfig.name} starting items and currency (${coinsAddedLog.join(", ")}) into your inventory!`);
    } else {
        ui.notifications.info(`Successfully unpacked all ${targetConfig.name} starting items into your inventory!`);
    }

    ui.notifications.info(`Successfully initialized "${targetConfig.name}" background on ${actor.name}'s sheet!`);
};
