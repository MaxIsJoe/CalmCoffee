<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchMyCharacters, type Character } from '../../db/characters';
	import { onDestroy } from 'svelte';

	export let value: string = ''; // bindable ISO date (YYYY-MM-DD)
	export let previewMode: boolean = false;
	export let previewColor: string | undefined = undefined;

	const formats = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'];
	let userFormat: string = formats[0];

	let today = new Date();
	let currentMonth = today.getMonth();
	let currentYear = today.getFullYear();

	const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

	let showCalendar = false;
	let calendarRef: HTMLDivElement | null = null;
	let inputRef: HTMLInputElement | null = null;
	let manualInput = '';
	let inputError = false;

	let myCharacters: Character[] = [];
	let monthCharacters: Character[] = [];
	let avatarsDistributed = false;
	let avatarPositions: { [id: number]: { left: number; top: number } } = {};
	let dayEls: { [day: number]: HTMLDivElement } = {};

	// Load format preference
	onMount(() => {
		const savedFormat = localStorage.getItem('preferredDateFormat');
		if (savedFormat && formats.includes(savedFormat)) {
			userFormat = savedFormat;
		}
	});

	function updateFormat(format: string) {
		userFormat = format;
		localStorage.setItem('preferredDateFormat', format);
	}

	function selectDate(year: number, month: number, day: number) {
		const date = new Date(year, month, day);
		value = date.toISOString().split('T')[0]; // bindable ISO format
	}

	function formatDate(dateStr: string): string {
		if (!dateStr) return '';
		const date = new Date(dateStr);
		const yyyy = date.getFullYear();
		const mm = String(date.getMonth() + 1).padStart(2, '0');
		const dd = String(date.getDate()).padStart(2, '0');

		switch (userFormat) {
			case 'MM/DD/YYYY':
				return `${mm}/${dd}/${yyyy}`;
			case 'DD/MM/YYYY':
				return `${dd}/${mm}/${yyyy}`;
			case 'YYYY-MM-DD':
				return `${yyyy}-${mm}-${dd}`;
			default:
				return dateStr;
		}
	}

	function prevMonth() {
		if (currentMonth === 0) {
			currentMonth = 11;
			currentYear -= 1;
		} else {
			currentMonth -= 1;
		}
		filterMonthCharacters();
	}

	function nextMonth() {
		if (currentMonth === 11) {
			currentMonth = 0;
			currentYear += 1;
		} else {
			currentMonth += 1;
		}
		filterMonthCharacters();
	}

	function getDaysInMonth(year: number, month: number) {
		const firstDay = new Date(year, month, 1).getDay();
		const daysInMonth = new Date(year, month + 1, 0).getDate();

		const days = [];
		let day = 1;

		for (let i = 0; i < 6; i++) {
			const week = [];
			for (let j = 0; j < 7; j++) {
				if ((i === 0 && j < firstDay) || day > daysInMonth) {
					week.push(null);
				} else {
					week.push(day++);
				}
			}
			days.push(week);
		}

		return days;
	}

	function isSelected(day: number) {
		const date = new Date(currentYear, currentMonth, day);
		return value === date.toISOString().split('T')[0];
	}

	function handleInputClick() {
		if (!previewMode) showCalendar = !showCalendar;
	}

	function handleDateSelect(year: number, month: number, day: number) {
		selectDate(year, month, day);
		showCalendar = false;
	}

	function handleClickOutside(event: MouseEvent) {
		if (
			calendarRef &&
			!calendarRef.contains(event.target as Node) &&
			inputRef &&
			!inputRef.contains(event.target as Node)
		) {
			showCalendar = false;
		}
	}

	function parseManualInput(input: string, format: string): string | null {
		const re = {
			'MM/DD/YYYY': /^(\d{2})\/(\d{2})\/(\d{4})$/,
			'DD/MM/YYYY': /^(\d{2})\/(\d{2})\/(\d{4})$/,
			'YYYY-MM-DD': /^(\d{4})-(\d{2})-(\d{2})$/
		} as const;
		const match = input.match(re[format as keyof typeof re]);
		if (!match) return null;
		let year, month, day;
		if (format === 'MM/DD/YYYY') {
			[, month, day, year] = match;
		} else if (format === 'DD/MM/YYYY') {
			[, day, month, year] = match;
		} else if (format === 'YYYY-MM-DD') {
			[, year, month, day] = match;
		}
		const date = new Date(Number(year), Number(month) - 1, Number(day));
		if (
			date.getFullYear() === Number(year) &&
			date.getMonth() === Number(month) - 1 &&
			date.getDate() === Number(day)
		) {
			return date.toISOString().split('T')[0];
		}
		return null;
	}

	function handleManualInput(e: Event) {
		if (previewMode) return;
		manualInput = (e.target as HTMLInputElement).value;
		const iso = parseManualInput(manualInput, userFormat);
		if (iso) {
			value = iso;
			inputError = false;
		} else {
			inputError = manualInput.length > 0;
		}
	}

	onMount(() => {
		window.addEventListener('mousedown', handleClickOutside);
		return () => window.removeEventListener('mousedown', handleClickOutside);
	});

	$: formattedValue = formatDate(value);

	$: if (inputRef) {
		inputRef.value = formattedValue;
	}

	$: if (inputRef && document.activeElement === inputRef) {
		// Blur input when format changes to force update
		inputRef.blur();
	}

	$: manualInput = formattedValue;
	$: if (userFormat && value) {
		manualInput = formatDate(value);
	}

	// Fetch characters when calendar opens
	$: if (showCalendar && !previewMode) {
		fetchMyCharacters().then((chars) => {
			myCharacters = chars.filter((c) => c.date_of_birth);
			filterMonthCharacters();
		});
	}

	function filterMonthCharacters() {
		monthCharacters = myCharacters.filter((c) => {
			if (!c.date_of_birth) return false;
			const [year, month] = c.date_of_birth.split('-');
			return Number(month) - 1 === currentMonth;
		});
	}

	// Re-filter when month, characters, or value changes
	$: if (showCalendar && !previewMode) filterMonthCharacters();

	// Avatar hover logic
	function handleAvatarRowMouseEnter() {
		avatarsDistributed = true;
		// Calculate positions for each avatar
		avatarPositions = {};
		for (const char of monthCharacters) {
			const day = getBirthdayDay(char);
			if (day && dayEls[day] && calendarRef) {
				const dayRect = dayEls[day].getBoundingClientRect();
				const calRect = calendarRef.getBoundingClientRect();
				avatarPositions[char.id] = {
					left: dayRect.left - calRect.left + dayRect.width / 2 - 16, // center avatar
					top: dayRect.top - calRect.top + dayRect.height / 2 - 16
				};
			}
		}
	}
	function handleAvatarRowMouseLeave() {
		avatarsDistributed = false;
	}

	// Helper: get day of month from birthday
	function getBirthdayDay(character: Character) {
		if (!character.date_of_birth) return null;
		return Number(character.date_of_birth.split('-')[2]);
	}

	// Helper for day cell refs
	function setDayRef(day: number, el: HTMLDivElement | null) {
		if (day && el) dayEls[day] = el;
	}

	$: {
		// Sync dayEls with dayRefs
		dayEls = { ...dayEls };
	}
