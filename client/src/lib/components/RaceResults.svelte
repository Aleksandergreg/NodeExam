<script>
    import { fetchGet } from '../utils/fetchApi.js';

    let year = new Date().getFullYear() - 1;
    let races = [];
    let isLoading = false;
    let error = null;
    let searchedYear = null;

    async function fetchSchedule() {
        isLoading = true;
        error = null;
        races = [];
        searchedYear = year;

        try {
            const data = await fetchGet(`/api/sportradar/schedule/${year}`);
            races = data.races || [];
        } catch (err) {
            error = err.data?.message || 'An error occurred.';
        } finally {
            isLoading = false;
        }
    }
</script>

<style>
    .results-container {
        max-width: 800px;
        margin: 2rem auto;
        padding: 1.5rem;
        background-color: #2d2d2d;
        border-radius: 12px;
    }
    .results-container h3 {
        text-align: center;
        color: #90b8ff;
        margin-top: 0;
    }
    .search-form {
        display: flex;
        gap: 1rem;
        justify-content: center;
        align-items: center;
        margin-bottom: 2rem;
    }
    .search-form input {
        padding: 0.5rem;
        border-radius: 4px;
        border: 1px solid #555;
        background-color: #444;
        color: #fff;
    }
    .search-form button { padding: 0.6rem 1.2rem; }
    .error-message { color: #ff8a8a; text-align: center; }
    .results-list { list-style-type: none; padding: 0; }
    .result-item { border-bottom: 1px solid #444; padding: 1rem 0.5rem; }
    .result-item:last-child { border-bottom: none; }
    .result-item strong { color: #a2c5ff; }
    .result-item p { margin: 0.3rem 0; font-size: 0.9em; color: #ccc; }
    .status { font-style: italic; color: #888; }
</style>

<div class="results-container">
    <h3>Search Sportradar Archive by Year</h3>
    <form class="search-form" on:submit|preventDefault={fetchSchedule}>
        <label for="year-input">Enter Year:</label>
        <input id="year-input" type="number" bind:value={year} min="2015" max={new Date().getFullYear()} />
        <button type="submit" disabled={isLoading}>
            {#if isLoading}Searching...{:else}Search Schedule{/if}
        </button>
    </form>

    {#if isLoading}
        <p>Loading schedule for {searchedYear}...</p>
    {:else if error}
        <p class="error-message">{error}</p>
    {:else if races.length > 0}
        <h4>Race Schedule for {searchedYear}</h4>
        <ul class="results-list">
            {#each races as race (race.id)}
                <li class="result-item">
                    <strong>{race.description}</strong>
                    <p class="status">Status: {race.status}</p>
                </li>
            {/each}
        </ul>
    {:else if searchedYear}
        <p>No race schedule found for {searchedYear}. (The trial API has limited historical data).</p>
    {/if}
</div>