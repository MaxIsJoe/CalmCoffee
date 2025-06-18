<script lang="ts">
	import { supabase } from '$lib/supabaseClient';
	import { sendCommentNotification } from '$lib/notifications';

	export let blockId: string;
	export let comments: { id: string; commenter_id: string; comment: string; username?: string }[];
	export let onClose: () => void;

	let commentInput = '';
	let commentError = '';
	let submittingComment = false;

	async function submitComment() {
		const text = commentInput.trim();
		commentError = '';
		if (!text) {
			commentError = 'Comment cannot be empty.';
			return;
		}
		if (text.length > 300) {
			commentError = 'Comment must be 300 characters or less.';
			return;
		}
		submittingComment = true;
		const user = supabase.auth.getUser ? (await supabase.auth.getUser()).data.user : null;
		const commenter_id = user?.id;
		if (!commenter_id) {
			commentError = 'You must be logged in to comment.';
			submittingComment = false;
			return;
		}

		const { error } = await supabase
			.from('story_block_comments')
			.insert([{ id: blockId, commenter_id, comment: text }]);

		if (error) {
			commentError = 'Failed to post comment.\n' + error.message;
		} else {
			commentInput = '';
			// Refresh comments
			const { data } = await supabase
				.from('story_block_comments')
				.select('id, commenter_id, comment, created_at, profiles(username)')
				.eq('id', blockId)
				.order('created_at', { ascending: true });

			if (data) {
				comments = data.map(c => ({
					id: c.id,
					commenter_id: c.commenter_id,
					comment: c.comment,
					username: (c.profiles as { username: string }[])[0]?.username
				}));
			}

			// Send notification
			const { data: commenterProfile } = await supabase
				.from('profiles')
				.select('username')
				.eq('account_id', commenter_id)
				.single();

			if (commenterProfile?.username) {
				await sendCommentNotification({
					userId: commenter_id,
					commenterId: commenter_id,
					commenterUsername: commenterProfile.username,
					storyTitle: 'Story' // This should be passed as a prop if needed
				});
			}
		}
		submittingComment = false;
	}
</script>

<div class="global-comments-panel-backdrop" on:click={onClose}></div>
<div class="global-comments-panel">
	<button class="close-comments-panel" on:click={onClose} aria-label="Close comments">&times;</button>
	<h4>Comments</h4>
	{#if comments?.length}
		<ul>
			{#each comments as c}
				<li>
					<span class="comment-user">{c.username ?? c.commenter_id.slice(0, 8)}:</span>
					<span class="comment-text">{c.comment}</span>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="no-comments">No comments yet.</p>
	{/if}
	<form on:submit|preventDefault={submitComment}>
		<textarea
			bind:value={commentInput}
			maxlength="300"
			placeholder="Leave a comment (max 300 chars)..."
			rows="2"
		></textarea>
		<div class="comment-actions">
			<span class="char-count">{commentInput.length}/300</span>
			<button type="submit" disabled={submittingComment}>
				{submittingComment ? 'Posting...' : 'Post'}
			</button>
		</div>
		{#if commentError}
			<p class="comment-error">{commentError}</p>
		{/if}
	</form>
</div>

<style>
	.global-comments-panel-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(30, 41, 59, 0.18);
		z-index: 1000;
	}

	.global-comments-panel {
		position: fixed;
		top: 0;
		right: 0;
		width: 370px;
		max-width: 100vw;
		height: 100vh;
		background: #eef2ff;
		box-shadow: -2px 0 24px rgba(99, 102, 241, 0.1);
		padding: 2.2em 1.5em 1.5em 1.5em;
		z-index: 1001;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
	}

	.close-comments-panel {
		position: absolute;
		top: 1em;
		right: 1em;
		background: none;
		border: none;
		font-size: 2em;
		color: #6366f1;
		cursor: pointer;
		line-height: 1;
	}

	.global-comments-panel h4 {
		margin: 0 0 0.7em 0;
		font-size: 1.15em;
		color: #3730a3;
	}

	.global-comments-panel ul {
		list-style: none;
		padding: 0;
		margin: 0 0 0.5em 0;
	}

	.global-comments-panel li {
		margin-bottom: 0.4em;
		font-size: 0.98em;
	}

	.comment-user {
		color: #6366f1;
		font-weight: 500;
		margin-right: 0.5em;
	}

	.comment-text {
		color: #222;
	}

	.no-comments {
		color: #888;
		font-size: 0.97em;
		margin-bottom: 0.5em;
	}

	.global-comments-panel textarea {
		width: 100%;
		border-radius: 5px;
		border: 1px solid #c7d2fe;
		padding: 0.5em;
		font-size: 1em;
		resize: vertical;
		margin-bottom: 0.3em;
	}

	.comment-actions {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.char-count {
		font-size: 0.92em;
		color: #888;
	}

	.global-comments-panel button[type='submit'] {
		background: #6366f1;
		color: #fff;
		border: none;
		border-radius: 5px;
		padding: 0.35em 1.1em;
		font-size: 1em;
		cursor: pointer;
		transition: background 0.15s;
	}

	.global-comments-panel button[disabled] {
		background: #c7d2fe;
		cursor: not-allowed;
	}

	.comment-error {
		color: #dc2626;
		font-size: 0.97em;
		margin-top: 0.2em;
	}

	@media (max-width: 900px) {
		.global-comments-panel {
			width: 100vw;
			padding: 1.2em 0.5em 1em 0.5em;
		}
	}
</style> 