globalThis.ryuCCTools = globalThis.ryuCCTools || {};

Hooks.once("ready", async () => {
    if (!game.user.isGM) return;

    const MARKET_NAME = "Character Creation Market";

    const existingMarket = game.actors.getName(MARKET_NAME);
    if (existingMarket) return;

    console.log(`[Ryu Roller] "${MARKET_NAME}" not found. Commencing automated shop initialization...`);
    ui.notifications.info(`Building "${MARKET_NAME}" framework for character creation...`);

    // FIX: Swapped to an absolute standard core SVG icon to resolve the 404 error
    const marketActor = await Actor.create({
        name: MARKET_NAME,
        type: "npc",
        img: "icons/commodities/currency/coins-plain-stack-gold-yellow.webp", 
    });

    await marketActor.update({
        "flags.item-piles.data": {
            enabled: true,
            type: "merchant", 
            infiniteQuantity: true, 
            infiniteCurrencies: true, 
            keepOnMerchant: true,
            buyModifier: 1.0,  
            sellModifier: 1.0  
        }
    });

        // 5. Automatically stock the market from Core 5e Compendiums with Strict Filters
    const equipmentPack = game.packs.get("dnd5e.items"); 
    if (equipmentPack) {
        const index = await equipmentPack.getIndex();
        
        // Define base allowed item types
        const validShopTypes = ["weapon", "equipment", "tool"];
        const entriesToStock = index.filter(i => validShopTypes.includes(i.type));

        // --- FILTER CONFIGURATIONS ---
        const MAX_GOLD_VALUE = 250; // Block anything exceeding this price tag (e.g. Plate Armor)
        //const BLACKLIST_KEYWORDS = ["barding", "ship", "carriage", "chariot"]; // Block mount/vehicle clutter
        // ------------------------------

        const itemsToAdd = [];
        for (let entry of entriesToStock) {
            const itemDoc = await equipmentPack.getDocument(entry._id);
            if (itemDoc) {
                const itemData = itemDoc.toObject();
                const itemPrice = itemData.system?.price?.value || 0;
                const itemDenom = itemData.system?.price?.denomination || "gp";
                const itemNameLower = itemData.name.toLowerCase();

                // Rule 1: Ensure it has a valid, non-zero price structure
                if (itemPrice <= 0) continue;

                // Rule 2: Ignore vehicles and mount barding clutter via keyword blacklist
                //const isBlacklisted = BLACKLIST_KEYWORDS.some(word => itemNameLower.includes(word));
                //if (isBlacklisted) continue;

                // Rule 3: Enforce maximum starting gold thresholds (Converts silver/copper checks implicitly)
                if (itemDenom === "gp" && itemPrice > MAX_GOLD_VALUE) continue;
                if (itemDenom === "pp" && (itemPrice * 10) > MAX_GOLD_VALUE) continue; // Safety check for Platinum

                // Rule 4: Exclude magic items or high rarity items if your systems tag them
                const rarity = itemData.system?.rarity;
                if (rarity && !["common", "none", ""].includes(rarity.toLowerCase())) continue;

                // If it passes all safety criteria, queue it for the market
                itemsToAdd.push(itemData);
            }
        }

        // Batch insert the pristine inventory array
        if (itemsToAdd.length > 0) {
            await marketActor.createEmbeddedDocuments("Item", itemsToAdd);
            console.log(`[Ryu Roller] Successfully filtered and stocked ${itemsToAdd.length} starting tier items into "${MARKET_NAME}".`);
        }
    }


    ui.notifications.info(`Successfully created and stocked "${MARKET_NAME}"!`);
});
