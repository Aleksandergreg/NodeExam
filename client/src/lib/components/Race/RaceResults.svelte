<script>
    import { onMount } from 'svelte';
    import { fetchGet } from '../../utils/fetchApi.js';

    let year = new Date().getFullYear(); // Changed to current year for more relevant data
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
            // The flatMap logic in your backend already gives us a good list of events
            races = data.races || [];
        } catch (err) {
            error = err.data?.message || 'An error occurred.';
        } finally {
            isLoading = false;
        }
    }

    onMount(fetchSchedule);
</script>

<style>
    .results-container { max-width: 800px; margin: 2rem auto; padding: 1.5rem; background-color: #2d2d2d; border-radius: 12px; }
    .results-container h2 { text-align: center; color: #90b8ff; margin-top: 0; }
    .search-form { display: flex; gap: 1rem; justify-content: center; align-items: center; margin-bottom: 2rem; }
    .search-form input { padding: 0.5rem; border-radius: 4px; border: 1px solid #555; background-color: #444; color: #fff; }
    .search-form button { padding: 0.6rem 1.2rem; }
    .error-message { color: #ff8a8a; text-align: center; }
    .event-list { list-style-type: none; padding: 0; }
    .event-item { background-color: #383838; border-radius: 8px; padding: 1rem 1.5rem; margin-bottom: 1.5rem; }
    .event-item h3 { margin-top: 0; }
    .stage-list { list-style-type: none; padding-left: 1rem; margin-top: 1rem; }
    .stage-item { padding: 0.5rem 0; }
    .stage-item a { color: #a2c5ff; text-decoration: none; }
    .stage-item a:hover { text-decoration: underline; }
    .single-race-link { color: #a2c5ff; }
</style>

<div class="results-container">
    <h2>Search Sportradar Archive by Year</h2>
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
        <h3>Race Schedule for {searchedYear}</h3>
        <ul class="event-list">
            {#each races as event (event.id)}
                <li class="event-item">
                    <h3>{event.description}</h3>
                    
                    {#if event.stages && event.stages.length > 0}
                        <ul class="stage-list">
                            {#each event.stages as stage (stage.id)}
                                <li class="stage-item">
                                    <a href="/race/{stage.id}">
                                        {stage.description}
                                    </a>
                                    <span style="color: #888; margin-left: 1rem;">(Status: {stage.status})</span>
                                </li>
                            {/each}
                        </ul>
                    {:else if event.type === 'event' || event.type === 'stage'}
                         <a href="/race/{event.id}" class="single-race-link">
                            View Details
                         </a>
                         <span style="color: #888; margin-left: 1rem;">(Status: {event.status})</span>
                    {/if}
                </li>
            {/each}
        </ul>
    {:else if searchedYear}
        <p>No race schedule found for {searchedYear}.</p>
    {/if}
</div>