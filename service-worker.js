const CACHE_NAME = "app-cache-v1";
const API_URL = "https://www.omdbapi.com/?s=Avengers&apikey=35d8e2b";

self.addEventListener("install", (event) => {
  event.waitUntil(cacheData());
});

async function cacheData() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("Failed to fetch data from API");
    }
    const data = await response.json();
    const cache = await caches.open(CACHE_NAME);

    data.Search.forEach(async (movie) => {
      const imageUrl = movie.Poster;
      const imageResponse = await fetch(imageUrl);
      await cache.put(imageUrl, imageResponse);
    });

    console.log("Data cached successfully");
  } catch (error) {
    console.error("Failed to cache data:", error);
  }
}

self.addEventListener("fetch", (event) => {
  event.respondWith(fetchAndCache(event.request));
});

async function fetchAndCache(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    const response = await fetch(request);
    if (!response.ok) {
      throw new Error("Failed to fetch data from network");
    }
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    console.error("Failed to fetch data:", error);
    const cachedResponse = await caches.match(API_URL);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}
