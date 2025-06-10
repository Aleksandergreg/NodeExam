<script>
	import { toast } from 'svelte-5-french-toast';

	let { socket, raceId } = $props();
	let questionText = $state('');
	let isSubmitting = $state(false);

	function submitQuestion() {
		if (!questionText.trim() || !socket) return;
		
		isSubmitting = true;
		socket.emit('user_sends_question', {
			raceId,
			questionText: questionText.trim()
		});

		toast.success('Your question has been sent to the commentators!');
		questionText = '';
		isSubmitting = false;
	}
</script>

<div class="ask-question-area">
	<h4>Ask a Question</h4>
	<form on:submit|preventDefault={submitQuestion}>
		<textarea
			placeholder="Ask the commentators anything..."
			bind:value={questionText}
			disabled={isSubmitting}
			rows="3"
		></textarea>
		<button type="submit" disabled={isSubmitting || !questionText.trim()}>
			{isSubmitting ? 'Sending...' : 'Send Question'}
		</button>
	</form>
</div>

<style>
	.ask-question-area { margin: 2rem 0; padding: 1.5rem; background: #e9ecef; border-radius: 8px; }
	h4 { margin: 0 0 1rem 0; color: #343a40; }
	textarea { width: 100%; box-sizing: border-box; padding: 0.5rem; border: 1px solid #ced4da; border-radius: 4px; margin-bottom: 0.5rem; }
	button { width: 100%; padding: 0.75rem; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
	button:disabled { background-color: #6c757d; }
</style>