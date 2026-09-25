import SpellPickerApp from "./SpellPicker.svelte";

window.ryuCCTools = window.ryuCCTools || {};
globalThis.ryuCCTools = globalThis.ryuCCTools || window.ryuCCTools;

/**
 * Modern Spell Picker Svelte UI Wrapper using ApplicationV2 Architecture
 * @param {Object} context
 * @param {Actor} context.actor - The character actor document
 */
globalThis.ryuCCTools.launchMultiTabSpellPicker = async function({ actor }) {
    if (!actor) return ui.notifications.warn("Valid character actor required.");
    
    const dialog = new foundry.applications.api.DialogV2({
        window: {
            title: `Spell Selection Wizard — ${actor.name}`,
            icon: "fas fa-magic"
        },
        content: `<div id="ryu-spell-picker-root" style="min-width: 520px; min-height: 480px; display: flex; flex-direction: column; background: #fff;"></div>`,
        buttons: [
            {
                action: "close",
                label: "Close Wizard",
                icon: "fas fa-times"
            }
        ]
    });

    Hooks.once(`renderDialogV2`, (app, html) => {
        if (app.id === dialog.id) {
            const container = app.element.querySelector("#ryu-spell-picker-root");
            if (container) {
                new SpellPickerApp({
                    target: container,
                    props: { actor: actor }
                });

                // HIGH-FIDELITY, PERFECT WORD-WRAP INTERCEPTOR
                app.element.addEventListener("mouseover", async (event) => {
                    const row = event.target.closest("[data-spell-hover-uuid]");
                    if (!row) return;

                    const uuid = row.getAttribute("data-spell-hover-uuid");
                    
                    if (row.getAttribute("data-cached-uuid") !== uuid) {
                        row.removeAttribute("data-tooltip");
                        row.setAttribute("data-cached-uuid", uuid);
                    } else if (row.hasAttribute("data-tooltip")) {
                        return; 
                    }

                    try {
                        const spellDoc = await fromUuid(uuid);
                        if (spellDoc) {
                            const rawDescription = spellDoc.system?.description?.value || "No mechanical description provided.";
                            
                            const enrichedDescription = await foundry.applications.ux.TextEditor.enrichHTML(rawDescription, {
                                secrets: false,
                                rollData: actor.getRollData(),
                                async: true
                            });

                            const castTime = spellDoc.labels?.activation || "1 Action";
                            const rangeText = spellDoc.labels?.range || "Self";
                            const targetText = spellDoc.labels?.target;
                            const durationText = spellDoc.labels?.duration || "Instantaneous";
                            const schoolLabel = spellDoc.labels?.school || "Evocation";
                            
                            const comps = [];
                            const props = spellDoc.system?.properties;
                            if (props) {
                                if (props.has("vocal") || props.includes?.("vocal")) comps.push("V");
                                if (props.has("somatic") || props.includes?.("somatic")) comps.push("S");
                                if (props.has("material") || props.includes?.("material")) comps.push("M");
                            }
                            const compText = comps.length > 0 ? comps.join(", ") : "None";

                            const targetRowHtml = (targetText && targetText !== "None") 
                                ? `<div class="spell-metadata-row"><strong>Target:</strong> <span style="color:#fff;">${targetText}</span></div>` 
                                : '';

                            const popoverHtml = `
                                <div class="ryu-custom-tooltip-wrapper">
                                    <style>
                                        .ryu-custom-tooltip-wrapper {
                                            all: initial;
                                            display: block;
                                            box-sizing: border-box;
                                            width: 340px;
                                            max-width: 340px;
                                            padding: 8px 10px;
                                            color: #f0f0e0;
                                            font-family: var(--font-primary, "Signika", sans-serif);
                                            font-size: 12px;
                                            line-height: 1.4;
                                            background: #191813; /* Foundry's native dark tooltip background */
                                            border: 1px.solid #4b4a40;
                                            border-radius: 4px;
                                            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
                                            word-break: break-word;
                                            overflow-wrap: break-word;
                                        }
                                        .ryu-custom-tooltip-wrapper * {
                                            box-sizing: border-box;
                                        }
                                        .ryu-custom-tooltip-wrapper h3 {
                                            margin: 0 0 2px 0;
                                            color: #f0f0e0;
                                            font-size: 15px;
                                            font-weight: bold;
                                            border-bottom: 1px solid #c4b581; /* Foundry gold/brass accent line */
                                            padding-bottom: 4px;
                                        }
                                        .ryu-custom-tooltip-wrapper .spell-metadata-row {
                                            display: flex;
                                            justify-content: space-between;
                                            margin-bottom: 2px;
                                        }
                                        .ryu-custom-tooltip-wrapper .spell-description-body {
                                            margin-top: 6px;
                                            padding-top: 6px;
                                            border-top: 1px solid #444;
                                        }
                                        .ryu-custom-tooltip-wrapper p {
                                            margin: 0 0 6px 0;
                                            white-space: normal;
                                        }
                                    </style>

                                    <h3>${spellDoc.name}</h3>
                                    <div style="font-size: 11px; margin-bottom: 8px; color: #aaa; font-style: italic;">
                                        ${spellDoc.system.level === 0 ? 'Cantrip' : 'Level ' + spellDoc.system.level} • ${schoolLabel}
                                    </div>
                                    
                                    <!-- Metric Data Grid -->
                                    <div style="font-size: 11px; margin-bottom: 6px; color: #ddd;">
                                        <div class="spell-metadata-row"><strong>Casting Time:</strong> <span style="color:#fff;">${castTime}</span></div>
                                        <div class="spell-metadata-row"><strong>Range:</strong> <span style="color:#fff;">${rangeText}</span></div>
                                        ${targetRowHtml}
                                        <div class="spell-metadata-row"><strong>Components:</strong> <span style="color:#fff;">${compText}</span></div>
                                        <div class="spell-metadata-row"><strong>Duration:</strong> <span style="color:#fff;">${durationText}</span></div>
                                    </div>

                                    <!-- Enriched Description Block -->
                                    <div class="spell-description-body">
                                        ${enrichedDescription}
                                    </div>
                                </div>
                            `;

                            row.setAttribute("data-tooltip", popoverHtml);
                            
                            // Reverting to direction RIGHT handles clear spacing bounds next to the picker
                            game.tooltip.activate(row, { 
                                direction: "RIGHT", 
                                interactive: true,
                                cssClass: "tooltip-custom-spell-card"
                            });
                        }
                    } catch (e) { 
                        console.warn("[Ryu Roller Debug] Tooltip calculation warning bypassed safely:", e); 
                    }
                });
            }
        }
    });

    await dialog.render(true);
};

