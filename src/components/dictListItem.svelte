<script lang="ts">
	import { createDraggable } from "animejs";
	import type { TDict } from "../types";
	let cardRef: HTMLELElement;
	let iconsRef: HTMLDivElement;
	let draggable: ReturnType<typeof createDraggable> | undefined;

	const { item, handleAdd, isStudy, handleDelete, id } = $props<{
		item: TDict;
		handleAdd: (item: TDict) => void;
		isStudy: boolean;
		id?: number;
		handleDelete: (id: number) => void;
	}>();

	function animateIcon() {
		draggable = createDraggable(iconsRef, {
			trigger: cardRef,
			y: false,
			snap: 48, // Global to both x and y
			container: [0, 0, 0, -48],
			containerFriction: 1,
			x: { snap: [0, -48] },
		});
	}

	$effect(() => {
		if (!isStudy) {
			draggable?.revert();
		} else {
			animateIcon();
		}
	});

	// onMount(() => {
	// 	if (!cardRef) return;
	// 	// Initialize draggable functionality
	// 	animate();
	// });
</script>

<li bind:this={cardRef} class="flex items-start justify-between py-1 px-5">
	<div class="flex gap-2">
		<p>{item.ru}</p>
		<p class="text-neutral-400">{item.en}</p>
	</div>
	<div class="flex items-center gap-0.5 relative bg-bg">
		<button on:click={() => (id ? null : handleAdd(item))} class="p-1 -my-1">
			<svg
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				class={isStudy ? "stroke-accent" : "stroke-black/30"}
				xmlns="http://www.w3.org/2000/svg"
			>
				<g id="Iconly/Curved/Heart">
					<g id="Heart">
						<path
							id="Stroke 1"
							fill-rule="evenodd"
							clip-rule="evenodd"
							d="M2.9219 12.4462C1.8489 9.09619 3.1039 4.93119 6.6209 3.79919C8.4709 3.20219 10.7539 3.70019 12.0509 5.48919C13.2739 3.63419 15.6229 3.20619 17.4709 3.79919C20.9869 4.93119 22.2489 9.09619 21.1769 12.4462C19.5069 17.7562 13.6799 20.5222 12.0509 20.5222C10.4229 20.5222 4.6479 17.8182 2.9219 12.4462Z"
							stroke="inherit"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
						<path
							id="Stroke 3"
							d="M15.7886 7.56396C16.9956 7.68796 17.7506 8.64496 17.7056 9.98596"
							stroke="inherit"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</g>
				</g>
			</svg>
		</button>

		{#if isStudy}
			<div bind:this={iconsRef} class="h-full bg-bg absolute -right-12 pl-3">
				<button
					on:click={() => handleDelete(id)}
					class="p-1 -my-1 cursor-pointer"
				>
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						class="fill-accent"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							fill-rule="evenodd"
							clip-rule="evenodd"
							d="M20.2871 5.24297C20.6761 5.24297 21 5.56596 21 5.97696V6.35696C21 6.75795 20.6761 7.09095 20.2871 7.09095H3.71385C3.32386 7.09095 3 6.75795 3 6.35696V5.97696C3 5.56596 3.32386 5.24297 3.71385 5.24297H6.62957C7.22185 5.24297 7.7373 4.82197 7.87054 4.22798L8.02323 3.54598C8.26054 2.61699 9.0415 2 9.93527 2H14.0647C14.9488 2 15.7385 2.61699 15.967 3.49699L16.1304 4.22698C16.2627 4.82197 16.7781 5.24297 17.3714 5.24297H20.2871ZM18.8058 19.134C19.1102 16.2971 19.6432 9.55712 19.6432 9.48913C19.6626 9.28313 19.5955 9.08813 19.4623 8.93113C19.3193 8.78413 19.1384 8.69713 18.9391 8.69713H5.06852C4.86818 8.69713 4.67756 8.78413 4.54529 8.93113C4.41108 9.08813 4.34494 9.28313 4.35467 9.48913C4.35646 9.50162 4.37558 9.73903 4.40755 10.1359C4.54958 11.8992 4.94517 16.8102 5.20079 19.134C5.38168 20.846 6.50498 21.922 8.13206 21.961C9.38763 21.99 10.6811 22 12.0038 22C13.2496 22 14.5149 21.99 15.8094 21.961C17.4929 21.932 18.6152 20.875 18.8058 19.134Z"
							fill="inherit"
						/>
					</svg>
				</button>
			</div>
		{/if}
	</div>
</li>
