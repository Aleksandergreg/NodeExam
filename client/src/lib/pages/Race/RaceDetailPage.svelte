<script>
    import { fetchGet } from "../../utils/fetchApi.js";
  
    let { stageId } = $props();
  
    let raceDetails = $state(null);
  
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
  
      try {
        const data = await fetchGet(
          `/api/sportradar/race/${encodeURIComponent(stageId)}`
        );
  
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
  
  <div class="detail-container">
    {#if isLoading}
      <p>Loading race details...</p>
    {:else if error}
      <p style="color: red; text-align: center;">{error}</p>
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
        <div class="info-item">
          <h4>Status</h4>
  
          <p>{raceDetails.status ? raceDetails.status : 'Not raced yet' }</p>
        </div>
  
        <div class="info-item">
          <h4>Date</h4>
  
          <p>{new Date(raceDetails.scheduled).toLocaleDateString()}</p>
        </div>
  
        <div class="info-item">
          <h4>Classification</h4>
          
          <p>{raceDetails.classification || "N/A"}</p>
        </div>
      </div>
  
      {#if raceDetails.competitors && raceDetails.competitors.length > 0}
        <h3>Competitors & Results</h3>
  
        <ul class="competitor-list">
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
  
  <style>
    /* --- Main Container --- */
    .detail-container {
      max-width: 900px;
      margin: 2rem auto;
      padding: 2rem;
      background-color: #2c3e50;
      border-radius: 12px;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    }
    .detail-container > p {
        text-align: center;
        color: #ecf0f1;
    }
  
    /* --- Header --- */
    .header {
      text-align: center;
      margin-bottom: 3rem;
    }
    .header h2 {
      color: #ecf0f1;
      font-size: 2.5rem;
      font-weight: 600;
      margin: 0 0 0.5rem 0;
    }
    .header .subtitle {
      color: #bdc3c7;
      font-size: 1.2rem;
      margin: 0;
    }
  
    /* --- Info Boxes (The main fix) --- */
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }
    .info-item {
      background-color: #34495e;
      padding: 1.5rem;
      border-radius: 8px;
      text-align: center;
    }
    .info-item h4 {
      margin: 0 0 0.75rem 0;
      color: #95a5a6; /* Muted color for the label */
      font-size: 0.9rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .info-item p {
      margin: 0;
      color: #ecf0f1; /* Bright, readable color for the value */
      font-size: 1.25rem;
      font-weight: 500;
    }
    
    /* --- Competitors List --- */
    .detail-container > h3 {
      text-align: center;
      color: #ecf0f1;
      font-size: 1.5rem;
      margin-top: 3rem;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #34495e;
      font-weight: 500;
    }
    .competitor-list {
      list-style: none;
      padding: 0;
      background-color: #34495e;
      border-radius: 8px;
    }
    .competitor-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #4a627a;
      color: #bdc3c7; /* Color for secondary info like 'Time:' */
    }
    .competitor-item:last-child {
      border-bottom: none;
    }
    .competitor-name {
      font-weight: 500;
      color: #ecf0f1; /* Bright color for the competitor's name */
    }
  </style>