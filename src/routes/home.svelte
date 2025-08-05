<script lang="ts">
	import { onMount } from "svelte";
	import ReviewButton from "../components/reviewButton.svelte";
	import { getWords, getWordsForReview, updateCard } from "../db";
	import type { TCard } from "../types";
	import { getPlannedForToday, getTodayRepeatCount } from "../utils/study";
	const maxLevel = 5; // максимальный уровень сложности
	const reviewIntervals = [1, 10, 1440, 43200]; // в минутах
	// [1 минута, 10 минут, 1 день, 30 дней]

	let learned = $state(0);
	let isDisabled = $state(false); // флаг для отключения кнопок во время ревью
	let words: TCard[] = $state([]);
	let studyWords: TCard[] = $state([]); // слова для изучения, которые нужно ревьюить

	let currentIndex = $state(0);
	let showTranslation = $state(false); // переключатель для показа перевода

	let completed = $derived(getTodayRepeatCount(studyWords, reviewIntervals));
	let planned = $derived(getPlannedForToday(studyWords));
	let progress = $derived(planned > 0 ? (completed / planned) * 100 : 0);

	// currentCard теперь derived
	let currentCard = $derived(
		studyWords.length === 0 ||
			currentIndex >= studyWords.length ||
			completed === studyWords.length
			? null
			: studyWords[currentIndex]
	);

	onMount(async () => {
		words = await getWords();
		learned = words.filter((w) => w.learned).length;
		studyWords = await getWordsForReview();
		currentIndex = 0; // достаточно сбросить индекс
	});

	function showNextCard() {
		currentIndex += 1;
		if (currentIndex < studyWords.length) {
			currentCard = studyWords[currentIndex];
		} else {
			currentCard = null;
		}
	}

	function handleReview(rating: "again" | "hard" | "good" | "easy") {
		const now = new Date();
		if (!currentCard) return;
		isDisabled = true;
		showTranslation = false;
		let newLevel = currentCard.level;

		switch (rating) {
			case "again":
				newLevel = 0;
				break;
			case "hard":
				newLevel = Math.min(currentCard.level + 1, maxLevel);
				break;
			case "good":
				newLevel = Math.min(currentCard.level + 1, maxLevel);
				break;
			case "easy":
				newLevel = Math.min(currentCard.level + 2, maxLevel); // быстро перепрыгивает
				break;
		}

		const nextMinutes = reviewIntervals[newLevel];
		const nextReview = new Date(
			now.getTime() + nextMinutes * 60_000
		).toISOString();

		const newCard = {
			...currentCard,
			level: newLevel,
			nextReview,
			lastReviewed: now.toISOString(),
		};
		updateCard(newCard);
		// обновить карточку в массиве (новый reference)
		studyWords = studyWords.map((card) =>
			card.id === newCard?.id ? newCard : card
		);

		let timeout = setTimeout(() => {
			isDisabled = false;
			showNextCard();
			clearTimeout(timeout);
		}, 300); // задержка перед показом следующей карточки
	}
</script>

<div class="flex flex-col flex-1 px-5">
	<div>
		<div class="flex gap-2 justify-between text-sm">
			<div class="flex gap-2">
				<div class="flex flex-col gap-1">
					<p>В cловаре:</p>
					<p class="font-bold">{words.length}</p>
				</div>

				<div class="flex flex-col gap-1">
					<p>Выучено:</p>
					<p class="font-bold">{learned}</p>
				</div>
			</div>
			<div class=" text-[36px] leading-10 font-semibold mt-1">
				<span class="text-accent -mr-2">{completed}</span>
				<span class="relative text-black/20 text-[18px] bottom-0.5">/</span>
				<span class="text-black/20 text-2xl -ml-2">{planned}</span>
			</div>
		</div>
		<p class="mt-2 text-sm text-neutral-400">
			Нажмите на карточку, что бы посмотреть перевод
		</p>
	</div>
	<div class="relative flex flex-1 flex-col text-sm">
		<div class="flex flex-1">
			{#if studyWords.length > 0}
				{#if currentCard}
					<div
						class="flex flex-1 flex-col justify-center items-center h-full text-center gap-2"
						on:click={() => (showTranslation = true)}
					>
						<div class="relative text-2xl font-bold w-full mb-20">
							{currentCard.ru}
							<p
								class={`absolute w-full left-[50%] -translate-x-[50%] text-center top-full text-xl text-accent transition-opacity ${
									showTranslation ? "opacity-100" : "opacity-0"
								}`}
							>
								{currentCard.en}
							</p>
						</div>
					</div>
				{:else}
					<div class="flex w-full justify-center items-center text-center">
						<p>Нет слов для изучения</p>
					</div>
				{/if}
			{:else}
				<div class="flex w-full justify-center items-center text-center">
					<p>Нет слов для изучения</p>
				</div>
			{/if}
			<!-- <p>{words[0].ru}</p> -->
		</div>
		<div
			class="absolute bottom-0 right-0 flex items-end *:min-w-20 *:min-h-16 flex-col gap-1"
		>
			<ReviewButton
				{isDisabled}
				label="Again"
				info="1 min"
				value="again"
				onClick={handleReview}
			/>
			<ReviewButton
				{isDisabled}
				label="Hard"
				info="10 min"
				value="hard"
				onClick={handleReview}
			/>
			<ReviewButton
				{isDisabled}
				label="Good"
				info="1 d"
				value="good"
				onClick={handleReview}
			/>
			<ReviewButton
				{isDisabled}
				label="Easy"
				info="1 month"
				value="easy"
				onClick={handleReview}
			/>
		</div>
	</div>
</div>
