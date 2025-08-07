<script lang="ts">
	type TProps = {
		label: string;
		info: string;
		isDisabled: boolean;
		value: "easy" | "good" | "hard" | "again";
		onClick: (value: typeof value) => void;
	};
	let { label, info, value, onClick, isDisabled }: TProps = $props();

	let isActive = $state(false);

	function handleSelect() {
		isActive = true;
		let timeout = setTimeout(() => {
			isActive = false;
			clearTimeout(timeout);
		}, 300); // сброс активности через 1 секунду
		onClick(value);
	}
</script>

<button
	disabled={isDisabled}
	class={`px-1 py-2 flex-1 items-center flex-col hover:text-white
			justify-center flex rounded-lg transition-colors ${isActive ? "bg-accent text-white dark:text-text" : "bg-white dark:bg-black hover:bg-accent"}`}
	onclick={handleSelect}
>
	<p>{label}</p>
	<span
		class={`text-[10px] font-bold ${isActive ? "text-white" : "text-black/30 dark:text-white/30"} transition-colors`}
	>
		{info}
	</span>
</button>
