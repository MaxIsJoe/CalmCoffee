<script lang="ts">
	import { slugify } from '$lib/utils/slugify';
	export let stories = [];
	export let authors = {};
</script>

<h3>All Stories</h3>
{#if stories.length > 0}
	<div class="works-list">
		{#each stories as story}
			<div class="work-card">
				<div class="work-info">
					<a href={'/read/' + (story.user_id && authors[story.user_id] ? authors[story.user_id] + '/' + slugify(story.title) : story.id)}><strong>{story.title}</strong></a>
					{#if story.description}
						<p>{story.description}</p>
					{/if}
					<div class="story-dates">
						{#if story.created_at}
							<small>Created: {new Date(story.created_at).toLocaleDateString()}</small>
						{/if}
						{#if story.updated_at && story.updated_at !== story.created_at}
							<small style="margin-left:1.2em;"
								>Updated: {new Date(story.updated_at).toLocaleDateString()}</small
							>
						{/if}
					</div>
				</div>
			</div>
		{/each}
	</div>
{:else}
	<p>This user hasn't published any works yet.</p>
{/if}

<style>
	.works-list {
		display: flex;
		flex-direction: column;
		gap: 1.2rem;
	}
	.work-card {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		background: var(--color-card-bg);
		border-radius: 8px;
		padding: 1rem;
		box-shadow: 0 1px 4px var(--color-card-shadow);
	}
	.work-info {
		flex: 1;
	}
	.work-info a {
		color: var(--color-link);
		text-decoration: none;
		font-size: 1.1rem;
	}
	.work-info a:hover {
		text-decoration: underline;
	}
	.work-info p {
		margin: 0.3rem 0 0.2rem 0;
		color: var(--color-text);
	}
	.work-info small {
		color: var(--color-secondary);
	}
	.story-dates {
		margin-top: 0.2em;
	}
	.story-dates small {
		color: var(--color-secondary);
		font-size: 0.97em;
	}
	h3 {
		margin-top: 0;
		margin-bottom: 1rem;
		font-size: 1.3rem;
		color: var(--color-link);
	}
</style>
