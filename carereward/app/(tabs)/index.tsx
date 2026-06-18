import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import { Card } from '@/components/ui/Card';
import { Badge, ProgressBar, SectionHeader } from '@/components/ui/index';
import { Colors, OpportunityColors, TierColors } from '@/constants/Colors';

const { width } = Dimensions.get('window');

function formatCurrency(amount: number) {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
}

function formatPoints(pts: number) {
  return pts.toLocaleString('en-US');
}

export default function DashboardScreen() {
  const router = useRouter();
  const user   = useAuthStore((s) => s.user);
  const { points, opportunities, benefits } = useAppStore();

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const availableOpps  = opportunities.filter((o) => o.status === 'available').slice(0, 3);
  const deductible     = benefits.deductible.individual;
  const deductiblePct  = deductible.met / deductible.total;
  const tierColor      = TierColors[user?.tier ?? 'standard'];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting()}, {user?.firstName} 👋</Text>
            <View style={styles.memberRow}>
              <MaterialCommunityIcons name="card-account-details-outline" size={13} color={Colors.textMuted} />
              <Text style={styles.memberId}>{user?.memberId}</Text>
              <View style={[styles.tierPill, { backgroundColor: tierColor.bg, borderColor: tierColor.border }]}>
                <Text style={[styles.tierText, { color: tierColor.text }]}>
                  {(user?.tier ?? 'standard').toUpperCase()}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.notifBtn}>
            <MaterialCommunityIcons name="bell-outline" size={22} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* ── Points Card ── */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push('/points')}
          style={styles.pointsCardWrapper}
        >
          <View style={styles.pointsCard}>
            {/* Background pattern */}
            <View style={styles.cardCircle1} />
            <View style={styles.cardCircle2} />

            <View style={styles.pointsRow}>
              <View>
                <Text style={styles.pointsLabel}>My Points Balance</Text>
                <Text style={styles.pointsValue}>{formatPoints(points.balance)}</Text>
                <Text style={styles.pointsSubLabel}>pts</Text>
              </View>
              <View style={styles.pointsRight}>
                <MaterialCommunityIcons name="star-circle" size={56} color="rgba(255,255,255,0.25)" />
              </View>
            </View>

            <View style={styles.pointsStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{formatPoints(points.earnedThisYear)}</Text>
                <Text style={styles.statLabel}>Earned this year</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{formatCurrency(points.savingsThisYear)}</Text>
                <Text style={styles.statLabel}>Savings unlocked</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{availableOpps.length}</Text>
                <Text style={styles.statLabel}>Opportunities</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.redeemBtn}
              onPress={() => router.push('/points/redeem')}
            >
              <Text style={styles.redeemText}>Redeem Points</Text>
              <MaterialCommunityIcons name="arrow-right" size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {/* ── Deductible Progress ── */}
        <View style={styles.section}>
          <Card style={styles.deductibleCard}>
            <View style={styles.deductRow}>
              <Text style={styles.deductTitle}>Individual Deductible</Text>
              <Text style={styles.deductPct}>{Math.round(deductiblePct * 100)}% met</Text>
            </View>
            <ProgressBar progress={deductiblePct} height={10} style={{ marginVertical: 10 }} />
            <View style={styles.deductAmounts}>
              <Text style={styles.deductMet}>{formatCurrency(deductible.met)} paid</Text>
              <Text style={styles.deductTotal}>{formatCurrency(deductible.total)} total</Text>
            </View>
            {deductible.met >= deductible.total && (
              <Badge label="✓ Deductible met!" variant="success" style={{ marginTop: 8 }} />
            )}
          </Card>
        </View>

        {/* ── Top Opportunities ── */}
        <View style={styles.section}>
          <SectionHeader
            title="Earn Points"
            action="See all"
            onAction={() => router.push('/(tabs)/opportunities')}
          />
          {availableOpps.map((opp) => {
            const oc = OpportunityColors[opp.type];
            return (
              <TouchableOpacity
                key={opp.id}
                activeOpacity={0.8}
                onPress={() => router.push(`/opportunity/${opp.id}`)}
              >
                <Card style={styles.oppCard}>
                  <View style={styles.oppRow}>
                    <View style={[styles.oppIcon, { backgroundColor: oc.bg }]}>
                      <MaterialCommunityIcons name={opp.icon as any} size={22} color={oc.icon} />
                    </View>
                    <View style={styles.oppContent}>
                      <Text style={styles.oppTitle} numberOfLines={1}>{opp.title}</Text>
                      <Text style={styles.oppDesc} numberOfLines={2}>{opp.shortDescription}</Text>
                      <View style={styles.oppMeta}>
                        <View style={styles.oppPointsPill}>
                          <MaterialCommunityIcons name="star" size={12} color={Colors.points} />
                          <Text style={styles.oppPoints}>+{formatPoints(opp.pointsReward)} pts</Text>
                        </View>
                        {opp.estimatedSavings > 0 && (
                          <Text style={styles.oppSavings}>Save {formatCurrency(opp.estimatedSavings)}/mo</Text>
                        )}
                      </View>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.textMuted} />
                  </View>
                </Card>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Quick Actions ── */}
        <View style={styles.section}>
          <SectionHeader title="Quick Actions" />
          <View style={styles.quickGrid}>
            {[
              { label: 'Doctor Note',  icon: 'file-document-edit-outline', color: Colors.info,    bg: Colors.infoLight,    route: '/doctor-note' },
              { label: 'Points History', icon: 'history',                  color: Colors.points,  bg: Colors.pointsLight,  route: '/points' },
              { label: 'Find Provider',  icon: 'map-marker-outline',       color: Colors.success, bg: Colors.successLight, route: '/(tabs)/benefits' },
              { label: 'Submit Claim',   icon: 'plus-circle-outline',      color: Colors.warning, bg: Colors.warningLight, route: '/(tabs)/claims' },
            ].map((action) => (
              <TouchableOpacity
                key={action.label}
                style={[styles.quickItem, { backgroundColor: action.bg }]}
                activeOpacity={0.8}
                onPress={() => router.push(action.route as any)}
              >
                <MaterialCommunityIcons name={action.icon as any} size={26} color={action.color} />
                <Text style={[styles.quickLabel, { color: action.color }]}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 20 },

  // Header
  header:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  greeting:  { fontSize: 22, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  memberId:  { fontSize: 12, color: Colors.textMuted },
  tierPill:  { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, borderWidth: 1 },
  tierText:  { fontSize: 10, fontWeight: '700' },
  notifBtn:  { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },

  // Points card
  pointsCardWrapper: { marginBottom: 20 },
  pointsCard: {
    backgroundColor: Colors.primary,
    borderRadius: 24,
    padding: 20,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16, elevation: 8,
  },
  cardCircle1: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.07)', top: -60, right: -40 },
  cardCircle2: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.07)', bottom: -30, left: 20 },

  pointsRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  pointsLabel:   { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 4, fontWeight: '500' },
  pointsValue:   { fontSize: 48, fontWeight: '800', color: Colors.white, lineHeight: 52 },
  pointsSubLabel:{ fontSize: 16, color: 'rgba(255,255,255,0.75)', fontWeight: '600' },
  pointsRight:   { justifyContent: 'center' },

  pointsStats:  { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 14, padding: 12, marginBottom: 14 },
  statItem:     { flex: 1, alignItems: 'center' },
  statValue:    { fontSize: 15, fontWeight: '700', color: Colors.white, marginBottom: 2 },
  statLabel:    { fontSize: 10, color: 'rgba(255,255,255,0.7)', textAlign: 'center', fontWeight: '500' },
  statDivider:  { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 8 },

  redeemBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.white, borderRadius: 12,
    paddingVertical: 12, gap: 6,
  },
  redeemText: { fontSize: 14, fontWeight: '700', color: Colors.primary },

  // Section
  section: { marginBottom: 24 },

  // Deductible
  deductibleCard: { padding: 16 },
  deductRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  deductTitle:  { fontSize: 15, fontWeight: '700', color: Colors.text },
  deductPct:    { fontSize: 14, fontWeight: '600', color: Colors.primary },
  deductAmounts:{ flexDirection: 'row', justifyContent: 'space-between' },
  deductMet:    { fontSize: 13, fontWeight: '600', color: Colors.text },
  deductTotal:  { fontSize: 13, color: Colors.textSecondary },

  // Opportunity card
  oppCard: { marginBottom: 10, padding: 14 },
  oppRow:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
  oppIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  oppContent: { flex: 1 },
  oppTitle:   { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  oppDesc:    { fontSize: 12, color: Colors.textSecondary, lineHeight: 17, marginBottom: 6 },
  oppMeta:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  oppPointsPill: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: Colors.pointsLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  oppPoints:  { fontSize: 12, fontWeight: '700', color: Colors.points },
  oppSavings: { fontSize: 12, fontWeight: '600', color: Colors.success },

  // Quick actions
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  quickItem: { width: (width - 52) / 2, borderRadius: 16, padding: 16, alignItems: 'center', gap: 8 },
  quickLabel:{ fontSize: 13, fontWeight: '700', textAlign: 'center' },
});
