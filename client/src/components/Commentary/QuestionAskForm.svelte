<script>
	import { toast } from 'svelte-5-french-toast';

	let { socket, raceId } = $props();
	let questionText = $state('');
	let isSubmitting = $state(false);

	function submitQuestion(event) {
        event.preventDefault(); // Prevent default form submission
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
	<form onsubmit={submitQuestion}>
		<textarea
			placeholder="Ask the commentators anything..."
			bind:value={questionText}
			disabled={isSubmitting}
			rows="3"
		></textarea>
		<button type="submit" class="btn btn-primary" disabled={isSubmitting || !questionText.trim()}>
			{isSubmitting ? 'Sending...' : 'Send Question'}
		</button>
	</form>
</div>