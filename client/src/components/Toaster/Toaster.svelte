<script lang="ts">
    import { Toaster as FrenchToastToaster, type ToastPosition } from 'svelte-5-french-toast';

    // Define the type for the component's props
    interface Props {
      position?: ToastPosition;
    }

    // Destructure props and set a default value for 'position'
    let { position = "top-right" }: Props = $props();
</script>

<FrenchToastToaster {position} />