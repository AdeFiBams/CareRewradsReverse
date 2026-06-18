import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppStore } from '@/store/appStore';
import { Card } from '@/components/ui/Card';
import { Badge, Divider } from '@/components/ui/index';
import { Colors, ClaimStatusColors } from '@/constants/Colors';

function fmt(n: number) {
  return n === 0 ? '$0.00' : `$${n.toFixed(2)}`;
}

const STATUS_VARIANTS: Record<string, any> = {
  processed: 'success', pending: 'warning', denied: 'danger', in_review: 'info',
};

function LineItem({ label, value, bold, color, indent }: {
  label: string; value: string; bold?: boolean; color?: string; indent?: boolean;
}) {
  return (
    <View style={[lineStyles.row, indent && lineStyles.indented]}>
      <Text style={[lineStyles.label, bold && lineStyles.bold, color ? { color } : null]}>{label}</Text>
      <Text style={[lineStyles.value, bold && lineStyles.bold, color ? { color } : null]}>{value}</Text>
    </View>
  );
}

const lineStyles = StyleSheet.create({
  row:      { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7 },
  indented: { paddingLeft: 12 },
  label:    { fontSize: 14, color: Colors.textSecondary },
  value:    { fontSize: 14, color: Colors.text, fontWeight: '500' },
  bold:     { fontWeight: '700', color: Colors.text, fontSize: 15 },
});

