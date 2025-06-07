<script>
    import { onMount } from 'svelte';
    import { fetchGet } from '../utils/fetchApi.js';

    let rankings = [];
    onMount(async () => {
        rankings = await fetchGet('/api/sportradar/rankings');
    });
</script>

<style>
    .rankings-container { margin-top: 2rem; }
    .ranking-table { width: 100%; border-collapse: collapse; }
    .ranking-table th, .ranking-table td { padding: 8px; border: 1px solid #444; text-align: left; }
    .ranking-table th { background-color: #333; }
</style>

<div class="rankings-container">
    <h3>World Rankings</h3>
    {#if rankings.length > 0}
        {#each rankings as ranking (ranking.name)}
            <h4>{ranking.name}</h4>
            <table class="ranking-table">
                <thead>
                    <tr><th>Rank</th><th>Competitor</th><th>Points</th></tr>
                </thead>
                <tbody>
                    {#each ranking.competitor_rankings as cr}
                        <tr>
                            <td>{cr.rank}</td>
                            <td>{cr.competitor.name} ({cr.competitor.country_code})</td>
                            <td>{cr.points}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        {/each}
    {:else}
        <p>Loading rankings...</p>
    {/if}
</div>