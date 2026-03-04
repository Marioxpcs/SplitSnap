import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useExpensesStore, useAuthStore } from '../store';
import type { Expense } from '../types';

function ExpenseRow({ item }: { item: Expense }) {
  const currentUser = useAuthStore((s) => s.currentUser);
  const isPayer = item.paidBy === currentUser?.id;

  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Text style={styles.rowDescription} numberOfLines={1}>
          {item.description}
        </Text>
        <Text style={styles.rowDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.rowRight}>
        <Text style={[styles.rowAmount, isPayer ? styles.positive : styles.negative]}>
          {isPayer ? '+' : '-'}${item.totalAmount.toFixed(2)}
        </Text>
        <Text style={styles.rowRole}>{isPayer ? 'you paid' : 'you owe'}</Text>
      </View>
    </View>
  );
}

export default function HistoryScreen() {
  const expenses = useExpensesStore((s) => s.expenses);
  const sorted = [...expenses].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <View style={styles.container}>
      {sorted.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No expenses yet</Text>
          <Text style={styles.emptySubtitle}>
            Add an expense to a group to see it here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ExpenseRow item={item} />}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  list: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  rowLeft: {
    flex: 1,
    marginRight: 12,
  },
  rowDescription: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  rowDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  rowRight: {
    alignItems: 'flex-end',
  },
  rowAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  rowRole: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
  positive: {
    color: '#16a34a',
  },
  negative: {
    color: '#dc2626',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
