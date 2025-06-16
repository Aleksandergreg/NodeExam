<script>
    import { onMount } from 'svelte';
    import { fetchGet } from '../../utils/fetchApi.js';
    import ArticleCard from '../../components/News/ArticleCard.svelte';
    import '../../styles/NewsPage.css';

    let articles = $state([]);
    let isLoading = $state(true);

    onMount(async () => {
        try {
            articles = await fetchGet('/news');
        } catch (error) {
            console.error("Failed to fetch news feed", error);
        } finally {
            isLoading = false;
        }
    });
</script>

<div class="news-page">
    <h1>Cycling News</h1>
    
    {#if isLoading}
        <p>Loading news feed...</p>
    {:else if articles.length === 0}
        <p>Could not load the news feed at this time. Please try again later.</p>
    {:else}
        <div class="articles-grid">
            {#each articles as article (article.id)}
                <ArticleCard {article} />
            {/each}
        </div>
    {/if}
</div>