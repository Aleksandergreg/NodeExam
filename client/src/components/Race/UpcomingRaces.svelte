<script>
    import { onMount } from 'svelte';
    import { fetchGet } from '../../utils/fetchApi';

    let upcomingRaces = $state([]);
    let isLoading = $state(true);
    let error = $state(null);

    function calculateTimeLeft(targetDate) {
        const difference = new Date(targetDate) - new Date();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
            };
        }
        return timeLeft;
    }

    onMount(() => {
        let timer;
        
        async function loadRaces() {
            try {
                const data = await fetchGet('/sportradar/upcoming-races');
                upcomingRaces = data.map(race => ({
                    ...race,
                    timeLeft: calculateTimeLeft(race.scheduled)
                }));
            } catch (err) {
                error = "Could not load upcoming races.";
                console.error(err);
            } finally {
                isLoading = false;
            }
        }

        loadRaces().then(() => {
            timer = setInterval(() => {
                upcomingRaces = upcomingRaces.map(race => ({
                    ...race,
                    timeLeft: calculateTimeLeft(race.scheduled)
                })).filter(race => Object.keys(race.timeLeft).length > 0);
            }, 1000);
        });

        return () => clearInterval(timer);
    });

    const pad = (num) => num.toString().padStart(2, '0');
</script>

<style>
    .upcoming-races-container {
        margin-top: calc(var(--spacing-unit) * 2);
        margin-bottom: calc(var(--spacing-unit) * 2);
    }
    .upcoming-races-container h2 {
        text-align: center;
        margin-bottom: var(--spacing-unit);
        font-weight: 500;
        color: var(--text-color);
    }
    .races-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: var(--spacing-unit);
    }
    .race-countdown-card {
        background-color: var(--surface-color);
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius);
        padding: var(--spacing-unit);
        text-align: center;
        box-shadow: var(--box-shadow);
        display: flex;
        flex-direction: column;
    }
    .race-name {
        font-size: 1.1rem;
        font-weight: 600;
        color: #eceff4;
        margin-bottom: 0.25rem;
        flex-grow: 1;
    }
    .race-date {
        font-size: 0.9rem;
        color: var(--text-color-muted);
        margin-bottom: var(--spacing-unit);
    }
    .timer {
        display: flex;
        justify-content: center;
        gap: var(--spacing-unit);
    }
    .timer-segment {
        display: flex;
        flex-direction: column;
    }
    .timer-number {
        font-size: 1.75rem;
        font-weight: bold;
        color: var(--primary-color);
        line-height: 1;
    }
    .timer-label {
        font-size: 0.75rem;
        text-transform: uppercase;
        color: var(--text-color-muted);
    }
    .loading-text, .error-text {
        text-align: center;
        color: var(--text-color-muted);
        padding: var(--spacing-unit);
    }
</style>

<div class="upcoming-races-container">
    <h2>Upcoming World Tour Races</h2>
    {#if isLoading}
        <p class="loading-text">Loading upcoming races...</p>
    {:else if error}
        <p class="error-text">{error}</p>
    {:else if upcomingRaces.length > 0}
        <div class="races-grid">
            {#each upcomingRaces as race (race.id)}
                <div class="race-countdown-card">
                    <h3 class="race-name">{race.description}</h3>
                    <p class="race-date">{new Date(race.scheduled).toLocaleDateString()}</p>
                    <div class="timer">
                        <div class="timer-segment">
                            <span class="timer-number">{race.timeLeft.days || 0}</span>
                            <span class="timer-label">Days</span>
                        </div>
                        <div class="timer-segment">
                            <span class="timer-number">{pad(race.timeLeft.hours || 0)}</span>
                            <span class="timer-label">Hours</span>
                        </div>
                        <div class="timer-segment">
                            <span class="timer-number">{pad(race.timeLeft.minutes || 0)}</span>
                            <span class="timer-label">Minutes</span>
                        </div>
                        <div class="timer-segment">
                            <span class="timer-number">{pad(race.timeLeft.seconds || 0)}</span>
                            <span class="timer-label">Seconds</span>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {:else}
        <p class="loading-text">No upcoming races found in the schedule.</p>
    {/if}
</div>