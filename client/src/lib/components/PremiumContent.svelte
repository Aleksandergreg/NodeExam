<script>
    import { user } from '../stores/authStore.js';
</script>

{#if $user && $user.premium_status}
    <div>
        <h2>Welcome to the Premium Section!</h2>
        <p>Here you can find exclusive content available only to premium users.</p>
    </div>
{/if}