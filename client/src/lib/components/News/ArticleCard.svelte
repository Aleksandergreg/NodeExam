<script>
    import '../../styles/ArticleCard.css';
    let { article } = $props();
</script>

<div class="card article-card">
    {#if article.image_url}
        <a href={article.article_url} target="_blank" rel="noopener noreferrer" class="article-image-link">
            <img src={article.image_url} alt={article.title} class="article-image" />
        </a>
    {/if}
    <div class="article-content">
        <span class="article-source">{article.source_name}</span>
        <a href={article.article_url} target="_blank" rel="noopener noreferrer">
            <h3 class="article-title">{article.title}</h3>
        </a>
        <p class="article-summary">{article.summary}</p>
        <div class="article-footer">
            <a href={`/news/${article.id}`} class="btn btn-secondary">
                Discuss ({article.comment_count})
            </a>
            <span class="article-date">{new Date(article.published_at).toLocaleDateString()}</span>
        </div>
    </div>
</div>