</script>

<div class="datepicker">
	<div class="field">
		<input
			type="text"
			bind:this={inputRef}
			value={manualInput}
			on:input={handleManualInput}
			on:click={handleInputClick}
			placeholder="Select a date..."
			class:error={inputError}
			readonly={previewMode}
			disabled={previewMode}
			class:preview={previewMode}
			style={previewMode && previewColor ? `color: ${previewColor}` : ''}
		/>
	</div>

	{#if showCalendar && !previewMode}
		<div class="calendar" bind:this={calendarRef}>
			<div class="field" style="margin-bottom: 8px;">
				<!-- svelte-ignore a11y_label_has_associated_control -->
				<label>Date Format:</label>
				<select
					bind:value={userFormat}
					on:change={(e: Event) => updateFormat((e.target as HTMLSelectElement).value)}
				>
					{#each formats as format}
						<option value={format}>{format}</option>
					{/each}
				</select>
			</div>

			{#if monthCharacters.length}
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class="avatar-row"
					on:mouseenter={handleAvatarRowMouseEnter}
					on:mouseleave={handleAvatarRowMouseLeave}
				>
					{#each monthCharacters as char, i}
						<div
							class="avatar-icon"
							style={avatarsDistributed && avatarPositions[char.id]
								? `position: absolute; left: ${avatarPositions[char.id].left}px; top: ${avatarPositions[char.id].top}px; z-index: 10; transition: left 0.5s, top 0.5s, transform 0.4s cubic-bezier(.4,2,.6,1);`
								: ''}
							title={char.character_name}
						>
							<img src={char.character_avatar} alt={char.character_name} />
						</div>
					{/each}
				</div>
			{/if}

			<div class="header">
				<button on:click={prevMonth}>&lt;</button>
				<span>
					{new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' })}
					{currentYear}
				</span>
				<button on:click={nextMonth}>&gt;</button>
			</div>

			<div class="days">
				{#each daysOfWeek as day}
					<div class="day-name">{day}</div>
				{/each}
				{#each getDaysInMonth(currentYear, currentMonth) as week}
					{#each week as day}
						{#if day}
							<!-- svelte-ignore a11y_click_events_have_key_events -->
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<div
								class="day {isSelected(day) ? 'selected' : ''}"
								bind:this={dayEls[day]}
								on:click={() => handleDateSelect(currentYear, currentMonth, day)}
							>
								{day}
							</div>
						{:else}
							<div class="day"></div>
						{/if}
					{/each}
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.datepicker {
		font-family: sans-serif;
		width: 95%;
	}

	select {
		width: 100%;
		padding: 6px 8px;
		font-size: 14px;
		border: 1px solid var(--color-border);
		border-radius: 6px;
		background: var(--color-background);
		color: var(--color-text);
		margin-top: 4px;
		margin-bottom: 4px;
		transition:
			border 0.2s,
			box-shadow 0.2s;
	}

	select:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 2px var(--color-primary-alt);
	}

	select option {
		background: var(--color-background);
		color: var(--color-text);
	}

	.calendar {
		text-align: center;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8px;
	}

	.header button {
		background: var(--color-background);
		border: 1px solid var(--color-border);
		padding: 4px 8px;
		cursor: pointer;
	}

	.days {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 4px;
	}

	.day-name {
		font-weight: bold;
		font-size: 12px;
	}

	.day {
		height: 32px;
		line-height: 32px;
		border: 1px solid var(--color-border);
		cursor: pointer;
		background: var(--color-background);
	}

	.day:hover {
		background: var(--color-background-alt);
	}

	.selected {
		background: var(--color-background-alt);
		color: var(--color-text);
		font-weight: bold;
	}

	input.error {
		border: 1px solid var(--color-danger);
		background: var(--color-primary-alt);
	}

	input[type='text'] {
		width: 100%;
		padding: 8px 10px;
		font-size: 15px;
		border: 1px solid var(--color-border);
		border-radius: 6px;
		background: var(--color-background);
		color: var(--color-text);
		transition:
			border 0.2s,
			box-shadow 0.2s;
		box-sizing: border-box;
	}

	input[type='text']:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 2px var(--color-primary-alt);
	}

	input[type='text']::placeholder {
		color: var(--color-text);
		opacity: 0.6;
	}

	input.preview {
		border: none;
		color: var(--color-text, #888);
		padding: 0%;
	}

	.avatar-row {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 6px;
		margin-bottom: 8px;
		min-height: 36px;
		position: relative;
		z-index: 2;
		transition: min-height 0.2s;
		cursor: pointer;
		height: 36px;
	}

	.avatar-icon {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		overflow: hidden;
		background: var(--color-background-alt, #eee);
		border: 2px solid var(--color-border, #ccc);
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.07);
		transition:
			transform 0.4s cubic-bezier(0.4, 2, 0.6, 1),
			left 0.5s,
			top 0.5s;
		position: relative;
	}

	.avatar-icon img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.avatar-row:hover .avatar-icon,
	.avatar-icon[style*='position: absolute'] {
		z-index: 10;
		transform: scale(1.15);
	}
</style>
