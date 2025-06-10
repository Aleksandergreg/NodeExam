<script>
  import { fetchGet } from "../../utils/fetchApi.js";
  import WeatherWidget from '../../components/Race/WeatherWidget.svelte'; 

  let { stageId } = $props();

  let raceDetails = $state(null);
  let weather = $state(null); 

  let isLoading = $state(true);
  let error = $state(null);

  $effect(async () => {
    console.log(
      `RaceDetailPage effect is running. Received stageId: '${stageId}'`
    );

    if (!stageId) {
      console.log("Terminating effect because stageId is missing.");
      return;
    }

    isLoading = true;
    error = null;
    raceDetails = null;
    weather = null; 

    try {
      const data = await fetchGet(
        `/api/sportradar/race/${encodeURIComponent(stageId)}`
      );

      if (data && data.stage) {
        raceDetails = data.stage;

        if (raceDetails.departure_city) {
          try {
              weather = await fetchGet(`/api/weather/forecast?city=${raceDetails.departure_city}`);
          } catch (weatherError) {
              console.warn("Could not fetch weather:", weatherError);
          }
        }
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
<div class="race-detail-page">
  {#if isLoading}
    <p>Loading race details...</p>
  {:else if error}
    <p class="error-message">{error}</p>
  {:else if raceDetails}
    <div class="header">
      <h2>{raceDetails.description}</h2>
      <p class="subtitle">
        {#if raceDetails.departure_city}
          {raceDetails.departure_city} to {raceDetails.arrival_city}
        {/if}
        {#if raceDetails.distance}
          ({raceDetails.distance} {raceDetails.distance_unit})
        {/if}
      </p>
    </div>

    <div class="info-grid">
      <div class="card info-item">
        <h4>Status</h4>
        <p>{raceDetails.status ? raceDetails.status : 'Not raced yet' }</p>
      </div>
      <div class="card info-item">
        <h4>Date</h4>
        <p>{new Date(raceDetails.scheduled).toLocaleDateString()}</p>
      </div>
      <div class="card info-item">
        <h4>Classification</h4>
        <p>{raceDetails.classification || "N/A"}</p>
      </div>
    </div>

    {#if weather}
      <WeatherWidget forecast={weather} />
    {/if}

    {#if raceDetails.competitors && raceDetails.competitors.length > 0}
      <h3>Competitors & Results</h3>
      <ul class="card competitor-list">
        {#each raceDetails.competitors as competitor (competitor.id)}
          <li class="competitor-item">
            <span class="competitor-name">{competitor.name} ({competitor.nationality})</span>
            <span>Time: {competitor.result?.time || "N/A"}</span>
          </li>
        {/each}
      </ul>
    {/if}
  {/if}
</div>