import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SectionList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppStore } from '@/store/appStore';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/index';
import { Colors, ClaimStatusColors } from '@/constants/Colors';
import type { Claim } from '@/types';

function groupByMonth(claims: Claim[]) {
  const groups: Record<string, Claim[]> = {};
  claims.forEach((c) => {
    const d = new Date(c.date);
    const key = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!groups[key]) groups[key] = [];
    groups[key].push(c);
  });
  return Object.entries(groups).map(([title, data]) => ({ title, data }));
}

function formatCurrency(n: number) {
  return n === 0 ? '$0' : `$${n.toFixed(2)}`;
}

const STATUS_VARIANTS: Record<string, any> = {
  processed: 'success', pending: 'warning', denied: 'danger', in_review: 'info',
};

export default function ClaimsScreen() {
  const router = useRouter();
  const { claims } = useAppStore();
  const [activeStatus, setActiveStatus] = useState<'all' | 'processed' | 'pending' | 'denied'>('all');

  const filtered = activeStatus === 'all' ? claims : claims.filter((c) => c.status === activeStatus);
  const sections = groupByMonth(filtered);

  const totalPaid    = claims.filter((c) => c.status === 'processed').reduce((s, c) => s + c.insurancePaid, 0);
  const totalYourCost = claims.filter((c) => c.status === 'processed').reduce((s, c) => s + c.patientResponsibility, 0);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Claims History</Text>
        <Text style={styles.subtitle}>Plan year 2025</Text>
      </View>

      {/* Summary cards */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.summaryRow}>
        {[
          { label: 'Insurance Paid', value: formatCurrency(totalPaid), color: Colors.primary, icon: 'shield-check' },
          { label: 'Your Cost',      value: formatCurrency(totalYourCost), color: Colors.warning, icon: 'wallet-outline' },
          { label: 'Total Claims',   value: `${claims.length}`,           color: Colors.info,    icon: 'file-document-outline' },
        ].map((stat) => (
          <View key={stat.label} style={[styles.summaryCard, { borderLeftColor: stat.color }]}>
            <MaterialCommunityIcons name={stat.icon as any} size={20} color={stat.color} />
            <Text style={styles.summaryValue}>{stat.value}</Text>
            <Text style={styles.summaryLabel}>{stat.label}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Status filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {(['all', 'processed', 'pending', 'denied'] as const).map((s) => (
          <TouchableOpacity
            key={s}
            onPress={() => setActiveStatus(s)}
            style={[styles.chip, activeStatus === s && styles.chipActive]}
          >
            <Text style={[styles.chipText, activeStatus === s && styles.chipTextActive]}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Claims list */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionCount}>{section.data.length} claims</Text>
          </View>
        )}
        renderItem={({ item: claim }) => {
          const sc = ClaimStatusColors[claim.status];
          return (
            <TouchableOpacity activeOpacity={0.85} onPress={() => router.push(`/claim/${claim.id}`)}>
              <Card style={styles.claimCard}>
                <View style={styles.claimHeader}>
                  <View style={styles.claimLeft}>
                    <Text style={styles.claimProvider} numberOfLines={1}>{claim.providerName}</Text>
                    <Text style={styles.claimType}>{claim.providerType}</Text>
                  </View>
                  <Badge label={claim.status.replace('_', ' ')} variant={STATUS_VARIANTS[claim.status]} />
                </View>

                <Text style={styles.claimDesc} numberOfLines={1}>{claim.serviceDescription}</Text>
                <Text style={styles.claimDate}>
                  Service date: {new Date(claim.serviceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </Text>

                <View style={styles.claimAmounts}>
                  <View style={styles.amountItem}>
                    <Text style={styles.amountValue}>{formatCurrency(claim.billedAmount)}</Text>
                    <Text style={styles.amountLabel}>Billed</Text>
                  </View>
                  <MaterialCommunityIcons name="arrow-right" size={16} color={Colors.textMuted} />
                  <View style={styles.amountItem}>
                    <Text style={[styles.amountValue, { color: Colors.primary }]}>{formatCurrency(claim.insurancePaid)}</Text>
                    <Text style={styles.amountLabel}>Plan paid</Text>
                  </View>
                  <MaterialCommunityIcons name="arrow-right" size={16} color={Colors.textMuted} />
                  <View style={styles.amountItem}>
                    <Text style={[styles.amountValue, { color: claim.patientResponsibility > 0 ? Colors.warning : Colors.success }]}>
                      {formatCurrency(claim.patientResponsibility)}
                    </Text>
                    <Text style={styles.amountLabel}>Your cost</Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.background },
  header:  { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title:   { fontSize: 26, fontWeight: '800', color: Colors.text },
  subtitle:{ fontSize: 13, color: Colors.textSecondary, marginTop: 2 },

  summaryRow: { paddingHorizontal: 20, paddingVertical: 12, gap: 10 },
  summaryCard: { backgroundColor: Colors.surface, borderRadius: 14, padding: 14, borderLeftWidth: 4, minWidth: 130, gap: 4 },
  summaryValue: { fontSize: 18, fontWeight: '800', color: Colors.text },
  summaryLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' },

  filters: { paddingHorizontal: 20, paddingBottom: 8, gap: 8 },
  chip:    { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  chipActive:     { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText:       { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  chipTextActive: { color: Colors.white },

  list: { paddingHorizontal: 20, paddingBottom: 32 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, marginTop: 8 },
  sectionTitle:  { fontSize: 15, fontWeight: '700', color: Colors.text },
  sectionCount:  { fontSize: 12, color: Colors.textMuted },

  claimCard:    { marginBottom: 10, padding: 16 },
  claimHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  claimLeft:    { flex: 1, marginRight: 10 },
  claimProvider:{ fontSize: 15, fontWeight: '700', color: Colors.text },
  claimType:    { fontSize: 12, color: Colors.textMuted, marginTop: 1 },
  claimDesc:    { fontSize: 13, color: Colors.textSecondary, marginBottom: 4 },
  claimDate:    { fontSize: 12, color: Colors.textMuted, marginBottom: 12 },

  claimAmounts: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.gray50, borderRadius: 10, padding: 12 },
  amountItem:   { alignItems: 'center', flex: 1 },
  amountValue:  { fontSize: 15, fontWeight: '700', color: Colors.text },
  amountLabel:  { fontSize: 10, color: Colors.textMuted, fontWeight: '500', marginTop: 2 },
});
