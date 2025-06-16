<script>
    import '../../styles/RacesPage.css';
    import RaceResults from '../../components/Race/RaceResults.svelte';
  </script>
  
  <div class="races-container">
      <h1>Race Archives</h1>
      <p class="subtitle">Browse the Sportradar archive by year to find race schedules and details.</p>
      
      <hr class="separator" />
      
      <RaceResults />
  </div>