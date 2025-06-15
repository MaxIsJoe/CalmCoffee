<script lang="ts">
	type Priority = 'high' | 'medium' | 'low';
	type Status = 'In Progress' | 'Planned' | 'Completed';

	interface RoadmapItem {
		title: string;
		description: string;
		priority: Priority;
		status: Status;
	}

	interface GroupedRoadmapItems {
		status: Status;
		items: RoadmapItem[];
	}

	// Priority weights for sorting
	const priorityWeights: Record<Priority, number> = {
		high: 3,
		medium: 2,
		low: 1
	};

	// Roadmap items
	const roadmapItems: RoadmapItem[] = [
		{
			title: 'Story Editor',
			description: 'Create a rich text editor with custom markdown support',
			priority: 'high',
			status: 'In Progress'
		},
		{
			title: 'Mobile Layout Support',
			description: 'Provide better layout/functionality support for mobiles.',
			priority: 'medium',
			status: 'In Progress'
		},
		{
			title: 'Art Achieve',
			description: 'Add a way for users to showcase their art and have a way to point users at where the art is uploaded on other platforms',
			priority: 'medium',
			status: 'Planned'
		},
		{
			title: 'Comments System - Blogs',
			description: 'Add ability for readers to comment on blogs',
			priority: 'low',
			status: 'Planned'
		},
		{
			title: '[Paid] - Jukebox/Sound Manager',
			description: 'Give writers the ability to turn their stories into audio books.',
			priority: 'low',
			status: 'Planned'
		},
		{
			title: 'Reaction System - Stories',
			description: 'Add ability for readers to watch/like stories they enjoy',
			priority: 'high',
			status: 'Completed'
		},
		{
			title: 'Comments System - Stories',
			description: 'Add ability for readers to comment on stories',
			priority: 'medium',
			status: 'Completed'
		},
		{
			title: 'Reaction System - Characters',
			description: 'Add ability for readers to show their love for specific characters',
			priority: 'medium',
			status: 'Completed'
		},
		{
			title: 'Reaction System - Microblogs',
			description: 'Add ability for readers to react to other thoughts',
			priority: 'low',
			status: 'Completed'
		},
		{
			title: 'Microblogs',
			description: 'Add the ability for writers to write down their thoughts outside of stories.',
			priority: 'low',
			status: 'Completed'
		},
		{
			title: 'User Profiles',
			description: 'Add the ability to view all the content a user produces on this website via their profile',
			priority: 'high',
			status: 'Completed'
		},
        {
			title: 'Character Database',
			description: 'Users should be able to catalogue and share their OCs and Sonas',
			priority: 'high',
			status: 'Completed'
		},
		{
			title: 'Basic Layout',
			description: 'Implement a basic layout for the website.',
			priority: 'high',
			status: 'Completed'
		}
	];

	// Priority colors for visual indication
	const priorityColors: Record<Priority, string> = {
		high: '#ef4444',
		medium: '#f59e0b',
		low: '#10b981'
	};

	// Status colors
	const statusColors: Record<Status, string> = {
		'In Progress': '#3b82f6',
		'Planned': '#8b5cf6',
		'Completed': '#10b981'
	};

	function getSortedAndGroupedRoadmapItems(items: RoadmapItem[]): GroupedRoadmapItems[] {
		const grouped: Record<Status, RoadmapItem[]> = {
			'In Progress': [],
			'Planned': [],
			'Completed': []
		};

		items.forEach(item => {
			grouped[item.status].push(item);
		});

		const sortedGroups: GroupedRoadmapItems[] = [];
		const columnOrder: Status[] = ['In Progress', 'Planned', 'Completed'];

		columnOrder.forEach(status => {
			if (grouped[status].length > 0) {
				// Sort items within each group by priority
				const sortedItems = [...grouped[status]].sort((a, b) => {
					return priorityWeights[b.priority] - priorityWeights[a.priority];
				});
				sortedGroups.push({ status, items: sortedItems });
			}
		});

		return sortedGroups;
	}
</script>

