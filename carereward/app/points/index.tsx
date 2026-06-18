import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SectionList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppStore } from '@/store/appStore';
import { Card } from '@/components/ui/Card';
import { ProgressBar, Divider } from '@/components/ui/index';
import { Button } from '@/components/ui/Button';
import { Colors, OpportunityColors } from '@/constants/Colors';
import type { PointsTransaction } from '@/types';

const TIER_THRESHOLDS = [
  { tier: 'Standard', min: 0,     max: 1999,  color: Colors.gray400 },
  { tier: 'Silver',   min: 2000,  max: 4999,  color: '#64748B'      },
  { tier: 'Gold',     min: 5000,  max: 9999,  color: Colors.warning },
  { tier: 'Platinum', min: 10000, max: 99999, color: Colors.primary },
];

function groupTransactionsByMonth(txns: PointsTransaction[]) {
  const groups: Record<string, PointsTransaction[]> = {};
  txns.forEach((t) => {
    const d   = new Date(t.date);
    const key = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!groups[key]) groups[key] = [];
    groups[key].push(t);
  });
  return Object.entries(groups).map(([title, data]) => ({ title, data }));
}

const CATEGORY_ICONS: Record<string, string> = {
  medication:    'pill',
  preventive:    'heart-pulse',
  mail_delivery: 'truck-delivery',
  upcoming_care: 'calendar-check',
  specialist:    'stethoscope',
  redemption:    'gift',
  bonus:         'star-circle',
  survey:        'clipboard-text',
};

const CATEGORY_COLORS: Record<string, string> = {
  medication:    Colors.info,
  preventive:    Colors.success,
  mail_delivery: Colors.warning,
  upcoming_care: Colors.points,
  specialist:    '#F43F5E',
  redemption:    Colors.danger,
  bonus:         Colors.primary,
  survey:        Colors.gray500,
};

