<script>
    import { onMount, onDestroy } from 'svelte';
    import { router } from 'tinro';
    import io from 'socket.io-client';
    import { fetchGet, fetchPost } from '../../utils/fetchApi.js';
    import { user as userStore } from '../../stores/authStore.js';
    import CommentaryInput from '../../components/Commentary/CommentaryInput.svelte';
    import { toast } from 'svelte-5-french-toast';

    let { stageId } = $props();
    let comments = $state([]);
    let isLoading = $state(true);
    let user = $state(null);
    
    userStore.subscribe(value => user = value);

    let socket;

    async function fetchHistory() {
        try {
            comments = await fetchGet(`/commentary/${stageId}`);
        } catch (error) {
            toast.error("Could not load comment history.");
        } finally {
            isLoading = false;
        }
    }

    onMount(() => {
        fetchHistory();

        socket = io("http://localhost:8080", { withCredentials: true });

        socket.on('connect', () => {
            console.log('Socket connected, joining room:', stageId);
            socket.emit('join_race_room', stageId);
        });

        socket.on('new_commentary_update', (newComment) => {
            comments = [...comments, newComment];
        });

        return () => {
            console.log('Component destroying, leaving room:', stageId);
            socket.emit('leave_race_room', stageId);
            socket.disconnect();
        };
    });

</script>

<style>
    .commentary-container { max-width: 800px; margin: 2rem auto; padding: 2rem; background: #f9f9f9; border-radius: 8px; }
    .commentary-list { list-style: none; padding: 0; margin-top: 2rem; }
    .commentary-item { background: #fff; padding: 1rem; border-radius: 5px; margin-bottom: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .comment-meta { font-size: 0.85rem; color: #666; margin-bottom: 0.5rem; }
    .comment-meta strong { color: #333; }
    .comment-body { font-size: 1rem; color: #222; }
</style>

<div class="commentary-container">
    <h1>Live Commentary</h1>
    <p>Updates will appear here automatically.</p>

    {#if user?.role === 'admin'}
        <CommentaryInput {stageId} />
    {/if}

    {#if isLoading}
        <p>Loading commentary...</p>
    {:else}
        <ul class="commentary-list">
            {#each comments.slice().reverse() as comment (comment.id)}
                <li class="commentary-item">
                    <div class="comment-meta">
                        <strong>{comment.username}</strong> at {new Date(comment.created_at).toLocaleTimeString()}
                    </div>
                    <p class="comment-body">{comment.comment}</p>
                </li>
            {/each}
        </ul>
    {/if}
</div>