<div class="roadmap-container">
	<h1>Calm Coffee Roadmap</h1>
	<p class="subtitle">The journey to create a cozy platform for writers and readers</p>

	<div class="timeline-container">
		{#each getSortedAndGroupedRoadmapItems(roadmapItems) as statusGroup}
			<div class="timeline-section">
				<h2 class="timeline-status-header" style="background-color: {statusColors[statusGroup.status]}">{statusGroup.status}</h2>
				<div class="timeline-items">
					{#each statusGroup.items as item}
						<div class="timeline-item">
							<div class="timeline-marker" style="background-color: {priorityColors[item.priority]}"></div>
							<div class="timeline-content">
								<h3>{item.title}</h3>
								<p>{item.description}</p>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>

	<div class="legends">
		<div class="legend">
			<h3>Priority Legend</h3>
			<div class="legend-items">
				<div class="legend-item">
					<div class="priority-indicator" style="background-color: {priorityColors.high}"></div>
					<span>High Priority</span>
				</div>
				<div class="legend-item">
					<div class="priority-indicator" style="background-color: {priorityColors.medium}"></div>
					<span>Medium Priority</span>
				</div>
				<div class="legend-item">
					<div class="priority-indicator" style="background-color: {priorityColors.low}"></div>
					<span>Low Priority</span>
				</div>
			</div>
		</div>
	</div>

    <div class="note-section">
        <div class="note-content">
            <h3>Important Note</h3>
            <p>Content with the <a href="/search?tag=debug">[debug]</a> tag will be automatically deleted in the future.</p>
            <p>As Calm Coffee continues being developed, some of your published content may be removed or purged.</p>
        </div>
    </div>
</div>

<style>
	.roadmap-container {
		max-width: 1400px;
		margin: 0 auto;
		padding: 2rem;
	}

	h1 {
		text-align: center;
		font-size: 2.5rem;
		margin-bottom: 0.5rem;
		color: #1f2937;
	}

	.subtitle {
		text-align: center;
		color: #6b7280;
		margin-bottom: 3rem;
	}

	.timeline-container {
		display: flex;
		flex-direction: column;
		gap: 3rem;
		position: relative;
		padding-left: 80px;
		margin-bottom: 3rem;
	}

	.timeline-container::before {
		content: '';
		position: absolute;
		left: 35px;
		top: 0;
		width: 2px;
		height: 100%;
		background-color: #e5e7eb;
	}

	.timeline-section {
		background: none;
		border-radius: 0;
		box-shadow: none;
		padding-bottom: 0;
		position: relative;
	}

	.timeline-status-header {
		padding: 0.5rem 1rem;
		border-radius: 9999px;
		width: fit-content;
		margin: 0 auto 1.5rem 60px;
		font-size: 1.1rem;
		text-align: center;
		position: relative;
		z-index: 1;
		color: white;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.timeline-status-header::before {
		content: '';
		position: absolute;
		left: -25px;
		top: 50%;
		transform: translateY(-50%);
		width: 25px;
		height: 2px;
		background-color: #e5e7eb;
		z-index: 0;
	}

	.timeline-items {
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.timeline-item {
		background: white;
		padding: 1.25rem;
		border-radius: 0.5rem;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		position: relative;
		min-width: unset;
		max-width: 100%;
		height: auto;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		flex: none;
		margin-left: 25px;
		margin-bottom: 2rem;
	}

	.timeline-item::before {
		content: '';
		position: absolute;
		left: -40px;
		top: 50%;
		transform: translateY(-50%);
		width: 20px;
		height: 2px;
		background-color: #e5e7eb;
		z-index: 0;
	}

	.timeline-marker {
		position: absolute;
		left: -48px;
		top: 50%;
		transform: translateY(-50%);
		width: 12px;
		height: 12px;
		border-radius: 50%;
		border: 2px solid white;
		z-index: 1;
	}

	.timeline-content {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.timeline-item h3 {
		margin: 0 0 0.5rem 0;
		font-size: 1.25rem;
		color: #1f2937;
		line-height: 1.3;
	}

	.timeline-item p {
		margin: 0;
		color: #6b7280;
		font-size: 1rem;
		line-height: 1.5;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.priority-indicator {
		position: static;
		width: 12px;
		height: 12px;
		border-radius: 50%;
		margin-right: 0.75rem;
		flex-shrink: 0;
	}

	.legends {
		display: flex;
		justify-content: center;
		margin-top: 2rem;
	}

	.legend {
		background: white;
		padding: 1rem 2rem;
		border-radius: 0.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.legend h3 {
		margin: 0 0 1rem 0;
		font-size: 1.1rem;
		color: #1f2937;
	}

	.legend-items {
		display: flex;
		gap: 1.5rem;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.legend-item .priority-indicator {
		position: static;
		width: 12px;
		height: 12px;
		border-radius: 50%;
	}

	.timeline-items::-webkit-scrollbar {
		display: none;
	}

	@media (max-width: 768px) {
		.timeline-item {
			flex-direction: column;
			align-items: flex-start;
		}
		.priority-indicator {
			margin-bottom: 0.5rem;
			margin-right: 0;
		}
		.timeline-marker {
			left: -20px;
		}
	}

	.note-section {
		margin-top: 3rem;
		padding: 0 1rem;
	}

	.note-content {
		background: #fff3e0;
		border-left: 4px solid #f59e0b;
		padding: 1.5rem;
		border-radius: 0.5rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
	}

	.note-content h3 {
		color: #92400e;
		margin: 0 0 0.75rem 0;
		font-size: 1.1rem;
		font-weight: 600;
	}

	.note-content p {
		color: #78350f;
		margin: 0.5rem 0;
		font-size: 0.95rem;
		line-height: 1.5;
	}

	.note-content p:last-child {
		margin-bottom: 0;
	}

	@media (max-width: 768px) {
		.note-section {
			padding: 0 0.5rem;
		}

		.note-content {
			padding: 1rem;
		}
	}
</style>
