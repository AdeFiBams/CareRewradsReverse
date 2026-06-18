import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppStore } from '@/store/appStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/index';
import { Colors, OpportunityColors } from '@/constants/Colors';
import type { OpportunityStatus } from '@/types';

const STATUS_BADGE: Record<OpportunityStatus, { label: string; variant: any }> = {
  available:   { label: 'Available',   variant: 'primary' },
  in_progress: { label: 'In Progress', variant: 'warning' },
  completed:   { label: 'Completed',   variant: 'success' },
  missed:      { label: 'Missed',      variant: 'neutral' },
};

export default function OpportunityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { opportunities, completeOpportunity } = useAppStore();
  const [completing, setCompleting] = useState(false);

  const opp = opportunities.find((o) => o.id === id);

  if (!opp) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Opportunity not found.</Text>
          <Button label="Go Back" onPress={() => router.back()} variant="outline" />
        </View>
      </SafeAreaView>
    );
  }

  const oc        = OpportunityColors[opp.type];
  const status    = STATUS_BADGE[opp.status];
  const isActionable = opp.status === 'available' || opp.status === 'in_progress';

  const handleComplete = async () => {
    if (!isActionable) return;
    setCompleting(true);
    await new Promise((r) => setTimeout(r, 900)); // simulate API call
    completeOpportunity(opp.id);
    setCompleting(false);
    Alert.alert(
      '🎉 Points Earned!',
      `You earned ${opp.pointsReward.toLocaleString()} points for completing "${opp.title}".`,
      [{ text: 'Awesome!', onPress: () => router.back() }],
    );
  };

  const handleDoctorNote = () => {
    Alert.alert(
      'Generate Doctor Note',
      'This will create a personalised note for your doctor requesting this medication substitution. You can send it via email or your patient portal.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Generate Note',
          onPress: () => Alert.alert('Note Generated', 'Your doctor note has been created and saved. You can find it under Quick Actions on the dashboard.'),
        },
      ],
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: opp.category,
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.primary,
          headerTitleStyle: { fontSize: 15, fontWeight: '600', color: Colors.text },
          headerShadowVisible: false,
        }}
      />
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Hero */}
          <View style={[styles.hero, { backgroundColor: oc.bg }]}>
            <View style={[styles.heroIcon, { backgroundColor: oc.icon + '22' }]}>
              <MaterialCommunityIcons name={opp.icon as any} size={40} color={oc.icon} />
            </View>
            <View style={styles.heroMeta}>
              <Badge label={status.label} variant={status.variant} />
              {opp.type !== 'specialist' && (
                <Text style={styles.heroCategory}>{opp.category}</Text>
              )}
            </View>
          </View>

          {/* Title + description */}
          <View style={styles.section}>
            <Text style={styles.title}>{opp.title}</Text>
            <Text style={styles.description}>{opp.fullDescription}</Text>
          </View>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: Colors.pointsLight }]}>
              <MaterialCommunityIcons name="star" size={22} color={Colors.points} />
              <Text style={[styles.statValue, { color: Colors.points }]}>
                {opp.status === 'completed' ? '✓' : '+'}{opp.pointsReward.toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>{opp.status === 'completed' ? 'Points Earned' : 'Points Reward'}</Text>
            </View>

            {opp.estimatedSavings > 0 && (
              <View style={[styles.statCard, { backgroundColor: Colors.successLight }]}>
                <MaterialCommunityIcons name="currency-usd" size={22} color={Colors.success} />
                <Text style={[styles.statValue, { color: Colors.success }]}>
                  ${opp.estimatedSavings}
                </Text>
                <Text style={styles.statLabel}>Monthly Savings</Text>
              </View>
            )}

            {opp.dueDate && opp.status !== 'completed' && (
              <View style={[styles.statCard, { backgroundColor: Colors.warningLight }]}>
                <MaterialCommunityIcons name="calendar-clock" size={22} color={Colors.warning} />
                <Text style={[styles.statValue, { color: Colors.warning }]}>
                  {new Date(opp.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Text>
                <Text style={styles.statLabel}>Due Date</Text>
              </View>
            )}
          </View>

          {/* Steps */}
          <Card style={styles.stepsCard}>
            <Text style={styles.stepsTitle}>How to complete this</Text>
            {opp.steps.map((step, idx) => (
              <View key={idx} style={styles.stepRow}>
                <View style={[
                  styles.stepNum,
                  opp.status === 'completed' && styles.stepNumDone,
                ]}>
                  {opp.status === 'completed' ? (
                    <MaterialCommunityIcons name="check" size={13} color={Colors.white} />
                  ) : (
                    <Text style={styles.stepNumText}>{idx + 1}</Text>
                  )}
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </Card>

          {/* Annual savings projection */}
          {opp.estimatedSavings > 0 && (
            <View style={styles.savingsCallout}>
              <MaterialCommunityIcons name="trending-up" size={20} color={Colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.savingsTitle}>Annual Savings Potential</Text>
                <Text style={styles.savingsDesc}>
                  At ${opp.estimatedSavings}/month, you could save{' '}
                  <Text style={{ fontWeight: '800', color: Colors.primary }}>
                    ${(opp.estimatedSavings * 12).toLocaleString()}
                  </Text>{' '}
                  per year on this medication alone.
                </Text>
              </View>
            </View>
          )}

          {/* Doctor note button (for medication type) */}
          {opp.type === 'medication' && opp.status !== 'completed' && (
            <TouchableOpacity style={styles.doctorNoteBtn} onPress={handleDoctorNote}>
              <View style={styles.doctorNoteLeft}>
                <MaterialCommunityIcons name="file-document-edit-outline" size={22} color={Colors.info} />
                <View>
                  <Text style={styles.doctorNoteTitle}>Generate Doctor Note</Text>
                  <Text style={styles.doctorNoteSub}>AI-written request for your provider</Text>
                </View>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* CTA */}
        {isActionable && (
          <View style={styles.cta}>
            <Button
              label={opp.status === 'in_progress' ? 'Mark as Completed' : `Complete & Earn ${opp.pointsReward.toLocaleString()} pts`}
              onPress={handleComplete}
              loading={completing}
              fullWidth
              size="lg"
              style={styles.ctaBtn}
            />
          </View>
        )}

        {opp.status === 'completed' && (
          <View style={styles.cta}>
            <View style={styles.completedBanner}>
              <MaterialCommunityIcons name="check-circle" size={22} color={Colors.success} />
              <Text style={styles.completedText}>Completed · {opp.pointsReward.toLocaleString()} pts earned</Text>
            </View>
          </View>
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe:     { flex: 1, backgroundColor: Colors.background },
  scroll:   { paddingBottom: 32 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  notFoundText: { fontSize: 16, color: Colors.textSecondary },

  hero:     { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 24, gap: 16 },
  heroIcon: { width: 88, height: 88, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  heroMeta: { alignItems: 'center', gap: 6 },
  heroCategory: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },

  section:     { paddingHorizontal: 20, paddingVertical: 16 },
  title:       { fontSize: 22, fontWeight: '800', color: Colors.text, marginBottom: 10, lineHeight: 28 },
  description: { fontSize: 15, color: Colors.textSecondary, lineHeight: 23 },

  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginBottom: 16 },
  statCard: { flex: 1, borderRadius: 14, padding: 14, alignItems: 'center', gap: 4 },
  statValue:{ fontSize: 20, fontWeight: '800' },
  statLabel:{ fontSize: 11, color: Colors.textSecondary, fontWeight: '500', textAlign: 'center' },

  stepsCard:  { marginHorizontal: 20, padding: 16, marginBottom: 14 },
  stepsTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 14 },
  stepRow:    { flexDirection: 'row', gap: 12, marginBottom: 14, alignItems: 'flex-start' },
  stepNum:    { width: 26, height: 26, borderRadius: 999, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 },
  stepNumDone:{ backgroundColor: Colors.success },
  stepNumText:{ fontSize: 12, fontWeight: '800', color: Colors.white },
  stepText:   { flex: 1, fontSize: 14, color: Colors.text, lineHeight: 21 },

  savingsCallout: { flexDirection: 'row', gap: 12, marginHorizontal: 20, backgroundColor: Colors.primaryPale, borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: Colors.primaryLight, alignItems: 'flex-start' },
  savingsTitle:   { fontSize: 14, fontWeight: '700', color: Colors.primaryDark, marginBottom: 4 },
  savingsDesc:    { fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },

  doctorNoteBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 20, backgroundColor: Colors.infoLight, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: Colors.infoLight },
  doctorNoteLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  doctorNoteTitle:{ fontSize: 14, fontWeight: '700', color: Colors.info },
  doctorNoteSub:  { fontSize: 12, color: Colors.textSecondary },

  cta:      { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.surface, paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1, borderTopColor: Colors.border },
  ctaBtn:   { borderRadius: 16 },

  completedBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: Colors.successLight, borderRadius: 14, paddingVertical: 14 },
  completedText:   { fontSize: 15, fontWeight: '700', color: Colors.success },
});
