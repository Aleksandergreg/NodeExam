<script>
	import { fetchPost } from '../../utils/fetchApi.js';
	import { toast } from 'svelte-5-french-toast';

	let { stageId } = $props();            
	let commentText   = $state('');
	let kmsToGo       = $state('');       
	let isSubmitting  = $state(false);

	async function submitComment(event) {
        event.preventDefault();     

		if (!commentText.trim()) {
			toast.error('Comment cannot be empty.');
			return;
		}

		isSubmitting = true;
		try {
			await fetchPost(`/commentary/${stageId}`, {
				comment   : commentText,
				kms_to_go : kmsToGo !== '' ? parseInt(kmsToGo, 10) : null
			});
			commentText = '';                
		} catch (err) {
			toast.error(err?.data?.message ?? 'Failed to post comment.');
		} finally {
			isSubmitting = false;
		}
	}
</script>

<style>
	.comment-input-area {
		margin-top: 2rem;
		border-top: 1px solid #eee;
		padding-top: 1.5rem;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.4rem;
		font-weight: 500;
		color: #333;
	}

	.form-group input,
	.form-group textarea {
		width: 100%;
		min-height: 44px;          /* textarea */
		padding: 10px;
		border-radius: 5px;
		border: 1px solid #ccc;
		margin-bottom: 10px;
		box-sizing: border-box;
	}

	button {
		display: block;
		width: 100%;
		padding: 10px;
		background-color: #007bff;
		color: #fff;
		border: none;
		border-radius: 5px;
		cursor: pointer;
		font-size: 1rem;
		transition: background-color 0.2s ease-in-out;
	}

	button:disabled {
		background-color: #555;
		cursor: not-allowed;
	}

	button:hover:not(:disabled) {
		background-color: #0056b3;
	}
</style>

<div class="comment-input-area">
	<h3>Post a New Update</h3>

	<form onsubmit={submitComment}>
		<div class="form-group">
			<label for="kms-input">Kilometers to Go</label>
			<input
				id="kms-input"
				type="number"
				placeholder="e.g., 60"
				bind:value={kmsToGo}
				disabled={isSubmitting}
			/>
		</div>

		<div class="form-group">
			<label for="comment-text-area">Comment</label>
			<textarea
				id="comment-text-area"
				placeholder="Type your commentary here..."
				bind:value={commentText}
				disabled={isSubmitting}
			></textarea>
		</div>

		<button type="submit" disabled={isSubmitting}>
			{isSubmitting ? 'Posting…' : 'Post Update'}
		</button>
	</form>
</div>
