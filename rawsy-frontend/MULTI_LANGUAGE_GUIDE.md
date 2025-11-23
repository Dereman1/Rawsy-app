# Multi-Language System Guide

## Overview
The Rawsy app now supports multi-language functionality for **manufacturers only**. Suppliers will always see the interface in English.

## Supported Languages
| Code | Language | Native Name |
|------|----------|-------------|
| `en` | English | English |
| `am` | Amharic | አማርኛ |
| `om` | Afaan Oromo | Afaan Oromo |

## Architecture

### Files Created
1. **`utils/i18n.ts`** - Translation dictionaries and helper functions
2. **`context/LanguageContext.tsx`** - Language state management
3. **`app/language-settings.tsx`** - Language selection screen

### How It Works

#### 1. Language Provider
The `LanguageProvider` wraps the entire app and manages language state:
```tsx
<LanguageProvider>
  <YourApp />
</LanguageProvider>
```

#### 2. Using Translations in Components
Import the `useLanguage` hook in any component:

```tsx
import { useLanguage } from '../context/LanguageContext';

export default function YourComponent() {
  const { t, language } = useLanguage();

  return (
    <Text>{t('welcomeBack')}</Text>
  );
}
```

#### 3. Available Translation Keys
Common keys include:
- Navigation: `home`, `products`, `cart`, `account`, `profile`
- Actions: `addToCart`, `checkout`, `requestQuote`, `placeOrder`, `cancel`, `accept`, `reject`
- Labels: `price`, `stock`, `supplier`, `orders`, `wishlist`, `total`, `quantity`
- Order Status: `orderPlaced`, `orderConfirmed`, `orderInTransit`, `orderDelivered`
- Quote Status: `quotePending`, `quoteAccepted`, `quoteRejected`
- Messages: `welcomeBack`, `noProductsFound`, `emptyCart`, `loading`, `success`

See `utils/i18n.ts` for the complete list.

## Language Selection Flow

### For Manufacturers
1. Navigate to **Account** tab
2. Tap on **Preferences** section
3. Select **Language**
4. Choose from English, Amharic, or Afaan Oromo
5. Tap **Save**
6. The API call updates the backend: `PUT /auth/language`
7. Language is saved to AsyncStorage
8. UI updates immediately

### For Suppliers
- Language selection is **not available**
- Suppliers always see English interface
- This is enforced both in UI and backend

## Backend Integration

### API Endpoint
```
PUT /auth/language
Body: { language: "en" | "am" | "om" }
```

### Backend Behavior
- Only manufacturers can change language
- Suppliers receive all notifications in English
- Language preference is stored in user profile

## Adding New Translations

### 1. Add to Dictionary
Edit `utils/i18n.ts`:

```typescript
export const translations: Record<Language, Record<string, string>> = {
  en: {
    newKey: 'English Text',
    // ...
  },
  am: {
    newKey: 'አማርኛ ጽሁፍ',
    // ...
  },
  om: {
    newKey: 'Barreeffama Afaan Oromoo',
    // ...
  },
};
```

### 2. Use in Components
```tsx
const { t } = useLanguage();
<Text>{t('newKey')}</Text>
```

## Updating Existing Screens

To add translations to existing screens:

1. Import the hook:
```tsx
import { useLanguage } from '../context/LanguageContext';
```

2. Use in component:
```tsx
const { t } = useLanguage();
```

3. Replace hardcoded strings:
```tsx
// Before
<Text>Welcome Back</Text>

// After
<Text>{t('welcomeBack')}</Text>
```

## Examples

### Example 1: Button with Translation
```tsx
<Button onPress={handleCheckout}>
  {t('checkout')}
</Button>
```

### Example 2: Status Display
```tsx
<Chip>{t('orderConfirmed')}</Chip>
```

### Example 3: Conditional Text
```tsx
<Text>
  {t('status')}: {order.status === 'delivered' ? t('orderDelivered') : t('orderPending')}
</Text>
```

## Testing

### Manual Testing
1. Login as manufacturer
2. Go to Account > Preferences > Language
3. Change language to Amharic
4. Verify UI updates throughout the app
5. Navigate to different screens
6. Check that translations are consistent

### Test Cases
- Verify manufacturers can access language settings
- Verify suppliers cannot access language settings
- Verify language persists after app restart
- Verify backend API is called on language change
- Verify tab bar labels update
- Verify buttons and actions update

## Best Practices

1. **Always use translation keys** - Never hardcode text
2. **Consistent keys** - Use the same key across screens for identical text
3. **Context-aware translations** - Use different keys for context-specific meanings
4. **Test all languages** - Ensure layouts work with longer text
5. **Fallback to English** - The `t()` function automatically falls back to English

## Common Issues

### Issue: Translations not updating
**Solution**: Make sure component is re-rendering when language changes. The LanguageContext triggers re-renders automatically.

### Issue: Missing translation key
**Solution**: Add the key to all three language objects in `utils/i18n.ts`

### Issue: Layout breaks with long text
**Solution**: Use proper text wrapping and responsive layouts:
```tsx
<Text numberOfLines={2} ellipsizeMode="tail">
  {t('longTextKey')}
</Text>
```

## Future Enhancements

Potential additions:
- Right-to-left (RTL) support for Arabic
- More languages (e.g., Tigrinya, Somali)
- Dynamic translation loading from server
- Translation management dashboard for admins
- Community-contributed translations

## Files Modified

### New Files
- `rawsy-frontend/utils/i18n.ts`
- `rawsy-frontend/context/LanguageContext.tsx`
- `rawsy-frontend/app/language-settings.tsx`

### Modified Files
- `rawsy-frontend/app/_layout.tsx` - Added LanguageProvider
- `rawsy-frontend/app/(tabs)/_layout.tsx` - Added tab translations
- `rawsy-frontend/app/(tabs)/account.tsx` - Added language selection option
- `rawsy-frontend/app/(tabs)/home.tsx` - Added translations

### Remaining Screens to Update
Apply the same pattern to:
- Cart screen
- Products screen
- Product details screen
- Orders screen
- Quotes screen
- Login/Register screens
- All dialogs and modals

## Summary

The multi-language system is now functional for manufacturers. The implementation:
- Supports English, Amharic, and Afaan Oromo
- Restricts language selection to manufacturers only
- Persists language preference across sessions
- Syncs with backend via API
- Provides easy-to-use `t()` function for translations
- Falls back gracefully to English for missing keys

To complete the implementation, apply translations to remaining screens following the patterns demonstrated in this guide.
