<script>
    import { onMount } from 'svelte';
    import { fetchGet, fetchPost } from '../../utils/fetchApi.js';
    import { user as userStore } from '../../stores/authStore.js';
    import { toast } from 'svelte-5-french-toast';
    import '../../styles/ArticleDiscussionPage.css';

    let { articleId } = $props();
    
    let article = $state(null);
    let comments = $state([]);
    let isLoading = $state(true);
    let error = $state(null);
    
    let user = $state(null);
    userStore.subscribe(value => user = value);

    let newCommentContent = $state('');
    let isSubmitting = $state(false);

    onMount(async () => {
        try {
            const [articleData, commentsData] = await Promise.all([
                fetchGet(`/api/news/${articleId}`),
                fetchGet(`/api/news/${articleId}/comments`)
            ]);
            article = articleData;
            comments = commentsData;
        } catch (err) {
            error = err.data?.message || 'Failed to load article data.';
            toast.error(error);
        } finally {
            isLoading = false;
        }
    });

    async function handleCommentSubmit(event) {
        event.preventDefault();
        if (!newCommentContent.trim()) {
            toast.error("Comment cannot be empty.");
            return;
        }
        isSubmitting = true;
        try {
            const newComment = await fetchPost(`/api/news/${articleId}/comments`, {
                content: newCommentContent
            });
            comments = [...comments, newComment];
            newCommentContent = ''; 
            toast.success("Comment posted!");
        } catch (err) {
            toast.error(err.data?.message || "Failed to post comment.");
        } finally {
            isSubmitting = false;
        }
    }
</script>

<div class="discussion-page">
    {#if isLoading}
        <p>Loading article...</p>
    {:else if error}
        <p class="error-message">{error}</p>
    {:else if article}
        <div class="article-header card">
            <h1>{article.title}</h1>
            <div class="article-meta">
                <span>Source: <a href={article.article_url} target="_blank" rel="noopener noreferrer">{article.source_name}</a></span>
                <span>Published: {new Date(article.published_at).toLocaleDateString()}</span>
            </div>
            {#if article.image_url}
                <img src={article.image_url} alt={article.title} class="article-image-featured" />
            {/if}
            <p class="article-summary">{article.summary}</p>
        </div>

        <div class="comments-section">
            <h2>Discussion ({comments.length})</h2>

            {#if user}
                <form class="card comment-form" onsubmit={handleCommentSubmit}>
                    <textarea 
                        placeholder="Join the discussion..." 
                        bind:value={newCommentContent}
                        disabled={isSubmitting}
                        rows="4"
                    ></textarea>
                    <button type="submit" class="btn btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Posting...' : 'Post Comment'}
                    </button>
                </form>
            {:else}
                <p class="login-prompt">
                    <a href="/login">Log in</a> to join the discussion.
                </p>
            {/if}

            <ul class="comment-list">
                {#if comments.length === 0}
                    <li class="card no-comments">Be the first to comment.</li>
                {/if}
                {#each comments as comment (comment.id)}
                    <li class="card comment-item">
                        <div class="comment-header">
                            <span class="comment-author">{comment.username}</span>
                            <span class="comment-date">{new Date(comment.created_at).toLocaleString()}</span>
                        </div>
                        <p class="comment-content">{comment.content}</p>
                    </li>
                {/each}
            </ul>
        </div>
    {/if}
</div>