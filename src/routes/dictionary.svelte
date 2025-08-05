<script lang="ts">
	import debounce from "lodash.debounce";
	import { onMount } from "svelte";
	import data from "../assets/full.json";
	import DictListItem from "../components/dictListItem.svelte";
	import { addWord, deleteWord, getWords } from "../db";
	import type { TDict } from "../types";

	const dict: TDict[] = data;
	// console.log("dict", dict);
	let showNotification = false;
	let search = "";
	let isExact = false;
	let inputRef: HTMLInputElement | undefined;
	let filteredWords: TDict[] = [];
	let dbWords: TDict[] = [];
	async function load() {
		inputRef?.focus();
		dbWords = await getWords();
	}
	async function handleAdd({ ru, en }: TDict) {
		if (!ru.trim() || !en.trim()) return;
		await addWord({
			ru,
			en,
			level: 0,
			nextReview: new Date().toISOString(),
			lastReviewed: undefined,
		});
		await load();
	}
	async function handleDelete(id: number) {
		await deleteWord(id);
		await load();
	}

	function handleShowNotification() {
		showNotification = true;
		const timeout = setTimeout(() => {
			showNotification = false;
			clearTimeout(timeout);
		}, 500);
	}

	function handleExact() {
		isExact = !isExact;
		if (inputRef) {
			inputRef.focus();
		}
	}

	function onReset() {
		search = "";
		inputRef?.focus();
	}

	onMount(load);

	function escapeRegExp(str: string) {
		return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	}

	// throttled функция фильтрации
	const filteredDebouce = debounce((q: string, exact) => {
		if (!q) {
			filteredWords = [];
			return false;
		}

		const pattern = exact ? `^${escapeRegExp(q)}$` : `^${escapeRegExp(q)}`;
		const reg = new RegExp(pattern, "i");
		filteredWords = dict.filter((el) => {
			return reg.test(el.ru) || reg.test(el.en);
		});
	}, 300); // 300 мс

	// следим за search
	$: filteredDebouce(search, isExact);

	async function handleAddPackWords(count: number) {
		// Создаем Set для быстрого поиска уже добавленных слов
		const addedWords = new Set(dbWords.map((w) => w.ru));
		// Фильтруем dict, исключая уже добавленные
		const available = dict.filter((w) => !addedWords.has(w.ru));
		// Перемешиваем
		const shuffled = available.sort(() => Math.random() - 0.5);
		// Берем нужное количество
		const selected = shuffled.slice(0, count);
		// тут дальше добавляешь их в БД

		for (let item of selected) {
			await handleAdd(item);
		}
		handleShowNotification();
	}
</script>

<div class="relative flex flex-col text-sm h-[calc(100svh-118px)]">
	<div class="flex gap-1 mt-auto pb-3 px-5">
		<div class="relative flex-1">
			<input
				bind:value={search}
				type="text"
				placeholder="Начните вводить"
				bind:this={inputRef}
				autofocus
				class="pl-4 py-3 pr-9 w-full bg-white rounded-lg border-neutral px-5 border-accent"
			/>
			<div class="absolute right-0 top-1 p-1.5" on:click={onReset}>
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					class="fill-black/10"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						fill-rule="evenodd"
						clip-rule="evenodd"
						d="M7.66976 1.99927H16.3398C19.7298 1.99927 21.9998 4.37927 21.9998 7.91927V16.0903C21.9998 19.6203 19.7298 21.9993 16.3398 21.9993H7.66976C4.27976 21.9993 1.99976 19.6203 1.99976 16.0903V7.91927C1.99976 4.37927 4.27976 1.99927 7.66976 1.99927ZM15.0098 14.9993C15.3498 14.6603 15.3498 14.1103 15.0098 13.7703L13.2298 11.9903L15.0098 10.2093C15.3498 9.87027 15.3498 9.31027 15.0098 8.97027C14.6698 8.62927 14.1198 8.62927 13.7698 8.97027L11.9998 10.7493L10.2198 8.97027C9.86976 8.62927 9.31976 8.62927 8.97976 8.97027C8.63976 9.31027 8.63976 9.87027 8.97976 10.2093L10.7598 11.9903L8.97976 13.7603C8.63976 14.1103 8.63976 14.6603 8.97976 14.9993C9.14976 15.1693 9.37976 15.2603 9.59976 15.2603C9.82976 15.2603 10.0498 15.1693 10.2198 14.9993L11.9998 13.2303L13.7798 14.9993C13.9498 15.1803 14.1698 15.2603 14.3898 15.2603C14.6198 15.2603 14.8398 15.1693 15.0098 14.9993Z"
						fill="inherit"
					/>
				</svg>
			</div>
		</div>

		<div
			on:click={handleExact}
			class="flex items-center justify-center h-full w-9"
		>
			<svg
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				class={isExact ? "fill-accent" : "fill-black/30"}
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M14.255 15.4747L13.6342 12.9051H10.1506L9.54699 15.4747H6.61523L10.2196 3.52344H13.6514L17.2558 15.4747H14.255ZM10.6335 10.8528H13.1513L11.8924 5.57567L10.6335 10.8528Z"
					fill="inherit"
				/>
				<path
					d="M20.1025 18.9312C20.6548 18.9312 21.1025 19.3789 21.1025 19.9312C21.1025 20.4834 20.6548 20.9311 20.1025 20.9312H3.94238C3.3901 20.9312 2.94238 20.4834 2.94238 19.9312C2.94238 19.3789 3.3901 18.9312 3.94238 18.9312H20.1025Z"
					fill="inherit"
				/>
			</svg>
		</div>
	</div>
	<div
		class="flex *:flex *:items-center font-bold *:justify-center gap-1 absolute right-5 -bottom-15"
	>
		<div
			class="w-12 h-12 bg-white rounded-lg"
			on:click={() => handleAddPackWords(10)}
		>
			10
		</div>
		<div
			class="w-12 h-12 bg-white rounded-lg"
			on:click={() => handleAddPackWords(20)}
		>
			20
		</div>
		<div
			class="w-12 h-12 bg-white rounded-lg"
			on:click={() => handleAddPackWords(35)}
		>
			35
		</div>
		<div
			class="w-12 h-12 bg-white rounded-lg"
			on:click={() => handleAddPackWords(50)}
		>
			50
		</div>
		{#if showNotification}
			<div
				class="absolute right-0 bottom-full mb-2 text-accent bg-white rounded-md py-2 px-5"
			>
				Успешно добавлено!
			</div>
		{/if}
	</div>
	<ul class="flex h-full flex-col gap-0.5 overflow-y-auto overflow-hidden">
		{#if search.length === 0 && dbWords.length === 0}
			<li class="px-5 py-1"></li>
		{:else if filteredWords.length === 0 && dbWords.length > 0}
			{#each dbWords as item (item.id)}
				<DictListItem
					isStudy={true}
					id={item.id}
					{item}
					{handleAdd}
					{handleDelete}
				/>
			{/each}
		{:else if search.length === 0 && dbWords.length === 0}
			<li class="px-5 py-1">Слов нет</li>
		{:else if filteredWords.length > 0}
			{#each filteredWords as item (item.id)}
				<DictListItem
					isStudy={!!dbWords.find((el) => el.ru === item.ru)}
					id={dbWords.find((el) => el.ru === item.ru)?.id}
					{item}
					{handleAdd}
					{handleDelete}
				/>
			{/each}
		{:else}
			<li class="px-5 py-1">Ничего не найдено</li>
		{/if}
	</ul>
</div>
