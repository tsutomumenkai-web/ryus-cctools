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

    // --- DYNAMIC CURRENCY COMPILER & CLEAN RE-RENDER INJECTION ---
    const updates = {};
    let totalCoinsLogged = [];
    let rollsToExecute = [];

    // 1. Identify which rolls need to happen and organize them
    if (config.currencies) {
        for (const [denom, formula] of Object.entries(config.currencies)) {
            rollsToExecute.push({ denom: denom, formula: formula, flavor: `<h3>${config.label} ${denom.toUpperCase()} Wealth</h3>` });
        }
    } else if (config.formula) {
        rollsToExecute.push({ denom: "gp", formula: config.formula, flavor: `<h3>${config.label} Starting Wealth</h3>` });
    }

    // 2. Process and post the native roll messages
    for (let rConfig of rollsToExecute) {
        const roll = await new Roll(rConfig.formula).evaluate();
        const currentAmount = Number(currentActor.system.currency?.[rConfig.denom]) || 0;
        
        updates[`system.currency.${rConfig.denom}`] = currentAmount + roll.total;
        totalCoinsLogged.push(`${roll.total}${rConfig.denom}`);

        // Generate the exact pristine native roll card
        const chatMessage = await roll.toMessage({
            speaker: ChatMessage.getSpeaker({ actor: currentActor }),
            flavor: rConfig.flavor
        });

        // 3. Wait for the message card to render on the sheet sidebar layout
        const uniqueButtonId = `launch-store-${Date.now()}`;
        
        Hooks.on("renderChatMessageHTML", (message, htmlElement) => {
            if (message.id === chatMessage.id) {
                // Look for an existing button to prevent double-rendering bugs
                if (htmlElement.querySelector(`#${uniqueButtonId}`)) return;

                // Create a clean container elements box matching your preferred styling layout
                const buttonContainer = document.createElement("div");
                buttonContainer.style.marginTop = "8px";
                buttonContainer.style.padding = "0 4px";
                
                buttonContainer.innerHTML = `
                    <p>Wallet updated. Click below when you are ready to spend your starting currency:</p>
                    <button type="button" id="${uniqueButtonId}" style="background: #222; color: #fff; border: 1px solid #7a2214; padding: 6px; border-radius: 4px; font-weight: bold; width: 100%; cursor: pointer;">
                        <i class="fas fa-shopping-cart"></i> Open Equipment Marketplace
                    </button>
                `;

                // Safely append our custom action row onto the absolute bottom of the rendered card box container
                htmlElement.appendChild(buttonContainer);

                // 4. Attach the interactive click listener hook directly onto the inserted element
                const button = htmlElement.querySelector(`#${uniqueButtonId}`);
                if (button) {
                    button.addEventListener("click", (event) => {
                        event.preventDefault();
                        ryuCCTools.openCreationMarket({ actor: currentActor });
                    });
                }
            }
        });
    }

    // 5. Commit the final structural wallet alterations directly to the sheet database
    if (Object.keys(updates).length > 0) {
        await currentActor.update(updates);
    }
};
