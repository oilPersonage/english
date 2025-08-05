import type { TCard } from "../types";

export function getTodayRepeatCount(
	words: TCard[],
	reviewIntervals: number[]
): number {
	const now = Date.now();

	return words.filter((w) => {
		if (!w.lastReviewed || w.level == null) return false;

		const intervalInMs = reviewIntervals[w.level] * 60 * 1000; // в ms
		const reviewedAt = new Date(w.lastReviewed).getTime();

		return now - reviewedAt <= intervalInMs;
	}).length;
}

export function getPlannedForToday(words: TCard[]): number {
	const today = new Date();

	const startOfDay = new Date(
		today.getFullYear(),
		today.getMonth(),
		today.getDate() + 1
	);

	return words.filter((w) => new Date(w.nextReview) < startOfDay).length;
}
