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

			// ⏱️ Округляем nextReview до минут
			const timeA = Math.floor(new Date(a.nextReview).getTime() / (60 * 1000));
			const timeB = Math.floor(new Date(b.nextReview).getTime() / (60 * 1000));

			// 📉 Разница по минутам
			const dateDiff = timeA - timeB;
			// console.log(dateDiff, timeA, timeB);
			if (dateDiff !== 0) return dateDiff;

			// 🎲 Немного рандома, если всё совпадает
			return Math.random() - 0.5;
		})
		.slice(0, limit);
}

export async function deleteWord(id: number) {
	const db = await dbPromise;
	await db.delete("words", id);
}

export async function deleteAllWords(id: number) {
	const db = await dbPromise;
	await db.clear("words");
}
