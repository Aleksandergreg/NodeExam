<script>
    import { user as userStore } from '../../stores/authStore.js';
    import PremiumContent from '../../components/Premium/PremiumContent.svelte';
    import UpcomingRaces from '../../components/Race/UpcomingRaces.svelte';

    let user = $state(null);
	userStore.subscribe(value => user = value);
</script>

<h1>Welcome to CyclingHub!</h1>
<p>
    Your one-stop place for past race results, live commentary, and the latest cycling news. Explore the archives, follow live races, and join the discussion!
</p>

<hr class="separator" style="margin: calc(var(--spacing-unit) * 2) 0;" />

<UpcomingRaces />

{#if user && user.premium_status}
    <hr class="separator" style="margin: calc(var(--spacing-unit) * 2) 0;" />
    <PremiumContent />
{/if}