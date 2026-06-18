import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppStore } from '@/store/appStore';
import { Card } from '@/components/ui/Card';
import { Badge, EmptyState } from '@/components/ui/index';
import { Colors, OpportunityColors } from '@/constants/Colors';
import type { OpportunityType, OpportunityStatus } from '@/types';

const FILTERS: { label: string; value: OpportunityType | 'all' }[] = [
  { label: 'All',         value: 'all'          },
  { label: 'Medication',  value: 'medication'   },
  { label: 'Preventive',  value: 'preventive'   },
  { label: 'Mail Order',  value: 'mail_delivery'},
  { label: 'Upcoming',    value: 'upcoming_care'},
  { label: 'Surveys',     value: 'specialist'   },
];

const STATUS_LABELS: Record<OpportunityStatus, { label: string; variant: any }> = {
  available:   { label: 'Available',   variant: 'primary' },
  in_progress: { label: 'In Progress', variant: 'warning' },
  completed:   { label: 'Completed',   variant: 'success' },
  missed:      { label: 'Missed',      variant: 'neutral' },
};

export default function OpportunitiesScreen() {
  const router = useRouter();
  const { opportunities } = useAppStore();
  const [activeFilter, setActiveFilter] = useState<OpportunityType | 'all'>('all');

  const filtered = activeFilter === 'all'
    ? opportunities
    : opportunities.filter((o) => o.type === activeFilter);

  const totalAvailable = opportunities.filter((o) => o.status === 'available').length;
  const totalPossiblePts = opportunities
    .filter((o) => o.status === 'available')
    .reduce((sum, o) => sum + o.pointsReward, 0);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Earn Points</Text>
          <Text style={styles.subtitle}>
            {totalAvailable} opportunities · up to {totalPossiblePts.toLocaleString()} pts available
          </Text>
        </View>
        <View style={styles.headerPoints}>
          <MaterialCommunityIcons name="star" size={16} color={Colors.points} />
          <Text style={styles.headerPointsText}>{totalPossiblePts.toLocaleString()}</Text>
        </View>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
      >
        {FILTERS.map((f) => {
          const active = f.value === activeFilter;
          return (
            <TouchableOpacity
              key={f.value}
              onPress={() => setActiveFilter(f.value)}
              style={[styles.filterChip, active && styles.filterChipActive]}
            >
              <Text style={[styles.filterText, active && styles.filterTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState title="No opportunities here" subtitle="Check back soon or try a different filter." />
        }
        renderItem={({ item: opp }) => {
          const oc     = OpportunityColors[opp.type];
          const status = STATUS_LABELS[opp.status];
          const isCompleted = opp.status === 'completed';

          return (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push(`/opportunity/${opp.id}`)}
              disabled={isCompleted}
            >
              <Card style={[styles.card, isCompleted && styles.cardCompleted]}>
                {/* Top row */}
                <View style={styles.cardHeader}>
                  <View style={[styles.iconWrap, { backgroundColor: oc.bg }]}>
                    <MaterialCommunityIcons name={opp.icon as any} size={24} color={isCompleted ? Colors.textMuted : oc.icon} />
                  </View>
                  <View style={styles.cardMeta}>
                    <Text style={styles.category}>{opp.category}</Text>
                    <Badge label={status.label} variant={status.variant} />
                  </View>
                </View>

                {/* Title + desc */}
                <Text style={[styles.cardTitle, isCompleted && styles.textMuted]}>{opp.title}</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>{opp.shortDescription}</Text>

                {/* Footer */}
                <View style={styles.cardFooter}>
                  <View style={styles.pointsPill}>
                    <MaterialCommunityIcons name="star" size={13} color={isCompleted ? Colors.textMuted : Colors.points} />
                    <Text style={[styles.pointsText, isCompleted && styles.textMuted]}>
                      {isCompleted ? 'Earned' : '+'}{opp.pointsReward.toLocaleString()} pts
                    </Text>
                  </View>
                  {opp.estimatedSavings > 0 && (
                    <View style={styles.savingsPill}>
                      <MaterialCommunityIcons name="currency-usd" size={13} color={Colors.success} />
                      <Text style={styles.savingsText}>${opp.estimatedSavings}/mo savings</Text>
                    </View>
                  )}
                  {opp.dueDate && opp.status === 'available' && (
                    <View style={styles.duePill}>
                      <MaterialCommunityIcons name="clock-outline" size={12} color={Colors.warning} />
                      <Text style={styles.dueText}>Due {new Date(opp.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
                    </View>
                  )}
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
  header:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  title:   { fontSize: 26, fontWeight: '800', color: Colors.text },
  subtitle:{ fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  headerPoints: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.pointsLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  headerPointsText: { fontSize: 14, fontWeight: '700', color: Colors.points },

  filters: { paddingHorizontal: 20, paddingBottom: 12, gap: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  filterTextActive: { color: Colors.white },

  list: { paddingHorizontal: 20, paddingBottom: 32, gap: 10 },

  card:          { padding: 16 },
  cardCompleted: { opacity: 0.65 },
  cardHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  iconWrap:      { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  cardMeta:      { alignItems: 'flex-end', gap: 4 },
  category:      { fontSize: 11, fontWeight: '600', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  cardTitle:     { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 6 },
  cardDesc:      { fontSize: 13, color: Colors.textSecondary, lineHeight: 19, marginBottom: 12 },
  textMuted:     { color: Colors.textMuted },

  cardFooter:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  pointsPill:  { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.pointsLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  pointsText:  { fontSize: 12, fontWeight: '700', color: Colors.points },
  savingsPill: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: Colors.successLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  savingsText: { fontSize: 12, fontWeight: '600', color: Colors.success },
  duePill:     { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: Colors.warningLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  dueText:     { fontSize: 12, fontWeight: '600', color: Colors.warning },
});
