<script>
    let { race } = $props();
</script>

<style>
    .local-race-card {
        /* Adopts the general .card style from app.css */
        padding: 0;
        overflow: hidden;
    }
    .race-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: var(--surface-color-light);
        padding: var(--spacing-unit);
        border-bottom: 1px solid var(--border-color);
    }
    .race-title {
        font-size: 1.25rem;
        font-weight: 600;
        margin: 0;
        color: #eceff4;
    }
    .race-meta {
        text-align: right;
        font-size: 0.9rem;
        color: var(--text-color-muted);
        white-space: nowrap;
        padding-left: 1rem;
    }
    .results-table {
        width: 100%;
        border-collapse: collapse;
    }
    .results-table th, .results-table td {
        padding: calc(var(--spacing-unit) * 0.75);
        text-align: left;
        border-bottom: 1px solid var(--border-color);
    }
    .results-table th {
        font-weight: 600;
        color: var(--text-color-muted);
        font-size: 0.9rem;
    }
    .results-table tr:last-child td {
        border-bottom: none;
    }
    .position-cell {
        width: 60px;
        text-align: center;
        font-weight: bold;
    }
</style>

<div class="card local-race-card">
    <div class="race-header">
        <h4 class="race-title">{race.name}</h4>
        <div class="race-meta">
            <span>{race.year}</span><br>
            <span>{race.nation}</span>
        </div>
    </div>

    {#if race.results && race.results.length > 0}
        <table class="results-table">
            <thead>
                <tr>
                    <th class="position-cell">Pos.</th>
                    <th>Rider</th>
                    <th>Team</th>
                </tr>
            </thead>
            <tbody>
                {#each race.results as result (result.rider + result.position)}
                    <tr>
                        <td class="position-cell">{result.position}</td>
                        <td>{result.rider}</td>
                        <td>{result.team}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    {:else}
        <p style="padding: 1rem; text-align: center; color: var(--text-color-muted);">No results found for this race.</p>
    {/if}
</div>