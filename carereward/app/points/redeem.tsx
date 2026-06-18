import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppStore } from '@/store/appStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/index';
import { Colors } from '@/constants/Colors';
import type { RedemptionOption } from '@/types';

const ICON_COLORS: Record<string, string> = {
  premium_reduction: Colors.primary,
  copay_credit:      Colors.info,
  deductible_credit: Colors.success,
  gift_card:         Colors.points,
  hsa_contribution:  Colors.warning,
};

export default function RedeemScreen() {
  const router = useRouter();
  const { points, redemptionOptions, redeemPoints } = useAppStore();

  const [selectedOption, setSelectedOption] = useState<RedemptionOption | null>(null);
  const [amount, setAmount]   = useState('');
  const [step, setStep]       = useState<'select' | 'amount' | 'confirm'>('select');
  const [submitting, setSubmitting] = useState(false);

  const parsedAmount  = parseInt(amount, 10) || 0;
  const dollarValue   = selectedOption ? parsedAmount / selectedOption.conversionRate : 0;
  const canAfford     = parsedAmount <= points.balance && parsedAmount >= (selectedOption?.minPoints ?? 0);

  const handleSelectOption = (opt: RedemptionOption) => {
    setSelectedOption(opt);
    setAmount(String(opt.minPoints));
    setStep('amount');
  };

  const handleConfirm = async () => {
    if (!selectedOption || !canAfford) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    redeemPoints(parsedAmount, selectedOption.id);
    setSubmitting(false);
    Alert.alert(
      '✅ Redemption Submitted',
      `You redeemed ${parsedAmount.toLocaleString()} points for $${dollarValue.toFixed(2)} ${selectedOption.label}. It will be applied within 1–3 business days.`,
      [{ text: 'Done', onPress: () => router.back() }],
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Redeem Points',
          presentation: 'modal',
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.primary,
          headerTitleStyle: { fontSize: 15, fontWeight: '600', color: Colors.text },
          headerShadowVisible: false,
        }}
      />
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Balance pill */}
          <View style={styles.balancePill}>
            <MaterialCommunityIcons name="star-circle" size={18} color={Colors.points} />
            <Text style={styles.balanceText}>{points.balance.toLocaleString()} points available</Text>
          </View>

          {/* Step 1 — Select option */}
          {step === 'select' && (
            <>
              <Text style={styles.stepTitle}>How would you like to redeem?</Text>
              <Text style={styles.stepSub}>100 points = $1 value on all redemption types</Text>
              {redemptionOptions.map((opt) => {
                const color = ICON_COLORS[opt.type] ?? Colors.primary;
                const affordable = points.balance >= opt.minPoints;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    activeOpacity={affordable ? 0.8 : 1}
                    onPress={() => affordable && handleSelectOption(opt)}
                  >
                    <Card style={[styles.optionCard, !affordable && styles.optionDisabled]}>
                      <View style={styles.optionRow}>
                        <View style={[styles.optionIcon, { backgroundColor: color + '22' }]}>
                          <MaterialCommunityIcons name={opt.icon as any} size={26} color={affordable ? color : Colors.textMuted} />
                        </View>
                        <View style={styles.optionContent}>
                          <Text style={[styles.optionLabel, !affordable && styles.textMuted]}>{opt.label}</Text>
                          <Text style={styles.optionDesc}>{opt.description}</Text>
                          <Text style={[styles.optionMin, !affordable && styles.textMuted]}>
                            Min: {opt.minPoints.toLocaleString()} pts (${(opt.minPoints / opt.conversionRate).toFixed(0)})
                          </Text>
                        </View>
                        <MaterialCommunityIcons
                          name="chevron-right"
                          size={20}
                          color={affordable ? Colors.textMuted : Colors.gray200}
                        />
                      </View>
                      {!affordable && (
                        <View style={styles.lockedRow}>
                          <MaterialCommunityIcons name="lock-outline" size={12} color={Colors.textMuted} />
                          <Text style={styles.lockedText}>
                            Need {(opt.minPoints - points.balance).toLocaleString()} more points to unlock
                          </Text>
                        </View>
                      )}
                    </Card>
                  </TouchableOpacity>
                );
              })}
            </>
          )}

          {/* Step 2 — Choose amount */}
          {step === 'amount' && selectedOption && (
            <>
              <TouchableOpacity style={styles.backRow} onPress={() => setStep('select')}>
                <MaterialCommunityIcons name="arrow-left" size={18} color={Colors.primary} />
                <Text style={styles.backText}>Change option</Text>
              </TouchableOpacity>

              <Text style={styles.stepTitle}>{selectedOption.label}</Text>
              <Text style={styles.stepSub}>{selectedOption.description}</Text>

              <Card style={styles.amountCard}>
                <Text style={styles.amountLabel}>How many points to redeem?</Text>

                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="star" size={20} color={Colors.points} />
                  <TextInput
                    style={styles.amountInput}
                    value={amount}
                    onChangeText={(v) => setAmount(v.replace(/[^0-9]/g, ''))}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor={Colors.textMuted}
                  />
                  <Text style={styles.inputPts}>pts</Text>
                </View>

                {parsedAmount > 0 && (
                  <View style={styles.conversionRow}>
                    <MaterialCommunityIcons name="approximately-equal" size={16} color={Colors.textSecondary} />
                    <Text style={styles.conversionText}>
                      = <Text style={{ fontWeight: '800', color: Colors.primary }}>${dollarValue.toFixed(2)}</Text> value
                    </Text>
                  </View>
                )}

                {/* Quick select buttons */}
                <Text style={styles.quickLabel}>Quick select</Text>
                <View style={styles.quickRow}>
                  {[500, 1000, 1500, 2000].map((qty) => {
                    const enabled = qty <= points.balance;
                    return (
                      <TouchableOpacity
                        key={qty}
                        style={[styles.quickBtn, !enabled && styles.quickBtnDisabled,
                          parseInt(amount) === qty && styles.quickBtnActive]}
                        onPress={() => enabled && setAmount(String(qty))}
                      >
                        <Text style={[
                          styles.quickBtnText,
                          !enabled && styles.textMuted,
                          parseInt(amount) === qty && styles.quickBtnTextActive,
                        ]}>
                          {qty.toLocaleString()}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {parsedAmount > points.balance && (
                  <View style={styles.errorRow}>
                    <MaterialCommunityIcons name="alert-circle-outline" size={14} color={Colors.danger} />
                    <Text style={styles.errorText}>You only have {points.balance.toLocaleString()} points available.</Text>
                  </View>
                )}
                {parsedAmount > 0 && parsedAmount < selectedOption.minPoints && (
                  <View style={styles.errorRow}>
                    <MaterialCommunityIcons name="alert-circle-outline" size={14} color={Colors.warning} />
                    <Text style={[styles.errorText, { color: Colors.warning }]}>
                      Minimum is {selectedOption.minPoints.toLocaleString()} points for this option.
                    </Text>
                  </View>
                )}
              </Card>

              <Button
                label={`Continue → Redeem ${parsedAmount > 0 ? parsedAmount.toLocaleString() : '...'} pts`}
                onPress={() => canAfford && setStep('confirm')}
                disabled={!canAfford || parsedAmount === 0}
                fullWidth
                size="lg"
                style={styles.ctaBtn}
              />
            </>
          )}

          {/* Step 3 — Confirm */}
          {step === 'confirm' && selectedOption && (
            <>
              <TouchableOpacity style={styles.backRow} onPress={() => setStep('amount')}>
                <MaterialCommunityIcons name="arrow-left" size={18} color={Colors.primary} />
                <Text style={styles.backText}>Change amount</Text>
              </TouchableOpacity>

              <Text style={styles.stepTitle}>Confirm Redemption</Text>
              <Text style={styles.stepSub}>Review your redemption before submitting.</Text>

              <Card style={styles.confirmCard} elevated>
                <View style={styles.confirmRow}>
                  <Text style={styles.confirmLabel}>Redemption type</Text>
                  <Text style={styles.confirmValue}>{selectedOption.label}</Text>
                </View>
                <Divider />
                <View style={styles.confirmRow}>
                  <Text style={styles.confirmLabel}>Points to redeem</Text>
                  <View style={styles.confirmPoints}>
                    <MaterialCommunityIcons name="star" size={14} color={Colors.points} />
                    <Text style={[styles.confirmValue, { color: Colors.points }]}>
                      {parsedAmount.toLocaleString()} pts
                    </Text>
                  </View>
                </View>
                <Divider />
                <View style={styles.confirmRow}>
                  <Text style={styles.confirmLabel}>Dollar value</Text>
                  <Text style={[styles.confirmValue, { color: Colors.success, fontSize: 20, fontWeight: '800' }]}>
                    ${dollarValue.toFixed(2)}
                  </Text>
                </View>
                <Divider />
                <View style={styles.confirmRow}>
                  <Text style={styles.confirmLabel}>Remaining balance</Text>
                  <Text style={styles.confirmValue}>
                    {(points.balance - parsedAmount).toLocaleString()} pts
                  </Text>
                </View>
              </Card>

              <View style={styles.processingNote}>
                <MaterialCommunityIcons name="clock-outline" size={14} color={Colors.textSecondary} />
                <Text style={styles.processingText}>
                  Redemptions are processed within 1–3 business days and applied to your next billing cycle.
                </Text>
              </View>

              <Button
                label="Confirm & Redeem"
                onPress={handleConfirm}
                loading={submitting}
                fullWidth
                size="lg"
                style={styles.ctaBtn}
              />

              <Button
                label="Cancel"
                onPress={() => router.back()}
                variant="ghost"
                fullWidth
                style={{ marginTop: 8 }}
              />
            </>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 20 },

  balancePill: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: Colors.pointsLight, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8, alignSelf: 'center', marginBottom: 24 },
  balanceText: { fontSize: 14, fontWeight: '700', color: Colors.points },

  stepTitle: { fontSize: 22, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  stepSub:   { fontSize: 14, color: Colors.textSecondary, marginBottom: 20, lineHeight: 20 },

  optionCard:     { marginBottom: 12, padding: 16 },
  optionDisabled: { opacity: 0.55 },
  optionRow:      { flexDirection: 'row', alignItems: 'center', gap: 14 },
  optionIcon:     { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  optionContent:  { flex: 1 },
  optionLabel:    { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  optionDesc:     { fontSize: 13, color: Colors.textSecondary, marginBottom: 4 },
  optionMin:      { fontSize: 12, fontWeight: '600', color: Colors.primary },
  lockedRow:      { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.border },
  lockedText:     { fontSize: 12, color: Colors.textMuted },
  textMuted:      { color: Colors.textMuted },

  backRow:  { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  backText: { fontSize: 14, fontWeight: '600', color: Colors.primary },

  amountCard:     { padding: 20, marginBottom: 20 },
  amountLabel:    { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 14 },
  inputWrapper:   { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.gray50, borderRadius: 14, borderWidth: 1.5, borderColor: Colors.primary, padding: 14 },
  amountInput:    { flex: 1, fontSize: 28, fontWeight: '800', color: Colors.text },
  inputPts:       { fontSize: 16, color: Colors.textMuted, fontWeight: '600' },
  conversionRow:  { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, backgroundColor: Colors.primaryPale, borderRadius: 10, padding: 10 },
  conversionText: { fontSize: 15, color: Colors.textSecondary },
  quickLabel:     { fontSize: 13, fontWeight: '600', color: Colors.textMuted, marginTop: 16, marginBottom: 8 },
  quickRow:       { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  quickBtn:       { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 999, backgroundColor: Colors.gray100, borderWidth: 1, borderColor: Colors.border },
  quickBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  quickBtnDisabled:{ opacity: 0.4 },
  quickBtnText:   { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  quickBtnTextActive: { color: Colors.white },
  errorRow:       { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  errorText:      { fontSize: 13, color: Colors.danger },

  confirmCard: { padding: 16, marginBottom: 16 },
  confirmRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
  confirmLabel:{ fontSize: 14, color: Colors.textSecondary },
  confirmValue:{ fontSize: 15, fontWeight: '700', color: Colors.text },
  confirmPoints:{ flexDirection: 'row', alignItems: 'center', gap: 4 },

  processingNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: Colors.gray50, borderRadius: 12, padding: 12, marginBottom: 20, borderWidth: 1, borderColor: Colors.border },
  processingText: { flex: 1, fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },

  ctaBtn: { borderRadius: 16 },
});
