<script>
    import { onMount } from 'svelte';
    import { fetchGet } from '../utils/fetchApi.js';

    let rankings = [];
    let isLoading = true;

    // --- MOCK DATA for DEVELOPMENT ---
    // The Sportradar Trial API is returning an empty array for rankings.
    // We use this mock data to build the component.
    // When you have a production API key, you can delete this section.
    const mockRankings = [
        {
            name: "UCI World Ranking",
            competitor_rankings: [
                { rank: 1, competitor: { name: "Tadej Pogačar", country_code: "SLO" }, points: 10938 },
                { rank: 2, competitor: { name: "Jonas Vingegaard", country_code: "DEN" }, points: 8743 },
                { rank: 3, competitor: { name: "Remco Evenepoel", country_code: "BEL" }, points: 8392 },
                { rank: 4, competitor: { name: "Mathieu van der Poel", country_code: "NED" }, points: 6545 },
                { rank: 5, competitor: { name: "Wout van Aert", country_code: "BEL" }, points: 5877 }
            ]
        },
        {
            name: "UCI Points (YTD)",
            competitor_rankings: [
                { rank: 1, competitor: { name: "Tadej Pogačar", country_code: "SLO" }, points: 7890 },
                { rank: 2, competitor: { name: "Jasper Philipsen", country_code: "BEL" }, points: 4560 },
                { rank: 3, competitor: { name: "Mads Pedersen", country_code: "DEN" }, points: 4120 }
            ]
        }
    ];
    // --- End of Mock Data ---


    onMount(async () => {
        // To use the real API call with a production key, delete the line below
        // and uncomment the try/catch block.
        rankings = mockRankings;
        isLoading = false;

        /*
        // --- REAL API CALL (for when you have a production key) ---
        try {
            const data = await fetchGet('/api/sportradar/rankings');
            if (data && data.length > 0) {
                rankings = data;
            } else {
                // Handle cases where even the production API might be empty
                console.log("API returned no ranking data.");
            }
        } catch (error) {
            console.error("Failed to fetch rankings:", error);
        } finally {
            isLoading = false;
        }
        */
    });
</script>

<style>
    .rankings-container { margin-top: 2rem; }
    .ranking-table { width: 100%; border-collapse: collapse; margin-bottom: 2rem; }
    .ranking-table th, .ranking-table td { padding: 8px; border: 1px solid #444; text-align: left; }
    .ranking-table th { background-color: #333; }
    h3 { font-size: 1.8rem; text-align: center; color: #a2c5ff; }
    h4 { font-size: 1.4rem; margin-top: 2rem; }
</style>

<div class="rankings-container">
    <h3>World Rankings</h3>
    {#if isLoading}
        <p>Loading rankings...</p>
    {:else if rankings.length > 0}
        {#each rankings as ranking (ranking.name)}
            <h4>{ranking.name}</h4>
            <table class="ranking-table">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Competitor</th>
                        <th>Points</th>
                    </tr>
                </thead>
                <tbody>
                    {#each ranking.competitor_rankings as cr (cr.competitor.name)}
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
        <p>No ranking data available at this time.</p>
    {/if}
</div>