<script>
    import { fetchPost } from '../../utils/fetchApi.js';
    import { toast } from 'svelte-5-french-toast';

    let { stageId } = $props();
    let commentText = $state('');
    let isSubmitting = $state(false);

    async function submitComment() {
        if (!commentText.trim()) return;
        isSubmitting = true;
        try {
            await fetchPost(`/commentary/${stageId}`, { comment: commentText });
            commentText = ''; // Clear input on success
        } catch (error) {
            toast.error(error.data?.message || "Failed to post comment.");
        } finally {
            isSubmitting = false;
        }
    }
</script>

<style>
    .comment-input-area { margin-top: 2rem; border-top: 1px solid #eee; padding-top: 1.5rem; }
    textarea { width: 100%; min-height: 80px; padding: 10px; border-radius: 5px; border: 1px solid #ccc; margin-bottom: 10px; }
    button { display: block; width: 100%; padding: 10px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; }
</style>

<div class="comment-input-area">
    <h3>Post a New Update</h3>
    <textarea placeholder="Type your commentary here..." bind:value={commentText} disabled={isSubmitting}></textarea>
    <button onclick={submitComment} disabled={isSubmitting}>
        {isSubmitting ? 'Posting...' : 'Post Update'}
    </button>
</div>
