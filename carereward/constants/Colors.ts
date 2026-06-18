export const Colors = {
  // ── Brand ──────────────────────────────────────────────────────────────
  primary:      '#0D9488',   // teal-600
  primaryDark:  '#0F766E',   // teal-700
  primaryDeep:  '#134E4A',   // teal-900
  primaryLight: '#CCFBF1',   // teal-100
  primaryPale:  '#F0FDFA',   // teal-50

  // ── Points / Rewards (purple) ──────────────────────────────────────────
  points:       '#7C3AED',   // violet-700
  pointsDark:   '#6D28D9',   // violet-800
  pointsLight:  '#EDE9FE',   // violet-100
  pointsPale:   '#F5F3FF',   // violet-50

  // ── Semantic ───────────────────────────────────────────────────────────
  success:      '#16A34A',
  successLight: '#DCFCE7',
  successPale:  '#F0FDF4',

  warning:      '#D97706',
  warningLight: '#FEF3C7',
  warningPale:  '#FFFBEB',

  danger:       '#DC2626',
  dangerLight:  '#FEE2E2',
  dangerPale:   '#FFF5F5',

  info:         '#2563EB',
  infoLight:    '#DBEAFE',
  infoPale:     '#EFF6FF',

  // ── Neutrals ───────────────────────────────────────────────────────────
  white:        '#FFFFFF',
  gray50:       '#F8FAFC',
  gray100:      '#F1F5F9',
  gray200:      '#E2E8F0',
  gray300:      '#CBD5E1',
  gray400:      '#94A3B8',
  gray500:      '#64748B',
  gray600:      '#475569',
  gray700:      '#334155',
  gray800:      '#1E293B',
  gray900:      '#0F172A',

  // ── Semantic aliases ───────────────────────────────────────────────────
  text:           '#1E293B',
  textSecondary:  '#64748B',
  textMuted:      '#94A3B8',
  textInverse:    '#FFFFFF',
  background:     '#F8FAFC',
  surface:        '#FFFFFF',
  border:         '#E2E8F0',
  borderLight:    '#F1F5F9',
  overlay:        'rgba(15, 23, 42, 0.5)',
} as const;

// ── Opportunity category colours ──────────────────────────────────────────────
export const OpportunityColors = {
  medication:    { bg: '#DBEAFE', text: '#1D4ED8', icon: '#3B82F6' },
  preventive:    { bg: '#DCFCE7', text: '#15803D', icon: '#22C55E' },
  mail_delivery: { bg: '#FEF9C3', text: '#A16207', icon: '#EAB308' },
  upcoming_care: { bg: '#EDE9FE', text: '#6D28D9', icon: '#8B5CF6' },
  specialist:    { bg: '#FFE4E6', text: '#BE123C', icon: '#F43F5E' },
} as const;

// ── Tier colours ───────────────────────────────────────────────────────────────
export const TierColors = {
  standard:  { bg: Colors.gray100,  text: Colors.gray600,  border: Colors.gray300  },
  silver:    { bg: '#F1F5F9',       text: '#475569',       border: '#CBD5E1'       },
  gold:      { bg: '#FEF9C3',       text: '#92400E',       border: '#FCD34D'       },
  platinum:  { bg: Colors.primaryPale, text: Colors.primaryDark, border: Colors.primary },
} as const;

// ── Claim status colours ───────────────────────────────────────────────────────
export const ClaimStatusColors = {
  processed: { bg: Colors.successLight, text: Colors.success  },
  pending:   { bg: Colors.warningLight, text: Colors.warning  },
  denied:    { bg: Colors.dangerLight,  text: Colors.danger   },
  in_review: { bg: Colors.infoLight,    text: Colors.info     },
} as const;
