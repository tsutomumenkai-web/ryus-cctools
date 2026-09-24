globalThis.ryuCCTools = globalThis.ryuCCTools || {};

globalThis.ryuCCTools.calculateCasterBudgets = function(actor) {
    // Isolate the primary Class item document on the sheet
    const classItem = actor?.items?.find(i => i.type === "class" && !i.system.isSubclass) || null;
    
    if (!classItem) {
        console.warn(`[Ryu Roller] No active Class document identified on sheet for: ${actor?.name}`);
        return { classId: "", level: 1, cantripsMax: 0, spellsMax: 0, maxTier: 1 };
    }

    const classId = classItem.system?.identifier || classItem.identifier || classItem.name?.toLowerCase() || "";
    const level = classItem.system?.levels || 1;
    const spellsData = actor.system.spells || {};

    let cantripsMax = 0;
    let spellsMax = 0;

    const advancements = classItem.system.advancement || [];
    for (const adv of advancements) {
        if (adv.type !== "ScaleValue") continue;
        
        const scaleId = adv.configuration?.identifier?.toLowerCase() || "";
        const scaleName = adv.name?.toLowerCase() || "";
        
        const scaleValueMap = adv.configuration?.scale || {};
        const levelNode = scaleValueMap[level] || scaleValueMap[String(level)] || null;
        
        let extractedValue = 0;
        for (let checkLevel = level; checkLevel >= 1; checkLevel--) {
            const levelNode = scaleValueMap[checkLevel] || scaleValueMap[String(checkLevel)] || null;
            if (levelNode !== null && levelNode !== undefined) {
                extractedValue = typeof levelNode === "object" ? (levelNode.value ?? levelNode.max ?? 0) : levelNode;
                extractedValue = Number(extractedValue);
                if (extractedValue > 0) break; // Found the active level tier value, exit lookback loop!
            }
        }

        extractedValue = Number(extractedValue);
        if (extractedValue > 0) {
            if (scaleName.includes("cantrip")) {
                cantripsMax = Math.max(cantripsMax, extractedValue);
            } 
            else if (scaleId.includes("prepared") || scaleName.includes("spells")) {
                spellsMax = Math.max(spellsMax, extractedValue);
            }
        }
    }

    if (cantripsMax === 0) {
        cantripsMax = Number(spellsData.spell0?.max || spellsData.spell0?.value || 0);
    }

    let maxTier = 1;
    if (spellsData.pact && spellsData.pact.level > 0) {
        maxTier = Number(spellsData.pact.level);
    } else {
        for (let i = 1; i <= 9; i++) {
            if ((spellsData[`spell${i}`]?.max || 0) > 0) maxTier = i;
        }
    }
    return { classId, level, cantripsMax, spellsMax, maxTier };
};

