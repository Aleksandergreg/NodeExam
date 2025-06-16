<script lang="ts">
    import { Toaster as FrenchToastToaster, type ToastPosition } from 'svelte-5-french-toast';

    export let position: ToastPosition = "top-right"; // Default position
</script>

<FrenchToastToaster {position} />