const CACHE_NAME = "local-pwa-cache-v1";
const FILES_TO_CACHE = [
	"/english/",
	"/english/index.html",
	"/english/manifest.json",
	"/english/512.png",
	"/english/192.png",
	"/english/favicon.svg",
	"/english/index.js",
	"/english/index.css",
];

self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
	);
});

self.addEventListener("fetch", (event) => {
	event.respondWith(
		caches
			.match(event.request)
			.then((response) => response || fetch(event.request))
	);
});
