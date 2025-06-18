<script>
    let { result } = $props();
</script>

<style>
    .race-card {
        border: 1px solid #ccc;
        border-radius: 8px;
        padding: 1rem;
        background-color: #f9f9f9;
        color: #333;
    }
    .race-card h3 {
        margin-top: 0;
    }
</style>

<div class="race-card">
    <h3>{result.name} ({result.year})</h3>
    <p><strong>Nation:</strong> {result.nation}</p>
    {#if result.position}
    <p><strong>Position:</strong> {result.position}</p>
    <p><strong>Rider:</strong> {result.rider}</p>
    <p><strong>Team:</strong> {result.team}</p>
    {/if}
</div>