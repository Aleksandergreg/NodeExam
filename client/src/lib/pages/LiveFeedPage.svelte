<script>
    import { onMount } from 'svelte';
    import { fetchGet } from '../utils/fetchApi.js';

    let races = [];
    let isLoading = true;
    let error = null;

    onMount(async () => {
        try {
            const data = await fetchGet('/api/sportradar/races');

            if (data && data.races) {
                races = data.races;
            } else {
                races = [];
            }
        } catch (err) {
            error = err.data?.message || err.message || 'An unknown error occurred.';
            console.error("Failed to load live feed:", error);
        } finally {
            isLoading = false;
        }
    });
</script>

<style>
    .feed-container {
        max-width: 800px;
        margin: 2rem auto;
        padding: 1.5rem;
        background-color: #2d2d2d; /* A slightly lighter dark shade */
        border-radius: 12px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        color: #e0e0e0;
        text-align: left;
    }
    .feed-container h2 {
        color: #90b8ff; /* A lighter blue */
        text-align: center;
        margin-bottom: 1.5rem;
    }
    .race-list {
        list-style-type: none;
        padding: 0;
    }
    .race-item {
        border-bottom: 1px solid #444;
        padding: 1.2rem 0.5rem;
        transition: background-color 0.2s ease-in-out;
    }
    .race-item:hover {
        background-color: #353535;
    }
    .race-item:last-child {
        border-bottom: none;
    }
    .race-item strong {
        color: #a2c5ff;
        font-size: 1.15em;
        display: block;
        margin-bottom: 0.25rem;
    }
    .race-item p {
        margin: 0.3rem 0 0;
        color: #b0b0b0;
        font-size: 0.9em;
    }
    .error-message {
        color: #ff8a8a;
        font-weight: bold;
        text-align: center;
        padding: 1rem;
        background-color: #4d2f2f;
        border-radius: 8px;
    }
    .loading-message {
        color: #aaa;
        text-align: center;
        font-style: italic;
    }
</style>

<div class="feed-container">
    <h2>Live Cycling Race Feed</h2>

    {#if isLoading}
        <p class="loading-message">Loading live race data...</p>
    {/if}

    {#if error}
        <p class="error-message">
            Could not load feed: {error}
        </p>
    {/if}

    {#if !isLoading && races.length > 0}
        <ul class="race-list">
            {#each races as race (race.id)}
                <li class="race-item">
                    <strong>{race.description}</strong>
                    {#if race.parent}
                        <p>Stage Race: {race.parent.description}</p>
                    {/if}
                    <p>Category: {race.category?.name || 'N/A'}</p>
                </li>
            {/each}
        </ul>
    {:else if !isLoading && !error}
        <p>No upcoming races found at the moment.</p>
    {/if}
</div>