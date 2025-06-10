<script>
    import '../../styles/RacesPage.css';
    import { fetchGet } from '../../utils/fetchApi';
    import RaceCard from '../../components/Race/RaceCard.svelte';
    import RaceResults from '../../components/Race/RaceResults.svelte';
  
    let searchTerm = '';
    let results = [];
    let isLoading = false;
    let error = null;
  
    async function searchRaces() {
        if (!searchTerm.trim()) {
            results = [];
            return;
        }
        isLoading = true;
        error = null;
        try {
            results = await fetchGet(`/api/races/search?q=${encodeURIComponent(searchTerm)}`);
        } catch (err) {
            error = err.message || 'Failed to fetch race data.';
        } finally {
            isLoading = false;
        }
    }
  </script>
  
  <div class="races-container">
      <h1>Race Database</h1>
      <p class="subtitle">Search for a race or rider from our local database, or browse the Sportradar archive by year.</p>
      
      <div class="card local-search-card">
          <h3>Search Local Database</h3>
          <input
              type="text"
              placeholder="e.g., Tour de France or Jonas Vingegaard"
              bind:value={searchTerm}
              on:input={searchRaces}
          />
  
          {#if isLoading}
              <p>Loading results...</p>
          {/if}
  
          {#if error}
              <p class="error-message">{error}</p>
          {/if}
  
          <div class="results-grid">
              {#each results as result (result.rider + result.position + result.name)}
                  <RaceCard {result} />
              {/each}
          </div>
      </div>
  
      <hr class="separator" />
  
      <RaceResults />
  </div>