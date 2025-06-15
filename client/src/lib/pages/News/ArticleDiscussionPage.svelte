<script>
    import { onMount } from 'svelte';
    import { fetchGet, fetchPost } from '../../utils/fetchApi.js';
    import { user as userStore } from '../../stores/authStore.js';
    import { toast } from 'svelte-5-french-toast';
    import '../../styles/ArticleDiscussionPage.css';
    import Comment from '../../components/News/Comment.svelte';

    let { articleId } = $props();
    
    let article = $state(null);
    let comments = $state([]);
    let isLoading = $state(true);
    let error = $state(null);
    
    let user = $state(null);
    userStore.subscribe(value => user = value);

    let newCommentContent = $state('');
    let isSubmitting = $state(false);

    async function fetchAllData() {
        try {
            const [articleData, commentsData] = await Promise.all([
                fetchGet(`/news/${articleId}`),
                fetchGet(`/news/${articleId}/comments`)
            ]);
            article = articleData;
            comments = commentsData;
        } catch (err) {
            error = err.data?.message || 'Failed to load article data.';
            toast.error(error);
        } finally {
            isLoading = false;
        }
    }

    onMount(fetchAllData);

    async function handleCommentSubmit(event) {
        event.preventDefault();
        if (!newCommentContent.trim()) {
            toast.error("Comment cannot be empty.");
            return;
        }
        isSubmitting = true;
        try {
            await fetchPost(`/news/${articleId}/comments`, {
                content: newCommentContent
            });
            
            comments = await fetchGet(`/news/${articleId}/comments`);

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
                        placeholder="Start a new discussion thread..." 
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

            <div class="comment-list">
                {#if comments.length === 0}
                    <div class="card no-comments">Be the first to comment.</div>
                {/if}
                {#each comments as comment (comment.id)}
                    <Comment {comment} {user} {articleId} />
                {/each}
            </div>
        </div>
    {/if}
</div>