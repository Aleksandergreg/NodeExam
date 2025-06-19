<script>
	let { questions, onSelectQuestion } = $props();
</script>

<div class="question-queue card">
	<h4>Question Queue ({questions.length})</h4>
	{#if questions.length === 0}
		<p class="empty-queue">No pending questions.</p>
	{:else}
		<ul class="question-list">
			{#each questions as question (question.id)}
				<li>
					<p><strong>{question.username}:</strong> {question.question_text}</p>
					<button class="btn btn-secondary" onclick={() => onSelectQuestion(question)}>Answer</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>