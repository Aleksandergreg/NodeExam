<script>
    import { onMount } from 'svelte';
    import { fetchGet } from '../../utils/fetchApi';
    import RaceCard from '../../components/Race/RaceCard.svelte';

    import RaceResults from '../../components/Race/RaceResults.svelte';

    let searchTerm = '';
    let results = [];
    let isLoading = false;
    let error = null;

    async function searchRaces() {
        if (!searchTerm.trim()) {
            results = [];
            return;
        }
        isLoading = true;
        error = null;
        try {
            results = await fetchGet(`/api/races/search?q=${encodeURIComponent(searchTerm)}`);
        } catch (err) {
            error = err.message || 'Failed to fetch race data.';
        } finally {
            isLoading = false;
        }
    }
</script>

<style>
    .races-container {
        width: 100%;
        max-width: 800px;
        margin: 2rem auto;
        padding: 1rem;
    }
    .local-search-input {
        width: 100%;
        padding: 0.8rem;
        font-size: 1rem;
        margin-bottom: 1rem;
    }
    .results-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1rem;
    }
    .error-message {
        color: red;
    }
    .separator {
        margin: 3rem 0;
        border: 0;
        border-top: 1px solid #444;
    }
</style>

<div class="races-container">
    <h1>Search Our Race Database</h1>
    <p>Search for a race or rider from our seeded data.</p>
    <input
        class="local-search-input"
        type="text"
        placeholder="e.g., Tour de France or Jonas Vingegaard"
        bind:value={searchTerm}
        on:input={searchRaces}
    />

    {#if isLoading}
        <p>Loading local results...</p>
    {/if}

    {#if error}
        <p class="error-message">{error}</p>
    {/if}

    <div class="results-grid">
        {#each results as result (result.rider + result.position + result.name)}
            <RaceCard {result} />
        {/each}
    </div>

    <hr class="separator" />

    <RaceResults />
</div>