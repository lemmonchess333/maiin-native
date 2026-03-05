# Maiin Native
React Native fitness app for hybrid athletes (lifting + running).

## Stack
- Expo SDK, expo-router (file-based routing)
- NativeWind v4 for styling (Tailwind syntax)
- Firebase (Firestore + Auth) — same project as web app
- react-native-reanimated for animations
- @gorhom/bottom-sheet for sheets
- @maplibre/maplibre-react-native for GPS maps
- expo-location for background GPS
- expo-haptics for haptics
- lucide-react-native for icons

## Design tokens
Dark theme throughout.
- Background: #0F0F14
- Brand/lifting: #8b5cf6
- Running: #FF6B6B
- Teal: #2dd4bf
- Success: #34d399
- Warning: #f59e0b

## Conventions
- Screens in app/(tabs)/
- Components in components/
- Hooks in hooks/
- Lib in lib/
- TypeScript strict
- No class components
- Prefer reanimated over Animated API
- NativeWind for all styling
