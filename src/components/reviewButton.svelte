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
	class={`px-1 py-2 flex-1 items-center flex-col
			justify-center flex rounded-lg transition-colors
    ${isActive ? "bg-accent text-white" : "bg-white hover:bg-gray-400"}`}
	on:click={handleSelect}
>
	<p>{label}</p>
	<span class="text-[10px] text-black/30 font-bold">{info}</span>
</button>
