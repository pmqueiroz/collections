import { type Dictionary, en } from "./dictionaries/en";
import { ptBR } from "./dictionaries/pt-br";
import type { Locale } from "./locales";

export type { Dictionary };

const DICTIONARIES: Record<Locale, Dictionary> = {
  en,
  "pt-BR": ptBR,
};

export function dictionaryFor(locale: Locale) {
  return DICTIONARIES[locale];
}
