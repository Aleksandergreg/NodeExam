<script>
    import { onMount } from 'svelte';
    import { fetchGet } from '../utils/fetchApi.js';

    let races = [];
    let isLoading = true;
    let error = null;

    onMount(async () => {
        try {
            const data = await fetchGet('/api/sportradar/races');

            races = data.races || [];
        } catch (err) {
            error = err.data?.message || err.message || 'An unknown error occurred.';
        } finally {
            isLoading = false;
        }
    });
</script>

<style>
    .races-container {
        margin-top: 2rem;
        padding: 1.5rem;
        background-color: #2c2c2c;
        border-radius: 12px;
        text-align: left;
    }
    .race-list {
        list-style-type: none;
        padding: 0;
    }
    .race-item {
        border-bottom: 1px solid #444;
        padding: 1rem 0;
    }
    .race-item:last-child {
        border-bottom: none;
    }
    .race-item strong {
        color: #87aeff;
        font-size: 1.1em;
    }
    .race-item p {
        margin: 0.3rem 0 0;
        color: #ccc;
    }
    .error-message {
        color: #ff6b6b;
        font-weight: bold;
    }
    .loading-message {
        color: #aaa;
    }
</style>

<div class="races-container">
    <h2>Live Cycling Races (from Sportradar)</h2>

    {#if isLoading}
        <p class="loading-message">Loading live race data...</p>
    {/if}

    {#if error}
        <p class="error-message">Error: {error}</p>
    {/if}

    {#if !isLoading && races.length > 0}
        <ul class="race-list">
            {#each races as race (race.id)}
                <li class="race-item">
                    <strong>{race.description}</strong>
                    {#if race.parent}
                        <p>Part of Stage Race: {race.parent.description}</p>
                    {/if}
                    <p>Category: {race.category?.name || 'N/A'}</p>
                </li>
            {/each}
        </ul>
    {:else if !isLoading && !error}
        <p>No upcoming races found at the moment.</p>
    {/if}
</div>