import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppStore } from '@/store/appStore';
import { Card } from '@/components/ui/Card';
import { ProgressBar, Badge, Divider } from '@/components/ui/index';
import { Colors } from '@/constants/Colors';

function formatCurrency(n: number) {
  return `$${n.toLocaleString('en-US')}`;
}

type Tab = 'overview' | 'prescriptions' | 'preventive';

export default function BenefitsScreen() {
  const { benefits } = useAppStore();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview',      label: 'Overview'      },
    { key: 'prescriptions', label: 'Prescriptions' },
    { key: 'preventive',    label: 'Preventive'    },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Benefits</Text>
        <Text style={styles.subtitle}>Premier Health PPO · Plan Year {benefits.planYear}</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {tabs.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, activeTab === t.key && styles.tabActive]}
            onPress={() => setActiveTab(t.key)}
          >
            <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <>
            {/* Plan summary pill */}
            <View style={styles.planBanner}>
              <MaterialCommunityIcons name="shield-check" size={18} color={Colors.primary} />
              <Text style={styles.planBannerText}>
                {benefits.inNetworkOnly ? 'In-network only' : 'In-network & out-of-network coverage'}
              </Text>
            </View>

            {/* Deductible progress */}
            {(['individual', 'family'] as const).map((scope) => {
              const data = benefits.deductible[scope];
              const pct  = data.met / data.total;
              const met  = pct >= 1;
              return (
                <Card key={scope} style={styles.progressCard}>
                  <View style={styles.progressHeader}>
                    <View>
                      <Text style={styles.progressTitle}>Deductible — {scope.charAt(0).toUpperCase() + scope.slice(1)}</Text>
                      <Text style={styles.progressSub}>Resets Jan 1, {parseInt(benefits.planYear) + 1}</Text>
                    </View>
                    {met
                      ? <Badge label="Met ✓" variant="success" />
                      : <Text style={styles.progressPct}>{Math.round(pct * 100)}%</Text>
                    }
                  </View>
                  <ProgressBar progress={pct} height={10} color={met ? Colors.success : Colors.primary} style={{ marginVertical: 12 }} />
                  <View style={styles.progressAmounts}>
                    <Text style={styles.progressMet}>{formatCurrency(data.met)} paid</Text>
                    <Text style={styles.progressTotal}>of {formatCurrency(data.total)}</Text>
                  </View>
                </Card>
              );
            })}

            {/* Out of Pocket Max */}
            {(['individual', 'family'] as const).map((scope) => {
              const data = benefits.outOfPocket[scope];
              const pct  = data.met / data.total;
              const met  = pct >= 1;
              return (
                <Card key={`oop_${scope}`} style={styles.progressCard}>
                  <View style={styles.progressHeader}>
                    <View>
                      <Text style={styles.progressTitle}>Out-of-Pocket Max — {scope.charAt(0).toUpperCase() + scope.slice(1)}</Text>
                      <Text style={styles.progressSub}>After this, plan pays 100%</Text>
                    </View>
                    {met
                      ? <Badge label="Met ✓" variant="success" />
                      : <Text style={styles.progressPct}>{Math.round(pct * 100)}%</Text>
                    }
                  </View>
                  <ProgressBar progress={pct} height={10} color={met ? Colors.success : Colors.warning} style={{ marginVertical: 12 }} />
                  <View style={styles.progressAmounts}>
                    <Text style={styles.progressMet}>{formatCurrency(data.met)} paid</Text>
                    <Text style={styles.progressTotal}>of {formatCurrency(data.total)}</Text>
                  </View>
                </Card>
              );
            })}

            {/* Info callout */}
            <View style={styles.infoBanner}>
              <MaterialCommunityIcons name="information-outline" size={16} color={Colors.info} />
              <Text style={styles.infoText}>
                Preventive care is covered at 100% with no deductible required. Switch to the Preventive tab to see what's included.
              </Text>
            </View>
          </>
        )}

        {/* ── PRESCRIPTIONS ── */}
        {activeTab === 'prescriptions' && (
          <>
            <Text style={styles.sectionLabel}>Drug Formulary Tiers</Text>
            <Text style={styles.sectionSub}>Your copay depends on the tier your medication is placed on.</Text>
            {benefits.copayTiers.map((tier) => (
              <Card key={tier.tier} style={styles.tierCard}>
                <View style={styles.tierHeader}>
                  <View style={[styles.tierBadge, { backgroundColor: tier.tier <= 2 ? Colors.successLight : Colors.warningLight }]}>
                    <Text style={[styles.tierBadgeText, { color: tier.tier <= 2 ? Colors.success : Colors.warning }]}>
                      Tier {tier.tier}
                    </Text>
                  </View>
                  <Text style={styles.tierCopay}>${tier.copay} copay</Text>
                </View>
                <Text style={styles.tierLabel}>{tier.label}</Text>
                <Text style={styles.tierDesc}>{tier.description}</Text>
                <Divider style={{ marginVertical: 10 }} />
                <Text style={styles.examplesLabel}>Examples</Text>
                <View style={styles.examplesRow}>
                  {tier.examples.map((e) => (
                    <View key={e} style={styles.examplePill}>
                      <Text style={styles.exampleText}>{e}</Text>
                    </View>
                  ))}
                </View>
              </Card>
            ))}

            <View style={styles.mailCallout}>
              <MaterialCommunityIcons name="truck-delivery-outline" size={22} color={Colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.mailTitle}>Save with mail-order pharmacy</Text>
                <Text style={styles.mailDesc}>Get a 90-day supply of maintenance medications for the price of a 60-day supply.</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.textMuted} />
            </View>
          </>
        )}

        {/* ── PREVENTIVE ── */}
        {activeTab === 'preventive' && (
          <>
            <View style={styles.prevBanner}>
              <MaterialCommunityIcons name="check-circle" size={18} color={Colors.success} />
              <Text style={styles.prevBannerText}>All preventive services below are covered at 100% — no copay, no deductible.</Text>
            </View>

            {benefits.preventiveServices.map((svc, idx) => {
              const isOverdue = svc.nextDue && new Date(svc.nextDue) < new Date();
              return (
                <React.Fragment key={svc.id}>
                  <View style={styles.prevRow}>
                    <View style={[styles.prevIcon, { backgroundColor: svc.lastCompleted ? Colors.successLight : Colors.gray100 }]}>
                      <MaterialCommunityIcons
                        name={svc.lastCompleted ? 'check' : 'calendar-blank-outline'}
                        size={18}
                        color={svc.lastCompleted ? Colors.success : Colors.textMuted}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.prevNameRow}>
                        <Text style={styles.prevName}>{svc.name}</Text>
                        {isOverdue && <Badge label="Overdue" variant="warning" />}
                      </View>
                      <Text style={styles.prevFrequency}>{svc.frequency}</Text>
                      {svc.lastCompleted && (
                        <Text style={styles.prevDate}>
                          Last: {new Date(svc.lastCompleted).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </Text>
                      )}
                      {svc.nextDue && (
                        <Text style={[styles.prevDate, isOverdue && { color: Colors.warning }]}>
                          Due: {new Date(svc.nextDue).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </Text>
                      )}
                    </View>
                  </View>
                  {idx < benefits.preventiveServices.length - 1 && <Divider />}
                </React.Fragment>
              );
            })}
          </>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.background },
  header:  { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title:   { fontSize: 26, fontWeight: '800', color: Colors.text },
  subtitle:{ fontSize: 13, color: Colors.textSecondary, marginTop: 2 },

  tabRow: { flexDirection: 'row', marginHorizontal: 20, backgroundColor: Colors.gray100, borderRadius: 12, padding: 4, marginBottom: 16 },
  tab:        { flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: 'center' },
  tabActive:  { backgroundColor: Colors.white, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  tabText:    { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: Colors.primary },

  scroll: { paddingHorizontal: 20, paddingBottom: 40 },

  planBanner:     { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.primaryPale, borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: Colors.primaryLight },
  planBannerText: { fontSize: 13, color: Colors.primaryDark, fontWeight: '500', flex: 1 },

  progressCard:    { padding: 16, marginBottom: 12 },
  progressHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  progressTitle:   { fontSize: 15, fontWeight: '700', color: Colors.text },
  progressSub:     { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  progressPct:     { fontSize: 16, fontWeight: '700', color: Colors.primary },
  progressAmounts: { flexDirection: 'row', justifyContent: 'space-between' },
  progressMet:     { fontSize: 14, fontWeight: '700', color: Colors.text },
  progressTotal:   { fontSize: 14, color: Colors.textSecondary },

  infoBanner: { flexDirection: 'row', gap: 8, backgroundColor: Colors.infoLight, borderRadius: 12, padding: 14, marginTop: 4 },
  infoText:   { flex: 1, fontSize: 13, color: Colors.info, lineHeight: 19 },

  sectionLabel: { fontSize: 17, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  sectionSub:   { fontSize: 13, color: Colors.textSecondary, marginBottom: 16, lineHeight: 19 },

  tierCard:       { padding: 16, marginBottom: 12 },
  tierHeader:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  tierBadge:      { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  tierBadgeText:  { fontSize: 12, fontWeight: '700' },
  tierCopay:      { fontSize: 20, fontWeight: '800', color: Colors.text },
  tierLabel:      { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  tierDesc:       { fontSize: 13, color: Colors.textSecondary },
  examplesLabel:  { fontSize: 12, fontWeight: '600', color: Colors.textMuted, marginBottom: 6 },
  examplesRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  examplePill:    { backgroundColor: Colors.gray100, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  exampleText:    { fontSize: 12, color: Colors.textSecondary },

  mailCallout: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.primaryPale, borderRadius: 14, padding: 14, marginTop: 8, borderWidth: 1, borderColor: Colors.primaryLight },
  mailTitle:   { fontSize: 14, fontWeight: '700', color: Colors.primaryDark, marginBottom: 2 },
  mailDesc:    { fontSize: 12, color: Colors.textSecondary, lineHeight: 17 },

  prevBanner:     { flexDirection: 'row', gap: 8, backgroundColor: Colors.successLight, borderRadius: 12, padding: 12, marginBottom: 16, alignItems: 'flex-start' },
  prevBannerText: { flex: 1, fontSize: 13, color: Colors.success, lineHeight: 19, fontWeight: '500' },

  prevRow:     { flexDirection: 'row', gap: 12, paddingVertical: 14, alignItems: 'flex-start' },
  prevIcon:    { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  prevNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  prevName:    { fontSize: 15, fontWeight: '700', color: Colors.text, flex: 1 },
  prevFrequency:{ fontSize: 12, color: Colors.textMuted, marginBottom: 2 },
  prevDate:    { fontSize: 12, color: Colors.textSecondary },
});
