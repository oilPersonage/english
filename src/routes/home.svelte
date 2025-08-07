<script lang="ts">
	import { animate, JSAnimation, stagger, text } from "animejs";
	import { onMount, tick } from "svelte";
	import ReviewButton from "../components/reviewButton.svelte";
	import { getWords, getWordsForReview, updateCard } from "../db";
	import type { TCard } from "../types";
	import { getPlannedForToday, getTodayRepeatCount } from "../utils/study";
	const maxLevel = 5; // максимальный уровень сложности
	const reviewIntervals = [1, 10, 1440, 43200]; // в минутах
	// [1 минута, 10 минут, 1 день, 30 дней]
	let refRu: HTMLDivElement | null = $state(null);
	let refEn: HTMLDivElement | null = $state(null);
	let animeRu: JSAnimation | null = null;
	let animeEn: JSAnimation | null = null;
	let showTranslation = false;

	let learned = $state(0);
	let isDisabled = $state(false); // флаг для отключения кнопок во время ревью
	let words: TCard[] = $state([]);
	let studyWords: TCard[] = $state([]); // слова для изучения, которые нужно ревьюить

	let currentIndex = $state(0);

	let completed = $derived(getTodayRepeatCount(studyWords, reviewIntervals));
	let planned = $state(0);

	// currentCard теперь derived
	let currentCard = $derived(
		studyWords.length === 0 ||
			currentIndex >= studyWords.length ||
			completed === studyWords.length
			? null
			: studyWords[currentIndex]
	);

	async function loadMoreCards() {
		studyWords = await getWordsForReview();
		currentIndex = 0;
		planned = getPlannedForToday(studyWords);
		setAnimatedText();
	}

	async function setAnimatedText() {
		animeRu = null;
		animeEn = null;
		await tick();
		if (!refRu || !refEn) return;
		const { chars } = text.split(refRu, { words: false, chars: true });
		const { chars: charsEn } = text.split(refEn, {
			words: false,
			chars: true,
		});

		animeRu = animate(chars, {
			y: [{ to: "-32px" }],
			rotate: { to: stagger("-.125turn") },
			opacity: 0,
			delay: stagger(50, { from: "random" }),
			ease: "inOutCirc",
			autoplay: false,
		});
		animeEn = animate(charsEn, {
			y: [{ to: "-32px" }],
			rotate: { from: stagger("-.125turn") },
			opacity: 1,
			delay: stagger(50, { from: "random" }),
			ease: "inOutCirc",
			autoplay: false,
		});
	}

	$effect(() => {
		if (completed === studyWords.length) {
			loadMoreCards();
		}
	});

	onMount(async () => {
		words = await getWords();
		learned = words.filter((w) => w.learned).length;
		loadMoreCards();
	});

	function showNextCard() {
		currentIndex += 1;
		if (currentIndex < studyWords.length) {
			currentCard = studyWords[currentIndex];
			setAnimatedText();
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

	function handleShowTranslate() {
		if (!showTranslation) {
			animeRu?.play();
			animeEn?.play();
		} else {
			animeRu?.reverse();
			animeEn?.reverse();
		}

		showTranslation = !showTranslation;
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
				<span
					class="relative text-black/20 dark:text-white/20 text-[18px] bottom-0.5"
				>
					/
				</span>
				<span class="text-black/20 dark:text-white/20 text-2xl -ml-2">
					{planned}
				</span>
			</div>
		</div>
		<p class="mt-2 text-sm text-black/40 dark:text-white/40">
			Нажмите на карточку, что бы посмотреть перевод
		</p>
	</div>
	<div class="relative flex flex-1 flex-col text-sm">
		<div class="flex flex-1">
			{#if studyWords.length > 0}
				{#if currentCard}
					{#key currentCard?.id}
						<button
							class="flex flex-1 flex-col justify-center items-center h-full text-center gap-2"
							onclick={handleShowTranslate}
						>
							<div
								class="flex flex-col mb-20 max-h-6 text-[36px] font-bold w-full"
							>
								<div bind:this={refRu} class="relative">
									{currentCard.ru}
								</div>
								<div
									bind:this={refEn}
									class="text-center top-full text-accent *:opacity-0"
								>
									{currentCard.en}
								</div>
							</div>
						</button>
					{/key}
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
