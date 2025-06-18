<script lang="ts">
	import { coffeeMarkdown, defaultStyles } from '$lib/md/coffeeMarkdown';
	import type { Database } from '../../../../database.types';
	import { usernameCache } from '$lib/stores/username_cache';
	import RelationshipGraphEditor from '$lib/comp/characters/RelationshipGraphEditor.svelte';
	import CharacterReactions from '$lib/comp/characters/CharacterReactions.svelte';
	import { sendLikeStoryNotification } from '$lib/notifications';
	import { supabase } from '$lib/supabaseClient';

	export let character: Database['public']['Tables']['characters']['Row'];
	export let previewMode = false;
	export let showReactions = true;
	export let showRelationships = true;
	export let showTags = true;

	let creatorUsername: string | null = null;
	let creatorProfileUrl: string | null = null;
	let formattedCreatedAt: string | null = null;

	const gender_flags = {
		M: '🧙‍♂️',
		F: '🧙‍♀️',
		NB: '🧙‍⚧️',
		I: '⚪'
	};

	$: if (character?.created_at) {
		const date = new Date(character.created_at);
		formattedCreatedAt = isNaN(date.getTime())
			? character.created_at
			: date.toLocaleDateString(undefined, {
					year: 'numeric',
					month: 'long',
					day: 'numeric',
					hour: '2-digit',
					minute: '2-digit'
				});
	}

	async function handleCharacterReaction(event: CustomEvent<{ reaction: string }>) {
		if (!character?.creator || !character.id) {
			console.error(`STOP RIGHT HERE CRIMINAL SCUM. creator: ${character?.creator}, character: ${character}`);
			return;
		}
		
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) {
			console.error("tried doing stuff without being logged in");
			return;
		}

		const { data: reactorProfile, error: dbError } = await supabase
			.from('profiles')
			.select('username')
			.eq('account_id', user.id)
			.single();

		if (dbError) {
			console.error(`${dbError}`);
		}

		if (reactorProfile?.username) {
			if (event.detail.reaction === "0") {
				await sendLikeStoryNotification({
					userId: character.creator,
					reactorId: user.id,
					reactorUsername: reactorProfile.username,
					storyTitle: character.character_name,
					reaction: event.detail.reaction
				});
			}
		}
	}

	function GetGenderFlagAndText() {
		if (!character) return '';
		return character.gender + gender_flags[character.gender] || '❓';
	}

	// Load creator username if not in preview mode
	$: if (!previewMode && character?.creator) {
		usernameCache.getUsername(character.creator).then(username => {
			creatorUsername = username;
			if (username) {
				creatorProfileUrl = `/profile/${username}`;
			}
		});
	}
</script>