export default function ClaimDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { claims } = useAppStore();

  const claim = claims.find((c) => c.id === id);

  if (!claim) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Claim not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const sc = ClaimStatusColors[claim.status];
  const adjustment = claim.planAllowed - claim.billedAmount;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Claim Detail',
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.primary,
          headerTitleStyle: { fontSize: 15, fontWeight: '600', color: Colors.text },
          headerShadowVisible: false,
          headerRight: () => (
            <TouchableOpacity
              style={{ paddingHorizontal: 4 }}
              onPress={() => Alert.alert('Download EOB', 'Your Explanation of Benefits PDF has been saved to your downloads.')}
            >
              <MaterialCommunityIcons name="download-outline" size={22} color={Colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Header card */}
          <Card style={styles.headerCard} elevated>
            <View style={styles.providerRow}>
              <View style={styles.providerIcon}>
                <MaterialCommunityIcons name="hospital-building" size={24} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.providerName}>{claim.providerName}</Text>
                <Text style={styles.providerType}>{claim.providerType}</Text>
              </View>
              <Badge label={claim.status.replace('_', ' ')} variant={STATUS_VARIANTS[claim.status]} />
            </View>

            <Divider style={{ marginVertical: 14 }} />

            <Text style={styles.serviceDesc}>{claim.serviceDescription}</Text>
            <View style={styles.dateRow}>
              <MaterialCommunityIcons name="calendar-outline" size={14} color={Colors.textMuted} />
              <Text style={styles.dateText}>
                Service: {new Date(claim.serviceDate).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
              </Text>
            </View>
            <View style={styles.dateRow}>
              <MaterialCommunityIcons name="clock-check-outline" size={14} color={Colors.textMuted} />
              <Text style={styles.dateText}>
                Processed: {new Date(claim.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </Text>
            </View>

            <View style={styles.claimNumRow}>
              <MaterialCommunityIcons name="pound" size={14} color={Colors.textMuted} />
              <Text style={styles.claimNum}>{claim.claimNumber}</Text>
            </View>
          </Card>

          {/* Cost summary visual */}
          <View style={styles.costSummaryRow}>
            <View style={styles.costBox}>
              <Text style={styles.costValue}>{fmt(claim.billedAmount)}</Text>
              <Text style={styles.costLabel}>Billed</Text>
            </View>
            <MaterialCommunityIcons name="arrow-right" size={18} color={Colors.textMuted} />
            <View style={[styles.costBox, { backgroundColor: Colors.primaryPale }]}>
              <Text style={[styles.costValue, { color: Colors.primary }]}>{fmt(claim.insurancePaid)}</Text>
              <Text style={styles.costLabel}>Plan Paid</Text>
            </View>
            <MaterialCommunityIcons name="arrow-right" size={18} color={Colors.textMuted} />
            <View style={[styles.costBox, {
              backgroundColor: claim.patientResponsibility > 0 ? Colors.warningLight : Colors.successLight,
            }]}>
              <Text style={[styles.costValue, {
                color: claim.patientResponsibility > 0 ? Colors.warning : Colors.success,
              }]}>
                {fmt(claim.patientResponsibility)}
              </Text>
              <Text style={styles.costLabel}>Your Cost</Text>
            </View>
          </View>

          {/* Explanation of Benefits breakdown */}
          <Card style={styles.eobCard}>
            <Text style={styles.cardTitle}>Explanation of Benefits</Text>

            <LineItem label="Billed Amount"           value={fmt(claim.billedAmount)} />
            {adjustment < 0 && (
              <LineItem label="Plan Discount"         value={fmt(adjustment)}             color={Colors.success} indent />
            )}
            <LineItem label="Plan Allowed Amount"     value={fmt(claim.planAllowed)} />

            <Divider style={{ marginVertical: 8 }} />

            {claim.deductibleApplied > 0 && (
              <LineItem label="Deductible Applied"    value={fmt(claim.deductibleApplied)} color={Colors.warning} indent />
            )}
            {claim.copayApplied > 0 && (
              <LineItem label="Copay Applied"         value={fmt(claim.copayApplied)}       color={Colors.warning} indent />
            )}
            {claim.coinsuranceApplied > 0 && (
              <LineItem label="Coinsurance Applied"   value={fmt(claim.coinsuranceApplied)} color={Colors.warning} indent />
            )}

            <Divider style={{ marginVertical: 8 }} />

            <LineItem label="Insurance Paid"          value={fmt(claim.insurancePaid)}         color={Colors.primary} />
            <LineItem label="Your Responsibility"     value={fmt(claim.patientResponsibility)}  bold
              color={claim.patientResponsibility > 0 ? Colors.text : Colors.success} />
          </Card>

          {/* Diagnosis codes (if present) */}
          {claim.diagnosisCodes && claim.diagnosisCodes.length > 0 && (
            <Card style={styles.diagCard}>
              <Text style={styles.cardTitle}>Diagnosis Codes</Text>
              <View style={styles.diagRow}>
                {claim.diagnosisCodes.map((code) => (
                  <View key={code} style={styles.diagPill}>
                    <MaterialCommunityIcons name="medical-bag" size={13} color={Colors.primary} />
                    <Text style={styles.diagText}>{code}</Text>
                  </View>
                ))}
              </View>
            </Card>
          )}

          {/* Appeal / dispute callout */}
          {claim.status === 'denied' && (
            <TouchableOpacity
              style={styles.appealBanner}
              onPress={() => Alert.alert('File Appeal', 'Contact member services at 1-800-555-0199 to begin the appeals process for this claim.')}
            >
              <MaterialCommunityIcons name="alert-circle-outline" size={20} color={Colors.danger} />
              <View style={{ flex: 1 }}>
                <Text style={styles.appealTitle}>This claim was denied</Text>
                <Text style={styles.appealSub}>Tap here to learn about the appeals process</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={18} color={Colors.danger} />
            </TouchableOpacity>
          )}

          {/* Download EOB */}
          <TouchableOpacity
            style={styles.downloadBtn}
            onPress={() => Alert.alert('Download EOB', 'Your Explanation of Benefits PDF has been saved.')}
          >
            <MaterialCommunityIcons name="file-pdf-box" size={22} color={Colors.primary} />
            <Text style={styles.downloadText}>Download EOB as PDF</Text>
            <MaterialCommunityIcons name="download-outline" size={18} color={Colors.primary} />
          </TouchableOpacity>

          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe:     { flex: 1, backgroundColor: Colors.background },
  scroll:   { padding: 20 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  notFoundText: { fontSize: 16, color: Colors.textSecondary },

  headerCard: { padding: 16, marginBottom: 14 },
  providerRow:  { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  providerIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: Colors.primaryPale, alignItems: 'center', justifyContent: 'center' },
  providerName: { fontSize: 16, fontWeight: '700', color: Colors.text, flex: 1 },
  providerType: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  serviceDesc:  { fontSize: 14, color: Colors.text, fontWeight: '500', marginBottom: 8, lineHeight: 20 },
  dateRow:      { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  dateText:     { fontSize: 12, color: Colors.textSecondary },
  claimNumRow:  { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  claimNum:     { fontSize: 12, color: Colors.textMuted, fontFamily: 'monospace' },

  costSummaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, backgroundColor: Colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.border },
  costBox:  { flex: 1, alignItems: 'center', borderRadius: 12, padding: 10, backgroundColor: Colors.gray50 },
  costValue:{ fontSize: 16, fontWeight: '800', color: Colors.text },
  costLabel:{ fontSize: 10, color: Colors.textMuted, fontWeight: '500', marginTop: 3 },

  eobCard:   { padding: 16, marginBottom: 14 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 10 },

  diagCard: { padding: 16, marginBottom: 14 },
  diagRow:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  diagPill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.primaryPale, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  diagText: { fontSize: 13, fontWeight: '600', color: Colors.primaryDark },

  appealBanner: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.dangerLight, borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: Colors.dangerLight },
  appealTitle:  { fontSize: 14, fontWeight: '700', color: Colors.danger },
  appealSub:    { fontSize: 12, color: Colors.textSecondary },

  downloadBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 14, borderWidth: 1.5, borderColor: Colors.primary, paddingVertical: 14, backgroundColor: Colors.primaryPale },
  downloadText: { fontSize: 15, fontWeight: '700', color: Colors.primary, flex: 1, textAlign: 'center' },
});
