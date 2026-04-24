import { PlaceCategory, Language } from "@prisma/client";

const categoryFromClient: Record<string, PlaceCategory> = {
  culture: PlaceCategory.CULTURE,
  food: PlaceCategory.FOOD,
  nature: PlaceCategory.NATURE,
  events: PlaceCategory.EVENTS,
  crafts: PlaceCategory.CRAFTS,
  history: PlaceCategory.HISTORY,
  hidden: PlaceCategory.HIDDEN,
  festivals: PlaceCategory.FESTIVALS,
  market: PlaceCategory.MARKET,
};

const categoryToClient: Record<PlaceCategory, string> = {
  [PlaceCategory.CULTURE]: "culture",
  [PlaceCategory.FOOD]: "food",
  [PlaceCategory.NATURE]: "nature",
  [PlaceCategory.EVENTS]: "events",
  [PlaceCategory.CRAFTS]: "crafts",
  [PlaceCategory.HISTORY]: "history",
  [PlaceCategory.HIDDEN]: "hidden",
  [PlaceCategory.FESTIVALS]: "festivals",
  [PlaceCategory.MARKET]: "market",
};

const languageFromClient: Record<string, Language> = {
  ru: Language.RU,
  tt: Language.TT,
  en: Language.EN,
};

const languageToClient: Record<Language, string> = {
  [Language.RU]: "ru",
  [Language.TT]: "tt",
  [Language.EN]: "en",
};

export function parseCategoryFromClient(input: string): PlaceCategory {
  const value = categoryFromClient[input];
  if (!value) {
    throw new Error("Некорректная категория");
  }
  return value;
}

export function mapCategoryToClient(category: PlaceCategory): string {
  return categoryToClient[category];
}

export function parseLanguageFromClient(input: string): Language {
  const value = languageFromClient[input];
  if (!value) {
    throw new Error("Некорректный язык");
  }
  return value;
}

export function mapLanguageToClient(language: Language): string {
  return languageToClient[language];
}
