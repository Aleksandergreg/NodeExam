<script>
    import { fetchGet } from '../../utils/fetchApi.js';

    let { stageId } = $props();

    let raceDetails = $state(null);
    let isLoading = $state(true);
    let error = $state(null);

    $effect(async () => {
        console.log(`RaceDetailPage effect is running. Received stageId: '${stageId}'`);

        if (!stageId) {
            console.log("Terminating effect because stageId is missing.");
            return;
        }
        
        isLoading = true;
        error = null;
        raceDetails = null;

        try {
            const data = await fetchGet(`/api/sportradar/race/${encodeURIComponent(stageId)}`);
            
            if (data && data.stage) {
                raceDetails = data.stage;
            } else {
                throw new Error("Invalid data format received for race details.");
            }

        } catch (err) {
            console.error(`Failed to fetch details for race ${stageId}:`, err);
            error = err.message || "Could not load race details.";
        } finally {
            isLoading = false;
        }
    });
</script>

<style>
    .detail-container { max-width: 900px; margin: 2rem auto; }
    .header { text-align: center; margin-bottom: 2rem; }
    .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
    .info-item { background-color: #2d2d2d; padding: 1rem; border-radius: 8px; }
    .info-item h4 { margin-top: 0; color: #a2c5ff; }
    .competitor-list { list-style: none; padding: 0; }
    .competitor-item { display: flex; justify-content: space-between; padding: 0.5rem; border-bottom: 1px solid #444; }
    .competitor-item:last-child { border-bottom: none; }
</style>

<div class="detail-container">
    {#if isLoading}
        <p>Loading race details...</p>
    {:else if error}
        <p style="color: red; text-align: center;">{error}</p>
    {:else if raceDetails}
        <div class="header">
            <h2>{raceDetails.description}</h2>
            <p>
                {raceDetails.departure_city} to {raceDetails.arrival_city}
                ({raceDetails.distance} {raceDetails.distance_unit})
            </p>
        </div>

        <div class="info-grid">
            <div class="info-item">
                <h4>Status</h4>
                <p>{raceDetails.status}</p>
            </div>
            <div class="info-item">
                <h4>Date</h4>
                <p>{new Date(raceDetails.scheduled).toLocaleDateString()}</p>
            </div>
            <div class="info-item">
                <h4>Classification</h4>
                <p>{raceDetails.classification || 'N/A'}</p>
            </div>
        </div>

        {#if raceDetails.competitors && raceDetails.competitors.length > 0}
            <h3>Competitors & Results</h3>
            <ul class="competitor-list">
                {#each raceDetails.competitors as competitor (competitor.id)}
                    <li class="competitor-item">
                        <span>{competitor.name} ({competitor.nationality})</span>
                        <span>Time: {competitor.result?.time || 'N/A'}</span>
                    </li>
                {/each}
            </ul>
        {/if}
    {/if}
</div>