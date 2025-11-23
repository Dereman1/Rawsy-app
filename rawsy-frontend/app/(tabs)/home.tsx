import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Appbar, Card, Button, Surface, Chip } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function HomeScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();

  const quickActions = [
    { icon: 'inventory', label: 'Browse Products', screen: '/products' },
    { icon: 'shopping-cart', label: 'View Cart', screen: '/cart' },
    { icon: 'favorite', label: 'Wishlist', screen: '/wishlist' },
    { icon: 'receipt', label: 'Orders', screen: '/orders' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header elevated>
        <Appbar.Content title="Rawsy" />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        <Surface style={styles.welcomeCard} elevation={1}>
          <Text variant="headlineSmall" style={styles.welcomeTitle}>
            Welcome back, {user?.name}!
          </Text>
          <View style={styles.userInfo}>
            <Chip icon="account-circle" style={styles.roleChip}>
              {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
            </Chip>
            {user?.status && (
              <Chip
                icon={
                  user.status === 'approved' || user.status === 'active'
                    ? 'check-circle'
                    : user.status === 'pending'
                    ? 'clock'
                    : 'alert-circle'
                }
                style={[
                  styles.statusChip,
                  {
                    backgroundColor:
                      user.status === 'approved' || user.status === 'active'
                        ? '#d1fae5'
                        : user.status === 'pending'
                        ? '#fef3c7'
                        : '#fee2e2',
                  },
                ]}
              >
                {user.status}
              </Chip>
            )}
          </View>
        </Surface>

        {user?.role === 'supplier' && user?.status === 'pending' && (
          <Card style={styles.alertCard} mode="contained">
            <Card.Content>
              <View style={styles.alertHeader}>
                <MaterialIcons name="info" size={24} color="#f59e0b" />
                <Text variant="titleMedium" style={styles.alertTitle}>
                  Account Pending
                </Text>
              </View>
              <Text variant="bodyMedium" style={styles.alertText}>
                Your supplier account is awaiting admin approval. You will be notified once approved.
              </Text>
            </Card.Content>
          </Card>
        )}

        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Quick Actions
          </Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <Card
                key={index}
                style={styles.actionCard}
                onPress={() => {}}
              >
                <Card.Content style={styles.actionContent}>
                  <MaterialIcons
                    name={action.icon as any}
                    size={32}
                    color={theme.colors.primary}
                  />
                  <Text variant="bodyMedium" style={styles.actionLabel}>
                    {action.label}
                  </Text>
                </Card.Content>
              </Card>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Recent Activity
          </Text>
          <Card style={styles.activityCard}>
            <Card.Content>
              <Text variant="bodyMedium" style={styles.emptyText}>
                No recent activity
              </Text>
            </Card.Content>
          </Card>
        </View>

        {user?.role === 'supplier' && user?.status === 'approved' && (
          <View style={styles.section}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Supplier Dashboard
            </Text>
            <Card style={styles.dashboardCard}>
              <Card.Content>
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text variant="headlineMedium" style={styles.statValue}>
                      0
                    </Text>
                    <Text variant="bodySmall" style={styles.statLabel}>
                      Products
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text variant="headlineMedium" style={styles.statValue}>
                      0
                    </Text>
                    <Text variant="bodySmall" style={styles.statLabel}>
                      Orders
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text variant="headlineMedium" style={styles.statValue}>
                      0 ETB
                    </Text>
                    <Text variant="bodySmall" style={styles.statLabel}>
                      Revenue
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  welcomeCard: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
  },
  welcomeTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    gap: 8,
  },
  roleChip: {
    backgroundColor: '#dbeafe',
  },
  statusChip: {},
  alertCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#fffbeb',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  alertTitle: {
    fontWeight: '600',
    color: '#f59e0b',
  },
  alertText: {
    color: '#92400e',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '47%',
    minHeight: 100,
  },
  actionContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  actionLabel: {
    marginTop: 8,
    textAlign: 'center',
  },
  activityCard: {
    padding: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
  },
  dashboardCard: {
    padding: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontWeight: 'bold',
    color: '#2563eb',
  },
  statLabel: {
    color: '#666',
    marginTop: 4,
  },
});
