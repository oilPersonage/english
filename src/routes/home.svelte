<script lang="ts">
	import { onMount } from "svelte";
	import ReviewButton from "../components/reviewButton.svelte";
	import { getWords, getWordsForReview, updateCard } from "../db";
	import type { TCard } from "../types";
	const maxLevel = 5; // максимальный уровень сложности
	const reviewIntervals = [1, 10, 1440, 4320, 10080, 43200]; // в минутах
	// [1 минута, 10 минут, 1 день, 3 дня, 7 дней, 30 дней]

	let learned = 0;
	let isDisabled = false; // флаг для отключения кнопок во время ревью
	let words: TCard[] = [];
	let studyWords: TCard[] = []; // слова для изучения, которые нужно ревьюить

	let currentCard: TCard | null = null;
	let currentIndex = 0;
	let showTranslation = false; // переключатель для показа перевода

	onMount(async () => {
		words = await getWords();
		learned = words.filter((w) => w.learned).length;
		studyWords = await getWordsForReview();
		currentIndex = 0;
		currentCard = studyWords[0] ?? null;
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
		showTranslation = true;
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

		updateCard({
			...currentCard,
			level: newLevel,
			nextReview,
			lastReviewed: now.toISOString(),
		});
		let timeout = setTimeout(() => {
			isDisabled = false;
			showNextCard();
			showTranslation = false;
			clearTimeout(timeout);
		}, 2000); // задержка перед показом следующей карточки
	}
</script>

<div class="flex flex-col flex-1 p-5 pt-0">
	<div>
		<div class="flex gap-2 justify-between text-sm">
			<div class="flex gap-1">
				<p>В cловаре:</p>
				<p class="font-bold">{words.length}</p>
			</div>
			<div class="flex gap-1">
				<p>Выучено:</p>
				<p class="font-bold">{learned}</p>
			</div>
		</div>
		<p class="mt-2 text-sm text-neutral-400">
			Нажмите на карточку, что бы посмотреть перевод
		</p>
	</div>
	<div class="flex flex-1 flex-col text-sm">
		<div class="flex items-center justify-center flex-1">
			{#if studyWords.length > 0}
				{#if currentCard}
					<div
						class="flex flex-col justify-center items-center h-full text-center gap-2"
						on:click={() => (showTranslation = !showTranslation)}
					>
						<p class="text-2xl font-bold">{currentCard.ru}</p>
						{#if showTranslation}<p class="text-xl text-accent">
								{currentCard.en}
							</p>{/if}
					</div>
				{:else}
					<p>Нет слов для ревью</p>
				{/if}
			{:else}
				<p>Нет слов для ревью</p>
			{/if}
			<!-- <p>{words[0].ru}</p> -->
		</div>
		<div class="flex gap-1">
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
