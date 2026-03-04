import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAuthStore, useBalancesStore } from '../store';

export default function HomeScreen() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const balances = useBalancesStore((s) => s.balances);

  const owedToMe = balances
    .filter((b) => b.toUserId === currentUser?.id)
    .reduce((sum, b) => sum + b.amount, 0);

  const iOwe = balances
    .filter((b) => b.fromUserId === currentUser?.id)
    .reduce((sum, b) => sum + b.amount, 0);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.summaryCard}>
        <Text style={styles.greeting}>
          Hi{currentUser ? `, ${currentUser.displayName}` : ''}!
        </Text>
        <View style={styles.balanceRow}>
          <View style={styles.balanceItem}>
            <Text style={styles.balanceLabel}>You are owed</Text>
            <Text style={[styles.balanceAmount, styles.positive]}>
              ${owedToMe.toFixed(2)}
            </Text>
          </View>
          <View style={styles.balanceItem}>
            <Text style={styles.balanceLabel}>You owe</Text>
            <Text style={[styles.balanceAmount, styles.negative]}>
              ${iOwe.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Recent Activity</Text>
      <Text style={styles.placeholder}>No recent activity yet.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 16,
  },
  summaryCard: {
    backgroundColor: '#6366f1',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  greeting: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceItem: {
    flex: 1,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  positive: {
    color: '#86efac',
  },
  negative: {
    color: '#fca5a5',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  placeholder: {
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 40,
  },
});
