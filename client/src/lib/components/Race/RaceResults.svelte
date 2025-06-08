<script>
    import { onMount } from 'svelte';
    import { fetchGet } from '../../utils/fetchApi';
    import { toast } from 'svelte-5-french-toast';

    let racesByYear = $state({});
    let isLoading = $state(true);
    let selectedYear = $state(new Date().getFullYear());
    let expandedRaceId = $state(null); // To control which race is expanded

    async function fetchRaces(year) {
        isLoading = true;
        try {
            const data = await fetchGet(`/api/sportradar/schedule/${year}`);
            racesByYear[year] = data.races;
        } catch (error) {
            toast.error(error.data?.message || `Failed to load races for ${year}.`);
            racesByYear[year] = [];
        } finally {
            isLoading = false;
        }
    }

    function isRaceLive(race) {
        const now = new Date();
        const raceStart = new Date(race.scheduled);
        const raceEnd = new Date(raceStart.getTime() + 5 * 60 * 60 * 1000);
        return raceStart <= now && now <= raceEnd;
    }

    function toggleRace(raceId) {
        if (expandedRaceId === raceId) {
            expandedRaceId = null;
        } else {
            expandedRaceId = raceId;
        }
    }

    onMount(() => {
        fetchRaces(selectedYear);
    });

    $effect(() => {
        if (selectedYear && !racesByYear[selectedYear]) {
            fetchRaces(selectedYear);
        }
    });
</script>

<style>
    .sportradar-container h1 { text-align: center; }
    .year-selector { margin-bottom: 2rem; text-align: center; }
    .race-category { margin-bottom: 1.5rem; }
    .race-header {
        background-color: #f0f0f0;
        padding: 1rem;
        cursor: pointer;
        border-radius: 5px;
        font-weight: bold;
    }
    .race-stages {
        padding-left: 1.5rem;
        margin-top: 0.5rem;
        border-left: 2px solid #ccc;
    }
    .stage-item { margin-bottom: 0.5rem; }
    .live-button {
        display: inline-block;
        margin-left: 10px;
        padding: 5px 10px;
        background-color: #dc3545;
        color: white;
        text-decoration: none;
        border-radius: 5px;
        font-weight: bold;
        animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.7); }
        70% { box-shadow: 0 0 0 10px rgba(220, 53, 69, 0); }
        100% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0); }
    }
</style>

<div class="sportradar-container">
    <h1>Live Race Data from Sportradar</h1>
    <div class="year-selector">
        <label for="year">Select Year: </label>
        <select id="year" bind:value={selectedYear}>
            <option value={2025}>2025</option>
            <option value={2024}>2024</option>
            <option value={2023}>2023</option>
        </select>
    </div>

    {#if isLoading}
        <p>Loading races for {selectedYear}...</p>
    {:else if racesByYear[selectedYear] && racesByYear[selectedYear].length > 0}
        {#each racesByYear[selectedYear] as raceCategory (raceCategory.id)}
            <div class="race-category">
                <div class="race-header" on:click={() => toggleRace(raceCategory.id)}>
                    {raceCategory.description}
                </div>
                {#if expandedRaceId === raceCategory.id}
                    <div class="race-stages">
                        {#each raceCategory.stages as stage (stage.id)}
                            <div class="stage-item">
                                <a href={`/race/${stage.id}`}>{stage.description}</a>
                                {#if isRaceLive(stage)}
                                    <a href={`/race/live/${stage.id}`} class="live-button">🔴 Live</a>
                                {/if}
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>
        {/each}
    {:else}
        <p>No races found for {selectedYear}.</p>
    {/if}
</div>