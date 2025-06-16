<script>
    let { forecast } = $props();

    const iconUrl = forecast?.icon 
        ? `https://www.weatherbit.io/static/img/icons/${forecast.icon}.png` 
        : '';
</script>

<div class="weather-widget">
    <h4>Race Day Weather</h4>
    <div class="weather-content">
        {#if iconUrl}
            <img src={iconUrl} alt={forecast.description} class="weather-icon" />
        {/if}
        <div class="weather-details">
            <p class="temp">{Math.round(forecast.temp)}°C</p>
            <p class="description">{forecast.description}</p>
            <p class="wind">Wind: {forecast.wind_speed} m/s</p>
        </div>
    </div>
</div>

<style>
    .weather-widget {
        background-color: #34495e;
        padding: 1.5rem;
        border-radius: 8px;
        text-align: center;
        margin-top: -1.5rem;
        margin-bottom: 3rem;
    }
    h4 {
        margin: 0 0 1rem 0;
        color: #95a5a6;
        font-weight: 600;
        text-transform: uppercase;
        font-size: 0.9rem;
        letter-spacing: 0.5px;
    }
    .weather-content {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1rem;
    }
    .weather-icon {
        width: 60px;
        height: 60px;
        filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.2));
    }
    .weather-details p {
        margin: 0;
        color: #ecf0f1;
    }
    .temp {
        font-size: 2rem;
        font-weight: bold;
    }
    .description {
        text-transform: capitalize;
        color: #bdc3c7;
    }
    .wind {
        font-size: 0.9rem;
        color: #bdc3c7;
    }
</style>