function shouldTriggerWizardForActor(actor) {
    if (!actor) return false;
    if (!actor.isOwner) return;
    if (!game.user.isGM && !actor.testUserPermission(game.user, "OWNER")) return false;

    return true;
}

async function checkAndLaunchWizard(item) {
    if (item.type !== "class" || !item.actor) return;
    const actor = item.actor;

    // Stop if the current user doesn't own/control this character
    if (!shouldTriggerWizardForActor(actor)) return;

    const classId = item.name.toLowerCase();

    // Verify the module has spell configs for this class
    try {
        const library = await globalThis.ryuCCTools?.loadSpellConfigLibrary?.(classId);
        if (!library || library.length === 0) return;
    } catch (e) {
        return;
    }

    setTimeout(async () => {
        ui.notifications.info(`Spell configuration ready for ${item.name}. Opening Wizard...`);
        await globalThis.ryuCCTools.launchMultiTabSpellPicker({ actor: actor });
    }, 500);
}

// 1. Catch initial class creation (Character Creation)
Hooks.on("createItem", async (item, options, userId) => {
    // Only run this on the client machine belonging to the user who performed the action
    if (userId !== game.userId) return;
    await checkAndLaunchWizard(item);
});

// 2. Catch class level-ups (When system.levels changes)
Hooks.on("updateItem", async (item, changes, options, userId) => {
    if (userId !== game.userId) return;
    if (item.type !== "class") return;

    // Check if the class level was actually modified
    if (changes.system?.levels !== undefined) {
        await checkAndLaunchWizard(item);
    }
});

console.log("[Ryu Roller] Modern Svelte Spell Selection framework successfully bound via ApplicationV2 Hooks!");