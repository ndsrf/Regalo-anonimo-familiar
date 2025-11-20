# Multi-Language Support

This application now supports 4 languages:
- 🇪🇸 Spanish (Español) - Default
- 🇬🇧 English
- 🇫🇷 French (Français)
- 🇩🇪 German (Deutsch)

## Features

### Automatic Language Detection
The application automatically detects the user's preferred language from their browser settings on first visit.

### Manual Language Selection
Users can change the language at any time using the language selector in the navigation bar (top right corner).

### Language Persistence
The selected language is saved in the browser's localStorage and will be remembered on subsequent visits.

## Implementation Details

### Technology Stack
- **i18next**: Core internationalization framework
- **react-i18next**: React bindings for i18next
- **i18next-browser-languagedetector**: Automatic language detection

### Translation Files
Translation files are located in `/frontend/src/locales/`:
- `es/translation.json` - Spanish translations
- `en/translation.json` - English translations
- `fr/translation.json` - French translations
- `de/translation.json` - German translations

### Supported Languages
The following ISO language codes are supported:
- `es` - Spanish
- `en` - English
- `fr` - French
- `de` - German

## Pages Translated

The following pages and components have been fully translated:
- ✅ Home page
- ✅ Login page
- ✅ Register page
- ✅ Groups page
- ✅ Archived Groups page
- ✅ Navbar component
- ✅ Language Selector component
- ✅ Email Verification Banner component

## Future Enhancements

### Backend Email Localization
Currently, email notifications from the backend are sent in Spanish only. To fully support multi-language emails, the following changes would be needed:

1. Store user language preference in the database
2. Pass language preference in email service calls
3. Create email templates for each supported language
4. Select appropriate template based on user preference

This is left as a future enhancement to minimize changes to the backend and database schema.

## Usage for Developers

### Adding New Translations

1. Add the translation key and text to all language files in `/frontend/src/locales/*/translation.json`
2. Use the `useTranslation` hook in your component:
```javascript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  return <h1>{t('myKey')}</h1>;
}
```

### Using Translation with Variables

```javascript
// In translation file:
{
  "welcome": "Hello, {{name}}!"
}

// In component:
<p>{t('welcome', { name: user.name })}</p>
```

### Adding a New Language

1. Create a new directory in `/frontend/src/locales/` (e.g., `it/` for Italian)
2. Copy an existing `translation.json` and translate all values
3. Update `/frontend/src/i18n.js` to import and add the new language:
```javascript
import translationIT from './locales/it/translation.json';

const resources = {
  // ... existing languages
  it: {
    translation: translationIT
  }
};
```
4. Update the `supportedLngs` array in the i18n configuration
5. Add the new language to the LanguageSelector component

## Testing

To test the multi-language feature:

1. Open the application in a browser
2. Click on the language selector in the top-right corner of the navigation bar
3. Select a different language
4. Navigate through different pages to see translations
5. Refresh the page - the selected language should persist
6. Clear localStorage and refresh - the language should be auto-detected from browser settings

## Known Limitations

- Email notifications are currently only available in Spanish
- Some deeply nested pages may still contain hardcoded Spanish text
- Date formatting uses the default browser locale (can be enhanced to use i18n locale)
