<script>
    import { onMount } from 'svelte';
    import { fetchGet } from '../../utils/fetchApi.js';

    let year = new Date().getFullYear();
    let races = [];
    let isLoading = false;
    let error = null;
    let searchedYear = null;
    let activeRaceId = null;

    function toggleRace(raceId) {
        activeRaceId = activeRaceId === raceId ? null : raceId;
    }

    async function fetchSchedule() {
        isLoading = true;
        error = null;
        races = [];
        searchedYear = year;
        activeRaceId = null; 

        try {
            const data = await fetchGet(`/api/sportradar/schedule/${year}`);
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
    .results-container {
        max-width: 800px;
        margin: 2rem auto;
        padding: 2rem;
        background-color: #2c3e50;
        border-radius: 12px;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    }
    .results-container h2 {
        text-align: center;
        color: #ecf0f1;
        margin-top: 0;
        margin-bottom: 2rem;
        font-weight: 600;
    }

    .search-form {
        display: flex;
        gap: 0.75rem;
        justify-content: center;
        align-items: center;
        margin-bottom: 2.5rem;
    }
    .search-form label {
        font-size: 1rem;
        color: #bdc3c7; 
    }
    .search-form input {
        padding: 0.75rem;
        border-radius: 6px;
        border: 1px solid #7f8c8d;
        background-color: #34495e;
        color: #ecf0f1;
        font-size: 1rem;
        width: 100px;
    }
    .search-form button {
        padding: 0.75rem 1.5rem;
        font-size: 1rem;
        font-weight: 500;
        color: #fff;
        background-color: #3498db;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        transition: background-color 0.2s ease;
    }
    .search-form button:hover:not(:disabled) {
        background-color: #2980b9;
    }
    .search-form button:disabled {
        background-color: #576574;
        cursor: not-allowed;
    }

    /* Style for the "Race Schedule for..." heading */
    .results-container > h3 {
        text-align: center;
        color: #ecf0f1;
        font-size: 1.5rem;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #34495e;
        font-weight: 500;
    }
    
    .error-message {
        color: #e74c3c;
        text-align: center;
        font-size: 1.1rem;
    }

    .event-list {
        list-style-type: none;
        padding: 0;
    }
    .event-item {
        background-color: #34495e;
        border-radius: 8px;
        margin-bottom: 1rem;
        overflow: hidden;
    }
    .event-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.25rem 1.5rem;
        cursor: pointer;
        transition: background-color 0.2s ease;
    }
    .event-header:hover {
        background-color: #4a627a;
    }
    .event-header h3 {
        margin: 0;
        color: #ecf0f1; /* Readable race titles */
        font-size: 1.2rem;
        font-weight: 500;
    }
    .event-header::after {
        content: '+';
        font-size: 1.75rem;
        font-weight: 300;
        color: #95a5a6;
        transition: transform 0.3s ease;
    }
    .event-header.active::after {
        transform: rotate(45deg);
    }

    .stages-container {
        padding: 0 1.5rem 1rem;
        border-top: 1px solid #4a627a;
    }
    .stage-list {
        list-style-type: none;
        padding-left: 0;
        margin-top: 1rem;
    }
    .stage-item {
        padding: 0.75rem 0.5rem;
        border-bottom: 1px solid #4a627a;
    }
    .stage-item:last-child {
        border-bottom: none;
    }
    .stage-item a {
        color: #5dade2; /* Lighter blue for links */
        text-decoration: none;
    }
    .stage-item a:hover {
        text-decoration: underline;
    }
    .single-race-link {
        color: #5dade2;
        text-decoration: none;
    }
    .single-race-link:hover {
        text-decoration: underline;
    }
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
                    <div class="event-header"
                         class:active={activeRaceId === event.id} 
                         on:click={() => toggleRace(event.id)} 
                         on:keydown={(e) => e.key === 'Enter' && toggleRace(event.id)} 
                         role="button" 
                         tabindex="0">
                        <h3>{event.description}</h3>
                    </div>
                    
                    {#if activeRaceId === event.id}
                        <div class="stages-container">
                            {#if event.stages && event.stages.length > 0}
                                <ul class="stage-list">
                                    {#each event.stages as stage (stage.id)}
                                        <li class="stage-item">
                                            <a href="/race/{stage.id}">
                                                {stage.description}
                                            </a>
                                            <span style="color: #95a5a6; margin-left: 1rem;">(Status: {stage.status})</span>
                                        </li>
                                    {/each}
                                </ul>
                            {:else if event.type === 'event' || event.type === 'stage'}
                                <a href="/race/{event.id}" class="single-race-link">
                                    View Details
                                </a>
                                <span style="color: #95a5a6; margin-left: 1rem;">(Status: {event.status})</span>
                            {/if}
                        </div>
                    {/if}
                </li>
            {/each}
        </ul>
    {:else if searchedYear}
        <p>No race schedule found for {searchedYear}.</p>
    {/if}
</div>