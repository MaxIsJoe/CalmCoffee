<script lang="ts">
	export let userComments = [];
	export let loadingComments = false;
</script>

<h3>Recent Comments</h3>
{#if loadingComments}
	<p>Loading comments...</p>
{:else if userComments.length === 0}
	<p>This user hasn't left any comments yet.</p>
{:else}
	<ul class="comments-list">
		{#each userComments as c}
			<li>
				<div class="comment-meta">
					{#if c.story_id}
						<a href={'/read/' + c.story_id} class="comment-story">{c.story_title || 'Story'}</a>
					{/if}
					<span class="comment-date">{new Date(c.created_at).toLocaleString()}</span>
				</div>
				<div class="comment-text">{c.comment}</div>
			</li>
		{/each}
	</ul>
{/if}

<style>
	.comments-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	.comments-list li {
		background: var(--color-card-bg);
		border-radius: 8px;
		padding: 1rem 1.2rem;
		margin-bottom: 1.1rem;
		box-shadow: 0 1px 4px var(--color-card-shadow);
	}
	.comment-meta {
		display: flex;
		align-items: center;
		gap: 1.2em;
		margin-bottom: 0.2em;
	}
	.comment-story {
		color: var(--color-link);
		font-weight: 500;
		text-decoration: none;
	}
	.comment-story:hover {
		text-decoration: underline;
	}
	.comment-date {
		color: var(--color-secondary);
		font-size: 0.97em;
	}
	.comment-text {
		color: var(--color-text);
		font-size: 1.05em;
		margin-top: 0.2em;
	}
	h3 {
		margin-top: 0;
		margin-bottom: 1rem;
		font-size: 1.2rem;
		color: var(--color-link);
	}
</style>
