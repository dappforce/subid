import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import translationEn from './en.json'
import translationRu from './ru.json'
import translationEs from './es.json'
import translationDe from './de.json'
import translationUkr from './ukr.json'
import translationFr from './fr.json'
import translationPt from './pt.json'
import languages from '../config/languages'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    resources: {
      en: {
        translation: translationEn,
      },
      ru: {
        translation: translationRu,
      },
      es: {
        translation: translationEs,
      },
      de: {
        translation: translationDe,
      },
      ukr: {
        translation: translationUkr,
      },
      fr: {
        translation: translationFr,
      },
      pt: {
        translation: translationPt
      }
    },
  })

if (!Object.keys(languages).includes(i18n.language)) {
  i18n.changeLanguage(Object.keys(languages)[0])
}
