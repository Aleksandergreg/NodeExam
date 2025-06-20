<script>
	import { fetchPost } from '../../utils/fetchApi.js';
	import { toast } from 'svelte-5-french-toast';

	let { stageId, socket, questionToAnswer = null } = $props();
	let commentText = $state('');
	let kmsToGo = $state('');
	let isSubmitting = $state(false);

	async function submitComment(event) {
		event.preventDefault();

		if (!commentText.trim()) {
			toast.error('Answer cannot be empty.');
			return;
		}

		isSubmitting = true;

		try {
			if (questionToAnswer) {
				socket.emit('admin_answers_question', {
					raceId: stageId,
					question: questionToAnswer,
					answerText: commentText.trim()
				});
			} else {
				await fetchPost(`/commentaries/${stageId}`, {
					comment: commentText,
					kms_to_go: kmsToGo !== '' ? parseInt(kmsToGo, 10) : null
				});
			}
			commentText = '';
		} catch (err) {
			toast.error(err?.data?.message ?? 'Failed to post update.');
		} finally {
			isSubmitting = false;
		}
	}
</script>


<div class="comment-input-area">
	<h3>{questionToAnswer ? 'Answer Question' : 'Post a New Update'}</h3>

    {#if questionToAnswer}
        <div class="answering-question">
            <p><strong>{questionToAnswer.username}:</strong> "{questionToAnswer.question_text}"</p>
        </div>
    {/if}

	<form onsubmit={submitComment}>
        {#if !questionToAnswer}
		<div class="form-group">
			<label for="kms-input">Kilometers to Go (Optional)</label>
			<input id="kms-input" type="number" placeholder="e.g., 60" bind:value={kmsToGo} disabled={isSubmitting} />
		</div>
        {/if}

		<div class="form-group">
			<label for="comment-text-area">{questionToAnswer ? 'Your Answer' : 'Comment'}</label>
			<textarea id="comment-text-area" placeholder="Type your commentary here..." bind:value={commentText} disabled={isSubmitting} rows="4"></textarea>
		</div>

		<button type="submit" disabled={isSubmitting}>
			{isSubmitting ? 'Posting…' : 'Post Update'}
		</button>
	</form>
</div>


<style>
	/* Styles remain the same, adding one for the answered question */
    .answering-question { background-color: #fffbe6; border: 1px solid #ffe58f; padding: 1rem; margin-bottom: 1rem; border-radius: 4px; }
    .answering-question p { margin: 0; }
	.comment-input-area { margin-top: 2rem; border-top: 1px solid #eee; padding-top: 1.5rem; }
	.form-group { margin-bottom: 1rem; }
	.form-group label { display: block; margin-bottom: 0.4rem; font-weight: 500; color: #28a745; }
	.form-group input, .form-group textarea { width: 100%; min-height: 44px; padding: 10px; border-radius: 5px; border: 1px solid #ccc; margin-bottom: 10px; box-sizing: border-box; }
	button { display: block; width: 100%; padding: 10px; background-color: #28a745; color: #fff; border: none; border-radius: 5px; cursor: pointer; font-size: 1rem; }
	button:disabled { background-color: #555; cursor: not-allowed; }
</style>