<div class="character-profile-layout">
	<!-- Left side: Info Card + Relationships -->
	<div class="character-left-panel">
		<div class="character-info-card">
			{#if character.character_avatar}
				<img src={character.character_avatar} alt="Avatar" class="character-avatar" />
			{/if}
			<div class="info-fields">
				<div><strong>Name:</strong> {character.character_name}</div>
				<div><strong>Type:</strong> {character.character_type}</div>
				{#if character.date_of_birth}
					<div><strong>Date of Birth:</strong> {character.date_of_birth}</div>
				{/if}
				{#if character.gender}
					<div><strong>Gender:</strong> {GetGenderFlagAndText()}</div>
				{/if}
				{#if character.pronouns}
					<div><strong>Pronouns:</strong> {character.pronouns}</div>
				{/if}
				{#if !previewMode && character.created_at}
					<div><strong>Created:</strong> {formattedCreatedAt}</div>
				{/if}
				{#if !previewMode && creatorUsername && creatorProfileUrl}
					<div>
						<strong>
							{character.character_type === 'OC' || character.character_type === 'SONA'
								? 'Creator:'
								: 'Submitted by:'}
						</strong>
						<a href={creatorProfileUrl}>{creatorUsername}</a>
					</div>
				{/if}
			</div>
			{#if showReactions}
				<div class="character-reactions">
					<CharacterReactions characterId={character.id} on:react={handleCharacterReaction} />
				</div>
			{/if}
		</div>
		{#if showRelationships}
			<!-- Relationships panel below info card -->
			<div class="relationship-panel-left">
				<h2 style="margin-bottom:1rem;">Relationships</h2>
				<RelationshipGraphEditor {character} owner={false} minimal={true} />
			</div>
		{/if}
		{#if showTags && character.tags && character.tags.length}
			<!-- Tag panel below relationships -->
			<div class="tag-panel">
				<h2 class="tag-panel-title">Tags</h2>
				<div class="character-tags">
					{#each character.tags as tag}
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<span
							class="character-tag"
							tabindex="0"
							role="button"
							on:click={() => (window.location.href = `/search?tag=${encodeURIComponent(tag)}`)}
							>{tag}</span
						>
					{/each}
				</div>
			</div>
		{/if}
	</div>
	<!-- Right side: Description and details -->
	<div class="character-profile">
		<div class="character-details">
			<h1 class="character-name">{character.character_name}</h1>
			{#if character.character_desc}
				<div class="character-desc">
					<div class="desc-content">
						{@html coffeeMarkdown(character.character_desc, defaultStyles)}
					</div>
				</div>
			{/if}
			{#if character.art_links && character.art_links.length}
				<div class="character-art">
					<h3>Art Gallery</h3>
					<div class="art-gallery">
						{#each character.art_links as link}
							<a href={link} target="_blank" class="art-thumb-link">
								<img src={link} alt="Art" class="art-thumb" loading="lazy" />
							</a>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.character-profile-layout {
		display: flex;
		flex-direction: row;
		align-items: flex-start;
		justify-content: center;
		gap: 2.5rem;
	}
	.character-left-panel {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rem;
		min-width: 320px;
		max-width: 340px;
		margin-top: 29px;
		margin-left: 12px;
		padding-bottom: 50px;
	}
	.character-info-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		background: var(--color-character-card-bg);
		border-radius: 12px;
		box-shadow: 0 2px 12px var(--color-character-card-shadow);
		padding: 2rem 1.5rem;
		width: 100%;
		gap: 1.2rem;
	}
	.character-info-card .character-avatar {
		width: 100px;
		height: 100px;
		border-radius: 50%;
		object-fit: cover;
		border: 2px solid var(--color-character-avatar-border);
		background: var(--color-character-avatar-bg);
		box-shadow: 0 2px 8px var(--color-character-avatar-shadow);
		margin-bottom: 0.7rem;
	}
	.info-fields {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
		font-size: 1.05rem;
		color: var(--color-character-info-text, #353857);
		background: var(--color-character-info-bg, #f4f6fb);
		border-radius: 10px;
		padding: 1.1rem 1.2rem 1.1rem 1.2rem;
		box-shadow: 0 1px 4px var(--color-character-info-shadow, #0001);
	}
	.info-fields > div {
		padding: 0.4rem 0.2rem;
		border-bottom: 1px solid var(--color-character-info-border, #e5e7eb);
		display: flex;
		align-items: center;
	}
	.info-fields > div:last-child {
		border-bottom: none;
	}
	.info-fields strong {
		min-width: 110px;
		font-weight: 600;
		color: var(--color-character-info-label, #6366f1);
		margin-right: 0.7rem;
		letter-spacing: 0.01em;
	}
	.info-fields ul {
		margin: 0.2rem 0 0 0.7rem;
		padding: 0;
	}
	.info-fields li {
		margin-bottom: 0.15rem;
	}
	.info-fields a {
		color: var(--color-link);
		text-decoration: underline;
		word-break: break-all;
		transition: color 0.15s;
	}
	.info-fields a:hover {
		color: var(--color-link-hover);
		text-decoration: underline wavy;
	}
	.relationship-panel-left {
		width: 100%;
		background: var(--color-character-relationship-bg, #fff);
		border-radius: 12px;
		box-shadow: 0 2px 12px var(--color-character-relationship-shadow, rgba(30, 34, 54, 0.07));
		padding: 1.5rem 1.2rem;
	}
	.character-profile {
		display: flex;
		flex-direction: column;
		align-items: center;
		background: var(--color-card-bg);
		border-radius: 12px;
		box-shadow: 0 2px 12px var(--color-card-shadow);
		padding: 2rem 1.5rem;
		min-width: 50%;
		margin: 2rem auto;
		gap: 1.5rem;
	}
	.character-details {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.7rem;
	}
	.character-name {
		font-size: 2rem;
		font-weight: 700;
		margin: 0;
		color: var(--color-character-name, var(--color-text));
		text-align: center;
	}
	.character-meta {
		display: flex;
		gap: 1.2rem;
		font-size: 1.05rem;
		color: var(--color-secondary);
		justify-content: center;
	}
	.character-type {
		background: var(--color-bg-alt);
		border-radius: 4px;
		padding: 0.1rem 0.7rem;
		font-weight: 500;
		color: var(--color-character-type, var(--color-link));
	}
	.character-dob {
		background: var(--color-bg-alt);
		border-radius: 4px;
		padding: 0.1rem 0.7rem;
		color: var(--color-link);
	}
	.character-creator {
		background: var(--color-bg-alt);
		border-radius: 4px;
		padding: 0.1rem 0.7rem;
		color: var(--color-link);
		font-weight: 500;
	}
	.character-creator a {
		color: var(--color-link);
		text-decoration: underline;
	}
	.character-creator a:hover {
		color: var(--color-link-hover);
	}
	.character-desc {
		width: 100%;
		background: var(--color-bg-alt);
		border-radius: 8px;
		padding: 1rem;
		margin-top: 0.5rem;
		color: var(--color-text);
		word-wrap: break-word;
	}
	.desc-content {
		margin-top: 0.3rem;
		font-size: 1.05rem;
		line-height: 1.6;
	}
	.character-art {
		width: 100%;
		margin-top: 1.2rem;
	}
	.character-art h3 {
		margin-bottom: 0.5rem;
		font-size: 1.1rem;
		color: var(--color-primary);
	}
	.art-gallery {
		display: flex;
		flex-wrap: wrap;
		gap: 0.7rem;
		margin-top: 0.5rem;
	}
	.art-thumb-link {
		display: block;
		border-radius: 8px;
		overflow: hidden;
		box-shadow: 0 1px 6px var(--color-character-art-shadow, var(--color-card-shadow));
		transition: box-shadow 0.15s;
		max-width: 120px;
		max-height: 120px;
	}
	.art-thumb-link:hover {
		box-shadow: 0 2px 12px var(--color-character-art-shadow, var(--color-card-shadow));
	}
	.art-thumb {
		width: 120px;
		height: 120px;
		object-fit: cover;
		display: block;
		background: var(--color-character-art-bg, #f3f4f6);
	}
	.tag-panel {
		width: 100%;
		background: var(--color-character-tag-panel-bg, #fffdfa);
		border-radius: 12px;
		box-shadow: 0 1px 6px var(--color-character-tag-panel-shadow, #e0d7ce);
		padding: 1.2rem 1.2rem 1.1rem 1.2rem;
		margin-top: 1.2rem;
	}
	.tag-panel-title {
		font-size: 1.08em;
		color: var(--color-character-tag-panel-title, #7c5e48);
		margin-bottom: 0.7em;
	}
	.character-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5em;
	}
	.character-tag {
		background: var(--color-character-tag-bg);
		color: var(--color-character-tag-text);
		font-size: 0.97em;
		padding: 0.18em 0.7em;
		border-radius: 999px;
		font-weight: 500;
		letter-spacing: 0.01em;
		border: 1px solid var(--color-character-tag-border);
		cursor: pointer;
		transition:
			background 0.15s,
			color 0.15s;
	}
	.character-tag:hover,
	.character-tag:focus {
		background: var(--color-character-tag-hover-bg, #e0d7ce);
		color: var(--color-character-tag-hover-text, #a67c52);
		outline: none;
	}
	.character-reactions {
		margin: 1.5rem 0;
	}
	@media (max-width: 900px) {
		.character-profile-layout {
			flex-direction: column;
			align-items: stretch;
			gap: 1.5rem;
			padding: 0 1rem;
		}

		.character-left-panel {
			max-width: 100%;
			min-width: 0;
			margin: 1rem 0 0 0;
			padding-bottom: 1rem;
		}

		.character-info-card {
			padding: 1.5rem 1rem;
		}

		.character-info-card .character-avatar {
			width: 80px;
			height: 80px;
		}

		.info-fields {
			font-size: 0.95rem;
			padding: 0.8rem;
		}

		.info-fields strong {
			min-width: 90px;
			font-size: 0.9rem;
		}

		.character-profile {
			max-width: 100%;
			margin: 0;
			padding: 1.5rem 1rem;
		}

		.character-name {
			font-size: 1.7rem;
		}

		.character-desc {
			padding: 0.8rem;
		}

		.desc-content {
			font-size: 0.95rem;
		}

		.relationship-panel-left {
			max-width: 100%;
			padding: 1rem 0.8rem;
		}

		.relationship-panel-left h2 {
			font-size: 1.2rem;
		}

		.tag-panel {
			padding: 1rem;
		}

		.character-tag {
			font-size: 0.9rem;
			padding: 0.15em 0.6em;
		}

		.art-gallery {
			justify-content: center;
		}

		.art-thumb-link {
			max-width: 100px;
			max-height: 100px;
		}

		.art-thumb {
			width: 100px;
			height: 100px;
		}
	}

	@media (max-width: 480px) {
		.character-profile-layout {
			padding: 0 0.5rem;
		}

		.character-info-card {
			padding: 1.2rem 0.8rem;
		}

		.character-info-card .character-avatar {
			width: 70px;
			height: 70px;
		}

		.info-fields {
			font-size: 0.9rem;
			padding: 0.7rem;
		}

		.info-fields strong {
			min-width: 80px;
			font-size: 0.85rem;
		}

		.character-profile {
			padding: 1.2rem 0.8rem;
		}

		.character-name {
			font-size: 1.5rem;
		}

		.character-desc {
			padding: 0.7rem;
		}

		.desc-content {
			font-size: 0.9rem;
		}

		.relationship-panel-left {
			padding: 0.8rem 0.6rem;
		}

		.relationship-panel-left h2 {
			font-size: 1.1rem;
		}

		.tag-panel {
			padding: 0.8rem;
		}

		.character-tag {
			font-size: 0.85rem;
			padding: 0.12em 0.5em;
		}

		.art-thumb-link {
			max-width: 90px;
			max-height: 90px;
		}

		.art-thumb {
			width: 90px;
			height: 90px;
		}
	}
</style> 