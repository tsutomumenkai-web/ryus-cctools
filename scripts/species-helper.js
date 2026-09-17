globalThis.ryuCCTools = globalThis.ryuCCTools || {};

/**
 * Master Species Rolling Engine
 * @param {Object} context
 * @param {Actor} context.actor - The character actor document executing the creation routine
 */

globalThis.ryuCCTools.rollSpecies = async function({ actor }) {
    const compendiumKey = "ryus-cctools.species-roll-tables";
    const baseTableName = "Races";

    const currentActor = actor;
    if (!currentActor) {
        return ui.notifications.warn("Could not find a valid character for this feature.");
    }

    // 1. Fetch your mapping file dynamically from your module directory
    const response = await fetch(`modules/ryus-cctools/data/race-mappings.json`);
    if (!response.ok) {
        ui.notifications.error("Failed to load race-mappings.json from the module directory.");
        return;
    }
    const raceItemDataMap = await response.json();

    const subraceTableMap = {
        "Dwarf": "Dwarf Sub-Races",
        "Elf": "Elf Sub-Races",
        "Dragonborn": "Dragonborn Ancestry",
        "Gnome": "Gnome Sub-Races",
        "Halfling": "Halfling Sub-Races",
        "Tiefling": "Tiefling Sub-Races"
    };

    // 2. Compendium Automation Logic
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
    const rolledRace = firstResult.name ? firstResult.name.trim() : firstResult.text?.trim();

    console.log(`[Ryu Roller] Initial Race Rolled: "${rolledRace}"`);

    // ROUTE A: Race requires a subrace roll
    if (rolledRace && subraceTableMap[rolledRace]) {
        const subraceTableName = subraceTableMap[rolledRace];
        const subraceEntry = index.find(t => t.name === subraceTableName);
        
        if (!subraceEntry) {
            ui.notifications.warn(`Subrace table "${subraceTableName}" mapped for ${rolledRace} was not found.`);
            return;
        }

        const uniqueButtonId = `roll-subrace-${Date.now()}`;

        const chatContent = `
            <div class="dice-roll">
                <div class="dice-flavor" style="font-weight: bold; font-size: 14px; margin-bottom: 5px; color: #7a2214;">
                    🧬 Subrace Selection Required!
                </div>
                <div class="dice-result" style="padding: 10px; text-align: center;">
                    <p style="margin-bottom: 12px;">You rolled a base race of <strong>${rolledRace}</strong>.</p>
                    <div>
                        <button 
                            type="button" 
                            id="${uniqueButtonId}"
                            style="background: #222; color: #fff; border: 1px solid #7a2214; padding: 6px 12px; border-radius: 4px; font-weight: bold; width: 100%; cursor: pointer;"
                        >
                            <i class="fas fa-dice"></i> Roll ${subraceTableName}
                        </button>
                    </div>
                </div>
            </div>
        `;

        const chatMessage = await ChatMessage.create({
            user: game.user.id,
            speaker: ChatMessage.getSpeaker(),
            content: chatContent
        });

        Hooks.on("renderChatMessageHTML", (message, htmlElement) => {
            if (message.id === chatMessage.id) {
                const button = htmlElement.querySelector(`#${uniqueButtonId}`);
                if (button) {
                    button.addEventListener("click", async (event) => {
                        event.preventDefault();
                        button.disabled = true;
                        button.style.opacity = "0.5";
                        
                        const targetTable = await pack.getDocument(subraceEntry._id);
                        if (targetTable) {
                            const subraceDraw = await targetTable.draw({ displayChat: true });
                            if (!subraceDraw.results || subraceDraw.results.length === 0) return;
                            
                            const subraceResult = subraceDraw.results[0].name ? subraceDraw.results[0].name.trim() : subraceDraw.results[0].text?.trim();
                            console.log(`[Ryu Roller] Subrace Result Triggered: "${subraceResult}"`);
                            
                            await processFinalSelection(subraceResult, currentActor, raceItemDataMap);
                        }
                    });
                }
            }
        });
    } else {
        // ROUTE B: Race does not have a subrace (e.g. Human, Orc) -> Process sheet right away
        await processFinalSelection(rolledRace, currentActor, raceItemDataMap);
    }
};

// --- PRIVATE HELPER FUNCTIONS (Scoped internally to avoid pollution) ---

async function processFinalSelection(finalRaceName, actor, raceItemDataMap) {
    console.log(`[Ryu Roller] Target Actor Identified:`, actor?.name);
    console.log(`[Ryu Roller] Searching JSON Map for key: "${finalRaceName}"`);

    const choiceData = raceItemDataMap[finalRaceName];
    
    if (!choiceData) {
        ui.notifications.warn(`No mapping configuration found for "${finalRaceName}" inside race-mappings.json.`);
        return;
    }

    // Handle Split Flavor Choices (Arrays, e.g. "Hill / Gold Dwarf")
    if (Array.isArray(choiceData)) {
        let buttons = {};
        choiceData.forEach((choice, idx) => {
            buttons[`choice${idx}`] = {
                label: choice.label,
                callback: async () => {
                    await applyRaceToActor(actor, choice);
                }
            };
        });

        new Dialog({
            title: `Choose Variant: ${finalRaceName}`,
            content: `<p>You rolled <strong>${finalRaceName}</strong>! Select your preferred lore flavor:</p>`,
            buttons: buttons,
            default: "choice0"
        }).render(true);

    } else {
        // Handle Direct Single Mappings (Objects, e.g. "Human")
        await applyRaceToActor(actor, choiceData);
    }
}

async function applyRaceToActor(actor, targetConfig) {
    const raceItem = await fromUuid(targetConfig.uuid);
    if (!raceItem) {
        ui.notifications.error(`Could not locate item with UUID: ${targetConfig.uuid}`);
        return;
    }

    // Clone and customize template data object
    const itemData = raceItem.toObject();
    itemData.name = targetConfig.name;
    itemData._id = foundry.utils.randomID();

    // 2024 SYSTEM ADVANCEMENT AUTOMATION HOOK
    let managerAssignments = {};
    if (targetConfig.advancement) {
        const advId = targetConfig.advancement.id;
        const rolledValue = targetConfig.advancement.value;
        
        managerAssignments[advId] = {
            value: {
                choice: rolledValue
            },
            complete: true
        };
    }

    // Initialize the native Advancement Manager using the uncreated plain data object
    const manager = dnd5e.applications.advancement.AdvancementManager.forNewItem(actor, itemData);
    
    if (Object.keys(managerAssignments).length > 0) {
         manager.assignments = managerAssignments;
    }
    
    // Execute manager steps to pull child traits onto the sheet
    const requiresUIPopup = !targetConfig.advancement;
    await manager.render(requiresUIPopup);

    ui.notifications.info(`Successfully initialized "${targetConfig.name}" on ${actor.name}'s sheet!`);
}