globalThis.ryuCCTools.loadSpellConfigLibrary = async function(classIdentifier = "warlock") {
    const cleanId = classIdentifier.toLowerCase().trim();
    console.log(`[Ryu Roller] Running cross-pack journal list matching filter for: "${cleanId}"`);

    let whitelistedSpellNames = new Set();

    try {
        for (const journal of game.journal || []) {
            for (const page of journal.pages || []) {
                const isSpellsPage = page.type === "spells" || page.system?.type === "spells";
                const pageId = page.system?.identifier?.toLowerCase() || page.name?.toLowerCase() || "";
                
                if (isSpellsPage && pageId.includes(cleanId)) {
                    const entries = page.system?.entries || page.system?.spells || [];
                    for (const entry of entries) {
                        const targetUuid = typeof entry === "string" ? entry : (entry.uuid || entry.value);
                        if (!targetUuid) continue;
                        
                        const doc = fromUuidSync(targetUuid);
                        if (doc?.name) whitelistedSpellNames.add(doc.name.toLowerCase().trim());
                    }
                }
            }
        }

        for (const pack of game.packs) {
            if (pack.metadata.type !== "JournalEntry") continue;
            
            const journalIndex = await pack.getIndex({ fields: ["pages"] });
            for (const entry of journalIndex) {
                if (!entry.pages) continue;
                
                for (const page of entry.pages) {
                    const pageType = page.type || page.system?.type || "";
                    const pageName = page.name?.toLowerCase() || "";
                    
                    if ((pageType.includes("spell") || pageType === "") && pageName.includes(cleanId) && pageName.includes("list")) {
                        const fullJournalDoc = await pack.getDocument(entry._id);
                        const fullPageDoc = fullJournalDoc?.pages?.get(page._id);
                        
                        const entries = fullPageDoc?.system?.entries || fullPageDoc?.system?.spells || [];
                        for (const spellEntry of entries) {
                            const targetUuid = typeof spellEntry === "string" ? spellEntry : (spellEntry.uuid || spellEntry.value);
                            if (!targetUuid) continue;
                            
                            const doc = fromUuidSync(targetUuid);
                            if (doc?.name) whitelistedSpellNames.add(doc.name.toLowerCase().trim());
                        }
                    }
                }
            }
        }
    } catch (err) {
        console.warn("[Ryu Roller Debug] Journal pre-scan encountered an evaluation warning:", err);
    }

    console.log(`[Ryu Roller] Located ${whitelistedSpellNames.size} whitelisted spell name tokens inside your 2024 books.`);

    let allowedPacks = [];     
    try {
        const response = await fetch(`/modules/ryus-cctools/data/spell-config.json`);
        if (response.ok) {
            const configData = await response.json();
            if (configData?.targetPacks && configData.targetPacks.length > 0) {
                allowedPacks = configData.targetPacks;
            }
        }
    } catch (e) {
        console.warn("[Ryu Roller] Could not read spell-config.json, falling back to defaults.", e);
    }
    
    console.log("[Ryu Roller] Target Active Compendiums:", allowedPacks);

    let compiledMap = new Map();

    for (const packKey of allowedPacks) {
        const pack = game.packs.get(packKey);
        if (!pack) continue;

        const index = await pack.getIndex({ 
            fields: [
                "type", 
                "system.level", 
                "system.activation.type", 
                "system.activation.cost", 
                "system.range.value", 
                "system.range.units", 
                "system.target.value",
                "system.target.units",
                "system.target.type",
                "system.components.vocal", 
                "system.components.somatic", 
                "system.components.material", 
                "system.duration.value", 
                "system.duration.units"
            ] 
        });

        for (let entry of index) {
            if (entry.type !== "spell") continue;
            
            const spellCleanName = entry.name.toLowerCase().trim();
            if (whitelistedSpellNames.size > 0 && !whitelistedSpellNames.has(spellCleanName)) continue;

            if (!compiledMap.has(entry.name) || packKey.includes("handbook")) {
                const activation = entry.system?.activation;
                const castTime = activation?.type ? `${activation.cost || 1} ${activation.type}` : "Instant";

                const range = entry.system?.range;
                const rangeText = range?.units ? `${range.value || ""} ${range.units}`.trim() : "Self";

                const target = entry.system?.target;
                let targetText = "None";
                if (target?.value || target?.type) {
                    targetText = `${target.value || ""} ${target.units || ""} ${target.type || ""}`.trim();
                }

                const duration = entry.system?.duration;
                const durationText = duration?.units ? `${duration.value || ""} ${duration.units}`.trim() : "Instantaneous";

                const comp = entry.system?.components || {};
                const componentsList = [];
                if (comp.vocal) componentsList.push("V");
                if (comp.somatic) componentsList.push("S");
                if (comp.material) componentsList.push("M");
                const compText = componentsList.length > 0 ? componentsList.join(", ") : "None";

                compiledMap.set(entry.name, {
                    name: entry.name,
                    uuid: entry.uuid,
                    level: entry.system?.level ?? 0,
                    img: entry.img || "icons/svg/mystery-man.svg",
                    details: {
                        castTime: castTime,
                        range: rangeText,
                        target:targetText,
                        components: compText,
                        duration: durationText
                    }
                });
            }
        }
    }
    
    const finalFilteredList = Array.from(compiledMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    console.log(`[Ryu Roller] Processing finished. Stocked grid with ${finalFilteredList.length} choices.`);
    return finalFilteredList;
};

globalThis.ryuCCTools.inspectSpell = async function(uuid) {
    const doc = await fromUuid(uuid);
    if (doc) doc.sheet.render(true);
};

globalThis.ryuCCTools.commitSpellsToActor = async function(actor, selectedUuids, classId) {
    const classNameLabel = classId.charAt(0).toUpperCase() + classId.slice(1).toLowerCase();
    const existingClassSpells = actor.items.filter(i => {
        if (i.type !== "spell") return false;
        const sourceLabel = i.system?.source?.custom || i.system?.source?.value || "";
        return sourceLabel.toLowerCase().trim() === classId.toLowerCase().trim() || 
               sourceLabel.toLowerCase().trim() === classNameLabel.toLowerCase().trim();
    });

    const itemsToDelete = [];
    for (const item of existingClassSpells) {
        const itemCleanName = item.name.toLowerCase().trim();
        const library = await ryuCCTools.loadSpellConfigLibrary(classId);
        const stillSelected = library.some(libSpell => {
            return libSpell.name.toLowerCase().trim() === itemCleanName && selectedUuids.includes(libSpell.uuid);
        });

        if (!stillSelected) {
            itemsToDelete.push(item.id);
        }
    }

    if (itemsToDelete.length > 0) {
        await actor.deleteEmbeddedDocuments("Item", itemsToDelete);
    }

    const itemsToAdd = [];
    for (const uuid of selectedUuids) {
        const spellDoc = await fromUuid(uuid);
        if (!spellDoc) continue;

        const itemCleanName = spellDoc.name.toLowerCase().trim();
        const alreadyHasIt = existingClassSpells.some(i => i.name.toLowerCase().trim() === itemCleanName);
        if (alreadyHasIt) continue;

        const itemData = spellDoc.toObject();
        
        itemData.system.source = itemData.system.source || {};
        itemData.system.source.custom = classNameLabel;

        if (classId.includes("wizard") && itemData.system.level > 0) {
            itemData.system.preparation = { mode: "prepared", prepared: false };
        }
        itemsToAdd.push(itemData);
    }

    if (itemsToAdd.length > 0) {
        await actor.createEmbeddedDocuments("Item", itemsToAdd);
    }

    ui.notifications.info(`Successfully synchronized your ${classNameLabel} spell allocations!`);
    
    const dialogId = Object.keys(ui.windows).find(k => ui.windows[k].options?.window?.title?.includes("Spell Selection"));
    if (dialogId) ui.windows[dialogId].close();
};

globalThis.ryuCCTools.getPreExistingWizardSelections = async function(actor, classId) {
    const library = await ryuCCTools.loadSpellConfigLibrary(classId);
    
    const actorSpells = actor.items.filter(i => {
        if (i.type !== "spell") return false;
        if (globalThis.ryuCCTools.isFeatureOrFeatSpell(i)) return false;        
        return true;
    });

    const cantripsSet = new Set();
    const leveledSets = { 1: new Set(), 2: new Set(), 3: new Set(), 4: new Set(), 5: new Set(), 6: new Set(), 7: new Set(), 8: new Set(), 9: new Set() };

    for (const item of actorSpells) {
        const itemCleanName = item.name.toLowerCase().trim();
        const matchedLibrarySpell = library.find(libSpell => libSpell.name.toLowerCase().trim() === itemCleanName);
        
        if (matchedLibrarySpell) {
            const level = item.system?.level ?? 0;
            if (level === 0) {
                cantripsSet.add(matchedLibrarySpell.uuid);
            } else if (level >= 1 && level <= 9) {
                leveledSets[level].add(matchedLibrarySpell.uuid);
            }
        }
    }

    return { 
        cantrips: Array.from(cantripsSet), 
        leveledByTier: Object.fromEntries(Object.entries(leveledSets).map(([k, set]) => [k, Array.from(set)]))
    };
};

globalThis.ryuCCTools.isFeatureOrFeatSpell = function(item) {
    if (!item) return false;

    // Inspect the item name and its entire flag tree in the console
    /*
    console.log(`[SpellDebug] Evaluating: "${item.name}"`, {
        id: item.id,
        flags: item.flags,
        dnd5e: item.flags?.dnd5e,
        source: item.system?.source
    });
    */

    const dnd5eFlags = item.flags?.dnd5e;
    if (dnd5eFlags) {
        if (dnd5eFlags.advancementOrigin || dnd5eFlags.advancementRoot || dnd5eFlags.cachedFor) {
            // console.log(`-> 🚫 FILTERED OUT: "${item.name}" matched dnd5e flags.`);
            return true;
        }
    }

    // console.log(`-> ✅ KEPT: "${item.name}" passed filters.`);
    return false;
};