export default function PointsScreen() {
  const router   = useRouter();
  const { points } = useAppStore();
  const [filter, setFilter] = useState<'all' | 'earned' | 'redeemed'>('all');

  const filtered = filter === 'all'
    ? points.transactions
    : points.transactions.filter((t) => t.type === filter);

  const sections = groupTransactionsByMonth(filtered);

  // Tier progress
  const currentTierIdx = TIER_THRESHOLDS.findIndex(
    (t) => points.earnedThisYear >= t.min && points.earnedThisYear <= t.max,
  );
  const currentTier = TIER_THRESHOLDS[currentTierIdx] ?? TIER_THRESHOLDS[0];
  const nextTier    = TIER_THRESHOLDS[currentTierIdx + 1];
  const tierProg    = nextTier
    ? (points.earnedThisYear - currentTier.min) / (currentTier.max - currentTier.min + 1)
    : 1;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'My Points',
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.primary,
          headerTitleStyle: { fontSize: 15, fontWeight: '600', color: Colors.text },
          headerShadowVisible: false,
        }}
      />
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          ListHeaderComponent={
            <>
              {/* Balance hero */}
              <View style={styles.balanceHero}>
                <View style={styles.heroInner}>
                  <View style={styles.heroCircle1} />
                  <View style={styles.heroCircle2} />
                  <Text style={styles.balanceLabel}>Current Balance</Text>
                  <Text style={styles.balanceValue}>{points.balance.toLocaleString()}</Text>
                  <Text style={styles.balancePts}>points</Text>
                  <Button
                    label="Redeem Points"
                    onPress={() => router.push('/points/redeem')}
                    style={styles.redeemBtn}
                  />
                </View>
              </View>

              {/* Stats row */}
              <View style={styles.statsRow}>
                {[
                  { label: 'Earned 2025',    value: points.earnedThisYear.toLocaleString(),  icon: 'arrow-up-circle',   color: Colors.success },
                  { label: 'Redeemed',        value: points.redeemedThisYear.toLocaleString(), icon: 'arrow-down-circle', color: Colors.warning },
                  { label: 'Savings Unlocked',value: `$${points.savingsThisYear}`,            icon: 'cash-multiple',     color: Colors.primary },
                ].map((stat) => (
                  <View key={stat.label} style={styles.statCard}>
                    <MaterialCommunityIcons name={stat.icon as any} size={20} color={stat.color} />
                    <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                  </View>
                ))}
              </View>

              {/* Tier progress */}
              <Card style={styles.tierCard}>
                <View style={styles.tierHeader}>
                  <View>
                    <Text style={styles.tierTitle}>{currentTier.tier} Member</Text>
                    {nextTier && (
                      <Text style={styles.tierSub}>
                        {(nextTier.min - points.earnedThisYear).toLocaleString()} pts to {nextTier.tier}
                      </Text>
                    )}
                  </View>
                  <View style={[styles.tierDot, { backgroundColor: currentTier.color }]} />
                </View>
                <ProgressBar
                  progress={tierProg}
                  color={nextTier?.color ?? Colors.primary}
                  height={10}
                  style={{ marginVertical: 10 }}
                />
                <View style={styles.tierScale}>
                  {TIER_THRESHOLDS.map((t, i) => (
                    <View key={t.tier} style={styles.tierScaleItem}>
                      <View style={[styles.tierScaleDot, {
                        backgroundColor: i <= currentTierIdx ? t.color : Colors.gray200,
                      }]} />
                      <Text style={[styles.tierScaleLabel, i === currentTierIdx && { fontWeight: '700', color: Colors.text }]}>
                        {t.tier}
                      </Text>
                    </View>
                  ))}
                </View>
              </Card>

              {/* How to earn */}
              <Card style={styles.howToEarnCard}>
                <Text style={styles.howTitle}>Ways to Earn Points</Text>
                {[
                  { label: 'Switch to a generic medication',  pts: 500, icon: 'pill',               color: Colors.info    },
                  { label: 'Enrol in mail-order pharmacy',    pts: 500, icon: 'truck-delivery',      color: Colors.warning },
                  { label: 'Complete preventive care',        pts: 300, icon: 'heart-pulse',         color: Colors.success },
                  { label: 'Complete a survey',               pts: 50,  icon: 'clipboard-text',      color: Colors.gray500 },
                  { label: 'Monthly engagement bonus',        pts: 100, icon: 'star-circle',         color: Colors.primary },
                  { label: 'Upload upcoming care plan',       pts: 50,  icon: 'calendar-check',      color: Colors.points  },
                ].map((item, idx) => (
                  <React.Fragment key={item.label}>
                    <View style={styles.earnRow}>
                      <View style={[styles.earnIcon, { backgroundColor: item.color + '22' }]}>
                        <MaterialCommunityIcons name={item.icon as any} size={16} color={item.color} />
                      </View>
                      <Text style={styles.earnLabel}>{item.label}</Text>
                      <View style={styles.earnPts}>
                        <MaterialCommunityIcons name="star" size={11} color={Colors.points} />
                        <Text style={styles.earnPtsText}>+{item.pts}</Text>
                      </View>
                    </View>
                    {idx < 5 && <Divider style={{ marginLeft: 44 }} />}
                  </React.Fragment>
                ))}
              </Card>

              {/* Transaction filter */}
              <View style={styles.txHeader}>
                <Text style={styles.txTitle}>Transaction History</Text>
                <View style={styles.txFilters}>
                  {(['all', 'earned', 'redeemed'] as const).map((f) => (
                    <TouchableOpacity
                      key={f}
                      onPress={() => setFilter(f)}
                      style={[styles.txChip, filter === f && styles.txChipActive]}
                    >
                      <Text style={[styles.txChipText, filter === f && styles.txChipTextActive]}>
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          }
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
          )}
          renderItem={({ item: tx }) => {
            const isEarned  = tx.type === 'earned';
            const iconName  = CATEGORY_ICONS[tx.category] ?? 'star';
            const iconColor = CATEGORY_COLORS[tx.category] ?? Colors.primary;
            return (
              <View style={styles.txRow}>
                <View style={[styles.txIcon, { backgroundColor: iconColor + '22' }]}>
                  <MaterialCommunityIcons name={iconName as any} size={18} color={iconColor} />
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txDesc}>{tx.description}</Text>
                  <Text style={styles.txDate}>
                    {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </Text>
                </View>
                <Text style={[styles.txPoints, { color: isEarned ? Colors.success : Colors.danger }]}>
                  {isEarned ? '+' : ''}{tx.points.toLocaleString()}
                </Text>
              </View>
            );
          }}
          contentContainerStyle={styles.content}
          ListFooterComponent={<View style={{ height: 40 }} />}
        />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 32 },

  balanceHero: { marginBottom: 16 },
  heroInner: {
    backgroundColor: Colors.primary, margin: 20, borderRadius: 24,
    padding: 28, alignItems: 'center', overflow: 'hidden',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 16, elevation: 8,
  },
  heroCircle1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.07)', top: -80, right: -60 },
  heroCircle2: { position: 'absolute', width: 140, height: 140, borderRadius: 70,  backgroundColor: 'rgba(255,255,255,0.07)', bottom: -50, left: -30 },
  balanceLabel: { fontSize: 14, color: 'rgba(255,255,255,0.75)', fontWeight: '500', marginBottom: 6 },
  balanceValue: { fontSize: 56, fontWeight: '900', color: Colors.white, lineHeight: 60 },
  balancePts:   { fontSize: 16, color: 'rgba(255,255,255,0.75)', fontWeight: '600', marginBottom: 20 },
  redeemBtn:    { backgroundColor: Colors.white, paddingHorizontal: 32, borderRadius: 14 },

  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: Colors.surface, borderRadius: 14, padding: 12, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: Colors.border },
  statValue:{ fontSize: 16, fontWeight: '800' },
  statLabel:{ fontSize: 10, color: Colors.textMuted, textAlign: 'center', fontWeight: '500' },

  tierCard:   { marginHorizontal: 20, padding: 16, marginBottom: 16 },
  tierHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  tierTitle:  { fontSize: 16, fontWeight: '700', color: Colors.text },
  tierSub:    { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  tierDot:    { width: 12, height: 12, borderRadius: 999 },
  tierScale:  { flexDirection: 'row', justifyContent: 'space-between' },
  tierScaleItem: { alignItems: 'center', gap: 4 },
  tierScaleDot:  { width: 8, height: 8, borderRadius: 999 },
  tierScaleLabel:{ fontSize: 10, color: Colors.textMuted, fontWeight: '500' },

  howToEarnCard: { marginHorizontal: 20, padding: 16, marginBottom: 16 },
  howTitle:   { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  earnRow:    { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9 },
  earnIcon:   { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  earnLabel:  { flex: 1, fontSize: 13, color: Colors.text },
  earnPts:    { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: Colors.pointsLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  earnPtsText:{ fontSize: 12, fontWeight: '700', color: Colors.points },

  txHeader:  { paddingHorizontal: 20, paddingBottom: 8 },
  txTitle:   { fontSize: 17, fontWeight: '700', color: Colors.text, marginBottom: 10 },
  txFilters: { flexDirection: 'row', gap: 8 },
  txChip:    { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  txChipActive:     { backgroundColor: Colors.primary, borderColor: Colors.primary },
  txChipText:       { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  txChipTextActive: { color: Colors.white },

  sectionHeader: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },
  sectionTitle:  { fontSize: 13, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },

  txRow:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, gap: 12, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  txIcon:  { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  txInfo:  { flex: 1 },
  txDesc:  { fontSize: 14, fontWeight: '500', color: Colors.text, marginBottom: 2 },
  txDate:  { fontSize: 12, color: Colors.textMuted },
  txPoints:{ fontSize: 16, fontWeight: '800' },
});
