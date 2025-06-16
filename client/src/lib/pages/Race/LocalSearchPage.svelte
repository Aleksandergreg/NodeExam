<script>
    import '../../styles/RacesPage.css'; // Reusing some styles
    import { fetchGet } from '../../utils/fetchApi.js';
    import LocalRaceCard from '../../components/Race/LocalRaceCard.svelte';

    let searchTerm = $state('');
    let results = $state([]);
    let isLoading = $state(false);
    let error = $state(null);
    let searchPerformed = $state(false);

    async function searchRaces(event) {
        event.preventDefault(); 
        
        if (!searchTerm.trim()) {
            results = [];
            searchPerformed = false;
            return;
        }
        isLoading = true;
        error = null;
        searchPerformed = true;
        try {
            results = await fetchGet(`/races/search?q=${encodeURIComponent(searchTerm)}`);
        } catch (err) {
            error = err.data?.message || 'Failed to fetch search results.';
            results = [];
        } finally {
            isLoading = false;
        }
    }
</script>

<div class="races-container">
    <h1>Search Local Database</h1>
    <p class="subtitle">Search for races or riders in our historical database (2014-2024).</p>
    
    <div class="card local-search-card">
        <h3>Search for a Race or Rider</h3>
        <form onsubmit={searchRaces} class="search-form">
            <input
                type="text"
                class="search-input"
                placeholder="e.g., Tour de France or Tadej Pogačar"
                bind:value={searchTerm}
            />
            <button type="submit" class="btn btn-primary" disabled={isLoading}>
                {#if isLoading}Searching...{:else}Search{/if}
            </button>
        </form>

        {#if isLoading}
            <p class="loading">Loading results...</p>
        {/if}

        {#if error}
            <p class="error-message">{error}</p>
        {/if}
        
        <div class="results-grid-local">
            {#if !isLoading && results.length > 0}
                {#each results as race (race.name + race.year)}
                    <LocalRaceCard {race} />
                {/each}
            {:else if searchPerformed && !isLoading && !error}
                <p>No results found for "{searchTerm}".</p>
            {/if}
        </div>
    </div>
</div>

<style>
    .search-form {
        display: flex;
        gap: 1rem;
    }
    .search-input {
        flex-grow: 1;
    }
    .results-grid-local {
        margin-top: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }
</style>