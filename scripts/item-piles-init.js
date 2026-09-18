globalThis.ryuCCTools = globalThis.ryuCCTools || {};

Hooks.once("ready", async () => {
    if (!game.user.isGM) return;

    const MARKET_NAME = "Character Creation Market";

    // 1. Exit if the store already exists in the world
    const existingMarket = game.actors.getName(MARKET_NAME);
    if (existingMarket) return;

    console.log(`[Ryu Roller] "${MARKET_NAME}" not found. Loading curated inventory via UUID list...`);

    // 2. Create the clean base merchant NPC
    const marketActor = await Actor.create({
        name: MARKET_NAME,
        type: "npc",
        img: "icons/commodities/currency/coins-shield-sword-stack-silver.webp"
    });

    // 3. Set Item Piles Sheet Flags
    await marketActor.update({
        "flags.item-piles.data": {
            enabled: true,
            type: "merchant",
            infiniteQuantity: true,
            infiniteCurrencies: true,
            keepOnMerchant: true,
            buyPriceModifier: 1.0,
            sellPriceModifier: 1.0
        }
    });

    // 4. Load your curated JSON list of UUID strings
    const response = await fetch(`modules/ryus-cctools/data/market-stock.json`);
    if (!response.ok) {
        ui.notifications.error("Failed to load market-stock.json from the module directory.");
        return;
    }
    const uuidList = await response.json();

    // 5. Dynamic Fetch Loop (Hydrates items automatically using the UUIDs)
    const itemsToAdd = [];
    for (const uuid of uuidList) {
        const itemDoc = await fromUuid(uuid);
        if (itemDoc) {
            const itemData = itemDoc.toObject();
            
            // Safety Check: Ensure the item has an established default system price
            if (itemData.system?.price?.value > 0) {
                // Force a base quantity of 1 so it initializes validly on the actor sheet
                if (!itemData.system.quantity) itemData.system.quantity = 1;
                
                itemsToAdd.push(itemData);
            }
        } else {
            console.warn(`[Ryu Roller] Could not resolve shop item with UUID: ${uuid}`);
        }
    }


    // 6. Batch insert everything cleanly
    if (itemsToAdd.length > 0) {
        await marketActor.createEmbeddedDocuments("Item", itemsToAdd);
        console.log(`[Ryu Roller] Curated store initialization complete. ${itemsToAdd.length} items stocked.`);
        ui.notifications.info(`Successfully created and stocked "${MARKET_NAME}" with your PHB 2024 list!`);
    }
});


/**
 * Public Remote Launcher to manually open the character creation shop
 * @param {Object} context
 * @param {Actor} context.actor - The character actor opening the store interface
 */
globalThis.ryuCCTools.openCreationMarket = function({ actor }) {
    const currentActor = actor;
    if (!currentActor) {
        return ui.notifications.warn("Could not find a valid character to map to the storefront.");
    }
    
    if (game.modules.get("item-piles")?.active) {
        const merchant = game.actors.getName("Character Creation Market");
        if (merchant) {
            game.itempiles.API.renderItemPileInterface(merchant, {
                inspectingActor: currentActor
            });
            console.log(`[Ryu Roller] Remote virtual market hook requested by ${currentActor.name}.`);
        } else {
            console.warn(`[Ryu Roller] Merchant actor "Character Creation Market" was not found in the sidebar directory.`);
        }
    } else {
        ui.notifications.warn("The Item Piles module must be active to utilize the remote equipment storefront.");
    }
};