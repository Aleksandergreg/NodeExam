<script>
	let { questions, onSelectQuestion } = $props();
</script>

<div class="question-queue">
	<h4>Question Queue ({questions.length})</h4>
	{#if questions.length === 0}
		<p class="empty-queue">No pending questions.</p>
	{:else}
		<ul>
			{#each questions as question (question.id)}
				<li>
					<p><strong>{question.username}:</strong> {question.questionText}</p>
					<button onclick={() => onSelectQuestion(question)}>Answer</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.question-queue { border: 1px solid #dee2e6; border-radius: 8px; padding: 1.5rem; }
	h4 { margin: 0 0 1rem 0; }
	ul { list-style: none; padding: 0; margin: 0; max-height: 300px; overflow-y: auto; }
	li { display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid #e9ecef; }
	li:last-child { border-bottom: none; }
	p { margin: 0; flex-grow: 1; }
	.empty-queue { color: #6c757d; }
</style>