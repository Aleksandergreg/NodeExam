<script>
    import '../../styles/Comment.css';
    import { fetchPost } from '../../utils/fetchApi.js';
    import { toast } from 'svelte-5-french-toast';

    let { comment, user, articleId } = $props();
    
    let showReplyForm = $state(false);
    let replyContent = $state('');
    let isSubmittingReply = $state(false);

    let reactiveComment = $state(comment);

    async function handleUpvote() {
        if (!user) {
            toast.error("You must be logged in to vote.");
            return;
        }
        
        reactiveComment.upvotes += reactiveComment.has_voted ? -1 : 1;
        reactiveComment.has_voted = !reactiveComment.has_voted;

        try {
            await fetchPost(`/news/${reactiveComment.id}/vote`, {});
        } catch (err) {
            reactiveComment.upvotes += reactiveComment.has_voted ? -1 : 1;
            reactiveComment.has_voted = !reactiveComment.has_voted;
            toast.error("Failed to register vote.");
        }
    }

    async function handleReplySubmit(event) {
        event.preventDefault();
        if (!replyContent.trim()) return;
        
        isSubmittingReply = true;
        try {
            const newReply = await fetchPost(`/news/${articleId}/comments`, {
                content: replyContent,
                parent_comment_id: reactiveComment.id
            });
            if (!reactiveComment.replies) reactiveComment.replies = [];
            reactiveComment.replies = [...reactiveComment.replies, newReply];
            showReplyForm = false;
            replyContent = '';
        } catch(err) {
            toast.error("Failed to post reply.");
        } finally {
            isSubmittingReply = false;
        }
    }
</script>

<div class="comment-item card">
    <div class="comment-header">
        <span class="comment-author">{reactiveComment.username}</span>
        <span class="comment-date">{new Date(reactiveComment.created_at).toLocaleString()}</span>
    </div>
    <p class="comment-content">{reactiveComment.content}</p>
    <div class="comment-footer">
        <button class="vote-button" class:voted={reactiveComment.has_voted} onclick={handleUpvote} disabled={!user}>
            ▲ Upvote ({reactiveComment.upvotes})
        </button>
        <button class="reply-button" onclick={() => showReplyForm = !showReplyForm} disabled={!user}>
            Reply
        </button>
    </div>

    {#if showReplyForm}
        <form class="reply-form" onsubmit={handleReplySubmit}>
            <textarea bind:value={replyContent} placeholder="Write a reply..." rows="2" disabled={isSubmittingReply}></textarea>
            <button class="btn btn-primary" type="submit" disabled={isSubmittingReply}>
                {isSubmittingReply ? 'Replying...' : 'Submit'}
            </button>
        </form>
    {/if}

    {#if reactiveComment.replies && reactiveComment.replies.length > 0}
        <div class="replies-container">
            {#each reactiveComment.replies as reply (reply.id)}
                <!-- This is the recursion! -->
                <svelte:self comment={reply} {user} {articleId} />
            {/each}
        </div>
    {/if}
</div>