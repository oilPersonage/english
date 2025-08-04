export type TDict = {
	id?: number | string;
	ru: string;
	en: string;
};

export type TCard = TDict & {
	level: number; // от 0 до 5, или как решишь
	nextReview: string; // ISO string: дата следующего показа
	lastReviewed?: string; // дата последней проверки (опционально)
	learned?: boolean;
};
