import { I18n } from 'i18n-js';
import en from './en.json';
import de from './de.json';

const translations = {
  en,
  de,
};

export const i18n = new I18n(translations);
