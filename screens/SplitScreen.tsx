import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ScanStackParamList, ReceiptItem } from '../types';

type Props = NativeStackScreenProps<ScanStackParamList, 'Split'>;

function LineItem({ item }: { item: ReceiptItem }) {
  return (
    <View style={styles.lineItem}>
      <Text style={styles.lineItemName} numberOfLines={2}>{item.name}</Text>
      <Text style={styles.lineItemPrice}>${item.price.toFixed(2)}</Text>
    </View>
  );
}

function TotalRow({ label, amount, bold }: { label: string; amount: number; bold?: boolean }) {
  return (
    <View style={styles.totalRow}>
      <Text style={[styles.totalLabel, bold && styles.bold]}>{label}</Text>
      <Text style={[styles.totalAmount, bold && styles.bold]}>${amount.toFixed(2)}</Text>
    </View>
  );
}

export default function SplitScreen({ route }: Props) {
  const { receiptData } = route.params;
  const { items, subtotal, tax, tip, total } = receiptData;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Items */}
        <Text style={styles.sectionTitle}>Items</Text>
        <View style={styles.card}>
          {items.length === 0 ? (
            <Text style={styles.empty}>No items detected.</Text>
          ) : (
            items.map((item, idx) => <LineItem key={idx} item={item} />)
          )}
        </View>

        {/* Totals */}
        <Text style={styles.sectionTitle}>Summary</Text>
        <View style={styles.card}>
          <TotalRow label="Subtotal" amount={subtotal} />
          <TotalRow label="Tax" amount={tax} />
          <TotalRow label="Tip" amount={tip} />
          <View style={styles.divider} />
          <TotalRow label="Total" amount={total} bold />
        </View>

        {/* TODO: split assignment UI */}
        <Text style={styles.sectionTitle}>Split between</Text>
        <View style={[styles.card, styles.todoCard]}>
          <Text style={styles.todoText}>
            ✦ Split assignment UI coming soon.{'\n'}
            Assign items or divide total equally among group members.
          </Text>
        </View>
      </ScrollView>

      {/* CTA */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.confirmButton} activeOpacity={0.8}>
          <Text style={styles.confirmText}>Confirm & Save Expense</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scroll: {
    padding: 20,
    paddingBottom: 120,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 20,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  lineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f3f4f6',
  },
  lineItemName: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    marginRight: 12,
  },
  lineItemPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  totalLabel: {
    fontSize: 15,
    color: '#374151',
  },
  totalAmount: {
    fontSize: 15,
    color: '#374151',
  },
  bold: {
    fontWeight: '700',
    fontSize: 16,
    color: '#111827',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e5e7eb',
    marginVertical: 8,
  },
  empty: {
    color: '#9ca3af',
    textAlign: 'center',
    paddingVertical: 8,
  },
  todoCard: {
    backgroundColor: '#ede9fe',
  },
  todoText: {
    color: '#5b21b6',
    fontSize: 14,
    lineHeight: 22,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#f9fafb',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e7eb',
  },
  confirmButton: {
    backgroundColor: '#6366f1',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
