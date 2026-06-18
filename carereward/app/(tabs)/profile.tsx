import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Switch, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import { Card } from '@/components/ui/Card';
import { ProgressBar, Divider } from '@/components/ui/index';
import { Colors, TierColors } from '@/constants/Colors';

const TIER_ORDER = ['standard', 'silver', 'gold', 'platinum'];
const TIER_POINTS: Record<string, number> = {
  standard: 0, silver: 2000, gold: 5000, platinum: 10000,
};

export default function ProfileScreen() {
  const router = useRouter();
  const user   = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { points } = useAppStore();

  const [notifEnabled, setNotifEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(true);

  const tierIdx    = TIER_ORDER.indexOf(user?.tier ?? 'standard');
  const nextTier   = TIER_ORDER[tierIdx + 1];
  const nextPoints = nextTier ? TIER_POINTS[nextTier] : null;
  const tierProg   = nextPoints ? Math.min(points.earnedThisYear / nextPoints, 1) : 1;
  const tierColor  = TierColors[user?.tier ?? 'standard'];

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const menuItems = [
    {
      section: 'Account',
      items: [
        { icon: 'card-account-details-outline', label: 'Member Information', sub: user?.memberId,       route: null },
        { icon: 'shield-lock-outline',           label: 'Privacy & Security',  sub: 'Manage your data', route: null },
        { icon: 'bell-outline',                  label: 'Notifications',       sub: null,               route: null, toggle: true, value: notifEnabled, onToggle: setNotifEnabled },
        { icon: 'fingerprint',                   label: 'Biometric Login',     sub: null,               route: null, toggle: true, value: biometricEnabled, onToggle: setBiometricEnabled },
      ],
    },
    {
      section: 'Support',
      items: [
        { icon: 'help-circle-outline',    label: 'Help Center',      sub: 'FAQs and guides',    route: null },
        { icon: 'phone-outline',          label: 'Contact Support',  sub: '1-800-555-0199',     route: null },
        { icon: 'file-document-outline',  label: 'Terms of Service', sub: null,                 route: null },
        { icon: 'information-outline',    label: 'App Version',      sub: 'v1.0.0 (Build 1)',   route: null },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Avatar + name */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.avatarInitials}</Text>
          </View>
          <View>
            <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
            <Text style={styles.email}>{user?.email}</Text>
            <View style={styles.planRow}>
              <MaterialCommunityIcons name="shield-check-outline" size={13} color={Colors.textMuted} />
              <Text style={styles.planText}>{user?.planName}</Text>
            </View>
          </View>
        </View>

        {/* Tier card */}
        <Card style={styles.tierCard}>
          <View style={styles.tierHeader}>
            <View style={[styles.tierBadge, { backgroundColor: tierColor.bg, borderColor: tierColor.border }]}>
              <MaterialCommunityIcons name="star-circle" size={14} color={tierColor.text} />
              <Text style={[styles.tierLabel, { color: tierColor.text }]}>
                {(user?.tier ?? 'standard').toUpperCase()} MEMBER
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/points')}>
              <Text style={styles.tierViewAll}>View points →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tierStats}>
            <View style={styles.tierStat}>
              <Text style={styles.tierStatValue}>{points.balance.toLocaleString()}</Text>
              <Text style={styles.tierStatLabel}>Balance</Text>
            </View>
            <View style={styles.tierDivider} />
            <View style={styles.tierStat}>
              <Text style={styles.tierStatValue}>{points.earnedThisYear.toLocaleString()}</Text>
              <Text style={styles.tierStatLabel}>Earned 2025</Text>
            </View>
            <View style={styles.tierDivider} />
            <View style={styles.tierStat}>
              <Text style={styles.tierStatValue}>${points.savingsThisYear}</Text>
              <Text style={styles.tierStatLabel}>Saved</Text>
            </View>
          </View>

          {nextTier && (
            <>
              <View style={styles.tierProgressRow}>
                <Text style={styles.tierProgressLabel}>Progress to {nextTier.charAt(0).toUpperCase() + nextTier.slice(1)}</Text>
                <Text style={styles.tierProgressPts}>{points.earnedThisYear.toLocaleString()} / {TIER_POINTS[nextTier].toLocaleString()} pts</Text>
              </View>
              <ProgressBar progress={tierProg} height={8} style={{ marginTop: 6 }} />
            </>
          )}
        </Card>

        {/* Quick redeem */}
        <TouchableOpacity style={styles.redeemBanner} onPress={() => router.push('/points/redeem')}>
          <MaterialCommunityIcons name="gift-outline" size={22} color={Colors.points} />
          <View style={{ flex: 1 }}>
            <Text style={styles.redeemTitle}>Redeem {points.balance.toLocaleString()} points</Text>
            <Text style={styles.redeemSub}>Premium reduction · copay credit · gift cards</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.points} />
        </TouchableOpacity>

        {/* Menu sections */}
        {menuItems.map((section) => (
          <View key={section.section} style={styles.menuSection}>
            <Text style={styles.menuSectionTitle}>{section.section}</Text>
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              {section.items.map((item, idx) => (
                <React.Fragment key={item.label}>
                  <TouchableOpacity
                    style={styles.menuItem}
                    activeOpacity={item.toggle ? 1 : 0.7}
                    onPress={item.route ? () => {} : undefined}
                  >
                    <View style={styles.menuIcon}>
                      <MaterialCommunityIcons name={item.icon as any} size={20} color={Colors.primary} />
                    </View>
                    <View style={styles.menuContent}>
                      <Text style={styles.menuLabel}>{item.label}</Text>
                      {item.sub && <Text style={styles.menuSub}>{item.sub}</Text>}
                    </View>
                    {item.toggle ? (
                      <Switch
                        value={item.value}
                        onValueChange={item.onToggle}
                        trackColor={{ true: Colors.primary, false: Colors.gray200 }}
                        thumbColor={Colors.white}
                      />
                    ) : (
                      <MaterialCommunityIcons name="chevron-right" size={18} color={Colors.textMuted} />
                    )}
                  </TouchableOpacity>
                  {idx < section.items.length - 1 && <Divider style={{ marginLeft: 56 }} />}
                </React.Fragment>
              ))}
            </Card>
          </View>
        ))}

        {/* Sign out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={20} color={Colors.danger} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 20 },

  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 },
  avatar:        { width: 64, height: 64, borderRadius: 22, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText:    { fontSize: 22, fontWeight: '800', color: Colors.white },
  name:          { fontSize: 20, fontWeight: '800', color: Colors.text, marginBottom: 2 },
  email:         { fontSize: 13, color: Colors.textSecondary, marginBottom: 4 },
  planRow:       { flexDirection: 'row', alignItems: 'center', gap: 4 },
  planText:      { fontSize: 12, color: Colors.textMuted },

  tierCard:    { padding: 16, marginBottom: 12 },
  tierHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  tierBadge:   { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, borderWidth: 1 },
  tierLabel:   { fontSize: 11, fontWeight: '700' },
  tierViewAll: { fontSize: 13, fontWeight: '600', color: Colors.primary },

  tierStats:   { flexDirection: 'row', backgroundColor: Colors.gray50, borderRadius: 12, padding: 12, marginBottom: 14 },
  tierStat:    { flex: 1, alignItems: 'center' },
  tierStatValue: { fontSize: 16, fontWeight: '800', color: Colors.text, marginBottom: 2 },
  tierStatLabel: { fontSize: 10, color: Colors.textMuted, fontWeight: '500' },
  tierDivider: { width: 1, backgroundColor: Colors.border, marginHorizontal: 8 },

  tierProgressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tierProgressLabel:{ fontSize: 13, fontWeight: '600', color: Colors.text },
  tierProgressPts:  { fontSize: 12, color: Colors.textSecondary },

  redeemBanner: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.pointsLight, borderRadius: 14, padding: 14, marginBottom: 24, borderWidth: 1, borderColor: '#D4C4FB' },
  redeemTitle: { fontSize: 14, fontWeight: '700', color: Colors.points },
  redeemSub:   { fontSize: 12, color: Colors.textSecondary },

  menuSection:      { marginBottom: 20 },
  menuSectionTitle: { fontSize: 12, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, paddingLeft: 4 },

  menuItem:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13, gap: 12 },
  menuIcon:    { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.primaryPale, alignItems: 'center', justifyContent: 'center' },
  menuContent: { flex: 1 },
  menuLabel:   { fontSize: 15, fontWeight: '500', color: Colors.text },
  menuSub:     { fontSize: 12, color: Colors.textMuted, marginTop: 1 },

  signOutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14, backgroundColor: Colors.dangerLight, marginTop: 4 },
  signOutText:{ fontSize: 15, fontWeight: '700', color: Colors.danger },
});
