# CareReward — Mobile App

A healthcare rewards app built with **React Native + Expo SDK 51**. Members earn points for healthy behaviours, smart prescription choices, and preventive care, then redeem those points against real healthcare costs.

---

## Tech Stack

| Layer | Library |
|-------|---------|
| Framework | React Native 0.74 + Expo SDK 51 |
| Navigation | Expo Router v3 (file-based) |
| State | Zustand |
| Auth storage | expo-secure-store |
| Biometrics | expo-local-authentication |
| Animations | React Native Reanimated v3 |
| Icons | @expo/vector-icons (MaterialCommunityIcons) |
| Language | TypeScript (strict) |
| JS Engine | Hermes |
| New Architecture | ✅ Enabled (newArchEnabled: true) |

---

## Project Structure

```
carereward/
├── app/
│   ├── _layout.tsx              # Root layout — auth routing + splash
│   ├── (auth)/
│   │   ├── _layout.tsx          # Redirects authenticated users to tabs
│   │   ├── login.tsx            # Login screen with biometric support
│   │   └── register.tsx         # Registration with member ID
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Bottom tab navigator (5 tabs)
│   │   ├── index.tsx            # Dashboard / Home
│   │   ├── opportunities.tsx    # Earn points — filterable opportunity list
│   │   ├── claims.tsx           # Claims history with section grouping
│   │   ├── benefits.tsx         # Deductible, copay tiers, preventive care
│   │   └── profile.tsx          # Profile, settings, tier progress, sign out
│   ├── opportunity/
│   │   └── [id].tsx             # Opportunity detail + complete action
│   ├── claim/
│   │   └── [id].tsx             # Claim detail + EOB breakdown
│   └── points/
│       ├── index.tsx            # Points history + tier progress + how to earn
│       └── redeem.tsx           # 3-step redemption modal
├── components/
│   ├── ui/
│   │   ├── Button.tsx           # Primary / outline / ghost / danger variants
│   │   ├── Card.tsx             # Surface card with optional elevation
│   │   └── index.tsx            # Badge, ProgressBar, EmptyState, Divider, SectionHeader
├── store/
│   ├── authStore.ts             # Auth state (login/logout/session restore)
│   └── appStore.ts              # Points, opportunities, claims, benefits
├── constants/
│   ├── Colors.ts                # Full design token system
│   └── mockData.ts              # All demo data (replace with API)
└── types/
    └── index.ts                 # All TypeScript interfaces
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- For iOS: Xcode + CocoaPods
- For Android: Android Studio + emulator or physical device with Expo Go

### Install & run

```bash
# Clone or navigate to project folder
cd carereward

# Install dependencies
npm install

# Start Expo dev server
npx expo start

# Press 'i' for iOS simulator
# Press 'a' for Android emulator
# Scan QR with Expo Go on physical device
```

### Login (demo)
Any email + any password works in the current mock setup. To demo biometric login, first sign in once — the biometric button will appear on subsequent visits.

---

## Feature Checklist

| Feature | Status | Notes |
|---------|--------|-------|
| Login / Register | ✅ UI complete | Auth is mocked — replace with real backend |
| Biometric unlock | ✅ | expo-local-authentication |
| Dashboard | ✅ | Points card, deductible progress, opportunities, quick actions |
| Opportunities list | ✅ | Filterable by type, badge count on tab |
| Opportunity detail | ✅ | Steps, savings stats, doctor note CTA, complete action |
| Claims history | ✅ | Grouped by month, filter by status |
| Claim detail | ✅ | Full EOB breakdown, PDF download action |
| Benefits — Overview | ✅ | Deductible + OOP Max progress bars |
| Benefits — Prescriptions | ✅ | All 4 drug tiers with copays and examples |
| Benefits — Preventive | ✅ | All services with completion dates + overdue badges |
| Profile | ✅ | Tier progress, settings, sign out |
| Points history | ✅ | Transaction log, tier progress, how-to-earn guide |
| Redeem points | ✅ | 3-step flow (select → amount → confirm) |
| Dark mode | 🔜 | Color tokens ready — hook up to useColorScheme |
| Push notifications | 🔜 | Hook up FCM + APNs |
| EMR integration | 🔜 | FHIR API contract needed |
| Real auth | 🔜 | Replace authStore mock with Auth0/Cognito/custom |
| Real data | 🔜 | Replace mockData.ts with API calls in each store |

---

## Connecting Real Data

All mock data lives in `constants/mockData.ts`. To connect a real API:

1. Create `services/api.ts` with your base URL and auth headers
2. In `store/authStore.ts`, replace the `login()` mock with a real POST to `/auth/login`
3. In `store/appStore.ts`, replace `loadData()` with parallel API calls:
   ```ts
   const [points, opps, claims, benefits] = await Promise.all([
     api.get('/points'),
     api.get('/opportunities'),
     api.get('/claims'),
     api.get('/benefits'),
   ]);
   ```
4. Add TanStack Query (`npm install @tanstack/react-query`) for caching, background refresh, and offline support

---

## Building for Production

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for Android (generates AAB for Play Store)
eas build --platform android --profile production

# Build for iOS (generates IPA for App Store)
eas build --platform ios --profile production
```

---

## Security Checklist (before production)

- [ ] Replace mock auth with real backend + JWT
- [ ] Remove `DevSettingsActivity` — set `android.buildType = release` in EAS
- [ ] Add SSL/TLS certificate pinning for the healthcare API
- [ ] Audit all Android permissions — remove READ_SMS, READ_CONTACTS etc.
- [ ] HIPAA review for any data stored in `expo-secure-store`
- [ ] BAA with AI provider used for doctor note generation
- [ ] Pen test the redemption flow for points manipulation
- [ ] Enable ProGuard/R8 in release build to strip unused code

---

*Built from analysis of the original carereward.apk (v1.0.0). All mock data is illustrative.*
