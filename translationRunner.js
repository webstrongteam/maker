const manageTranslations = require('react-intl-translations-manager').default;

manageTranslations({
  messagesDirectory: 'translations',
  translationsDirectory: 'src/translations/',
  languages: ['en', 'pl']
});
