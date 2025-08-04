<script>
	import Router from "svelte-spa-router";
	import Dictionary from "./routes/dictionary.svelte";
	import Home from "./routes/home.svelte";

	const routes = {
		"/": Home,
		"/dictionary": Dictionary,
	};
</script>

<div class="flex flex-col max-h-svh h-full">
	<nav class="flex justify-end *:px-3 *:py-3 mr-3">
		<a href="#/">Главная</a>
		<a href="#/dictionary">Словарь</a>
	</nav>
	<Router {routes} />
</div>
