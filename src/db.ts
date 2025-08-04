// src/db.ts
import { openDB } from "idb";
import type { TCard } from "./types";

const DB_NAME = "dictionary-db";

export const dbPromise = openDB(DB_NAME, 1, {
	upgrade(db) {
		if (!db.objectStoreNames.contains("words")) {
			db.createObjectStore("words", { keyPath: "id", autoIncrement: true });
		}
	},
});

export async function addWord(word: Omit<TCard, "id">) {
	const db = await dbPromise;
	await db.add("words", word);
}

export async function updateCard(card: TCard) {
	const db = await dbPromise;
	await db.put("words", card);
}

export async function getWords(): Promise<TCard[]> {
	const db = await dbPromise;
	return await db.getAll("words");
}

export async function getWordsForReview(limit = 50): Promise<TCard[]> {
	const db = await dbPromise;
	const allWords = await db.getAll("words");

	const now = new Date();

	return allWords
		.filter((word) => new Date(word.nextReview) <= now)
		.sort((a, b) => {
			if (a.level !== b.level) return a.level - b.level;
			return (
				new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime()
			);
		})
		.slice(0, limit);
}

export async function deleteWord(id: number) {
	const db = await dbPromise;
	await db.delete("words", id);
}
