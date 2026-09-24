<script>
    import { onMount } from "svelte";

    export let actor;

    let activeTab = 0;              
    let chosenCantrips = [];
    let chosenLeveledByTier = {
        1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: []
    }; 
    let allSpells = []; 
    let stats = { classId: "", level: 1, cantripsMax: 0, spellsMax: 0, maxTier: 1 };

    onMount(async () => {
        stats = window.ryuCCTools.calculateCasterBudgets(actor);
        allSpells = await window.ryuCCTools.loadSpellConfigLibrary(stats.classId);

        // EXTRACTION INITIALIZATION: Reads your sheet's native source tags asynchronously!
        const sheetState = await window.ryuCCTools.getPreExistingWizardSelections(actor, stats.classId);
        chosenCantrips = sheetState.cantrips;
        chosenLeveledByTier = sheetState.leveledByTier;
    });

    $: visibleSpells = allSpells.filter(s => s.level === activeTab);
    $: totalLeveledChosen = Object.values(chosenLeveledByTier).reduce((sum, arr) => sum + arr.length, 0);
    $: isBudgetMet = chosenCantrips.length === stats.cantripsMax && totalLeveledChosen === stats.spellsMax;
</script>


<div class="ryu-spell-picker-container" style="font-family: sans-serif; display: flex; flex-direction: column; background: #fff; padding: 10px; border-radius: 4px; box-sizing: border-box; color: #222;">
    
    <!-- Summary Banner -->
    <div style="background: #7a2214; color: #fff; padding: 10px 14px; border-radius: 4px; margin-bottom: 12px; border: 1px solid #5a140a; text-transform: capitalize;">
        <h3 style="margin: 0; font-size: 16px; font-weight: bold;">Class: {stats.classId || "None"} (Level {stats.level})</h3>
        <div style="margin-top: 6px; font-size: 12px; display: flex; gap: 15px; opacity: 0.95;">
            <span>🔮 Cantrips: <strong>{chosenCantrips.length} / {stats.cantripsMax}</strong></span>
            <span>📖 Prepared Pool: <strong>{totalLeveledChosen} / {stats.spellsMax}</strong></span>
            <span>🛡️ Max Tier: <strong>Level {stats.maxTier}</strong></span>
        </div>
    </div>

    <!-- Tabs Nav Bar -->
    <div style="display: flex; gap: 2px; border-bottom: 2px solid #7a2214; margin-bottom: 10px; padding-bottom: 2px; overflow-x: auto;">
        {#each Array(10) as _, i}
            <button type="button" 
                style="padding: 6px 12px; border: 1px solid #ccc; border-bottom: none; border-radius: 4px 4px 0 0; font-weight: bold; cursor: pointer; font-size: 11px; white-space: nowrap;
                       background: {activeTab === i ? '#7a2214' : '#eee'}; color: {activeTab === i ? '#fff' : '#333'};"
                on:click={() => activeTab = i}>
                {i === 0 ? "Cantrips" : `Lvl ${i}`}
            </button>
        {/each}
    </div>

    <!-- Central Checklist Grid -->
    <div style="flex-grow: 1; min-height: 230px; max-height: 280px; overflow-y: auto; background: #fafafa; border: 1px solid #ddd; padding: 10px; border-radius: 4px; margin-bottom: 12px;">
        {#if activeTab > stats.maxTier}
            <div style="text-align: center; color: #888; padding-top: 50px;">
                <i class="fas fa-lock" style="font-size: 24px; margin-bottom: 8px;"></i>
                <h4 style="margin: 0;">Level {activeTab} Spells Locked</h4>
            </div>
        {:else if allSpells.length === 0}
            <div style="text-align: center; color: #999; padding-top: 60px; font-style: italic; font-size: 12px;">
                <i class="fas fa-spinner fa-spin"></i> Indexing configuration lists...
            </div>
        {:else}
            {#each visibleSpells as spell}
                <div 
                    data-spell-hover-uuid={spell.uuid}
                    style="display: flex; align-items: center; padding: 6px 8px; margin-bottom: 4px; background: #fff; border: 1px solid #e0e0e0; border-radius: 4px; font-size: 12px; justify-content: space-between;">
                    <div style="display: flex; align-items: center;">
                        {#if activeTab === 0}
                            <input type="checkbox" value={spell.uuid} bind:group={chosenCantrips}
                                disabled={!chosenCantrips.includes(spell.uuid) && chosenCantrips.length >= stats.cantripsMax} style="margin-right: 12px; cursor: pointer;">
                        {:else}
                            <input type="checkbox" value={spell.uuid} bind:group={chosenLeveledByTier[activeTab]}
                                disabled={!chosenLeveledByTier[activeTab].includes(spell.uuid) && totalLeveledChosen >= stats.spellsMax} style="margin-right: 12px; cursor: pointer;">
                        {/if}
                        <img src={spell.img} alt="" width="20" height="20" style="border-radius: 3px; margin-right: 10px; background: #eee;">
                        <span style="font-weight: bold;">{spell.name}</span>
                    </div>
                    <button type="button" on:click={() => window.ryuCCTools.inspectSpell(spell.uuid)} style="background: none; border: none; color: #7a2214; cursor: pointer; font-size: 11px; font-weight: bold;">
                        <i class="fas fa-book-open"></i> Info
                    </button>
                </div>
            {/each}

        {/if}
    </div>

    <!-- Submit Footer -->
    <div style="display: flex; justify-content: flex-end; padding-top: 4px; border-top: 1px solid #eee;">
        <button type="button" disabled={!isBudgetMet}
            style="background: #111; color: #fff; border: 1px solid #7a2214; padding: 8px 18px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 12px; opacity: {isBudgetMet ? '1' : '0.4'};"
            on:click={() => {
                const flattenedLeveledUuids = Object.values(chosenLeveledByTier).flat();
                window.ryuCCTools.commitSpellsToActor(actor, [...chosenCantrips, ...flattenedLeveledUuids], stats.classId);
            }}>
            <i class="fas fa-magic"></i> Memorize Selections
        </button>
    </div>
</div>
