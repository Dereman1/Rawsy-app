import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Appbar, Card, Button, Surface, Chip } from "react-native-paper";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function HomeScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();

  const quickActions = [
    { icon: "inventory", label: "Browse Products", screen: "/products" },
    { icon: "shopping-cart", label: "View Cart", screen: "/cart" },
    { icon: "favorite", label: "Wishlist", screen: "/wishlist" },
    { icon: "request-quote", label: "Quotes", screen: "/quotes" },
  ];

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Appbar.Header elevated style={{ backgroundColor: theme.colors.surface }}>
        <Appbar.Content
          title="Rawsy"
          titleStyle={{ color: theme.colors.onSurface }}
        />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        {/* ========== Welcome Card ========== */}
        <Surface
          style={[
            styles.welcomeCard,
            { backgroundColor: theme.colors.surface },
          ]}
          elevation={1}
        >
          <Text
            variant="headlineSmall"
            style={[styles.welcomeTitle, { color: theme.colors.onSurface }]}
          >
            Welcome back, {user?.name}!
          </Text>

          <View style={styles.userInfo}>
            <Chip
  icon="account-circle"
  style={[styles.roleChip, { backgroundColor: theme.colors.primaryContainer }]}
  textStyle={{ color: theme.colors.onPrimaryContainer }}
>
  {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''}
</Chip>


            {user?.status && (
              <Chip
                icon={
                  user.status === "approved" || user.status === "active"
                    ? "check-circle"
                    : user.status === "pending"
                    ? "clock"
                    : "alert-circle"
                }
                style={[
                  styles.statusChip,
                  {
                    backgroundColor:
                      user.status === "approved" || user.status === "active"
                        ? "#d1fae5"
                        : user.status === "pending"
                        ? "#fef3c7"
                        : "#fee2e2",
                  },
                ]}
              >
                {user.status}
              </Chip>
            )}
          </View>
        </Surface>

        {/* ========== Supplier Pending Alert ========== */}
        {user?.role === "supplier" && user?.status === "pending" && (
          <Card
            style={[
              styles.alertCard,
              { backgroundColor: theme.colors.surfaceVariant },
            ]}
            mode="contained"
          >
            <Card.Content>
              <View style={styles.alertHeader}>
                <MaterialIcons
                  name="info"
                  size={24}
                  color={theme.colors.tertiary}
                />
                <Text
                  variant="titleMedium"
                  style={[styles.alertTitle, { color: theme.colors.tertiary }]}
                >
                  Account Pending
                </Text>
              </View>

              <Text
                variant="bodyMedium"
                style={[styles.alertText, { color: theme.colors.onSurface }]}
              >
                Your supplier account is awaiting admin approval. You will be
                notified once approved.
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* ========== Quick Actions ========== */}
        <View style={styles.section}>
          <Text
            variant="titleLarge"
            style={[
              styles.sectionTitle,
              { color: theme.colors.onBackground },
            ]}
          >
            Quick Actions
          </Text>

          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <Card
                key={index}
                style={[
                  styles.actionCard,
                  { backgroundColor: theme.colors.surface },
                ]}
                onPress={() => router.push(action.screen as any)}
              >
                <Card.Content style={styles.actionContent}>
                  <MaterialIcons
                    name={action.icon as any}
                    size={32}
                    color={theme.colors.primary}
                  />
                  <Text
                    variant="bodyMedium"
                    style={[
                      styles.actionLabel,
                      { color: theme.colors.onSurface },
                    ]}
                  >
                    {action.label}
                  </Text>
                </Card.Content>
              </Card>
            ))}
          </View>
        </View>

        {/* ========== Recent Activity ========== */}
        <View style={styles.section}>
          <Text
            variant="titleLarge"
            style={[
              styles.sectionTitle,
              { color: theme.colors.onBackground },
            ]}
          >
            Recent Activity
          </Text>

          <Card
            style={[
              styles.activityCard,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Card.Content>
              <Text
                variant="bodyMedium"
                style={[styles.emptyText, { color: theme.colors.onSurface }]}
              >
                No recent activity
              </Text>
            </Card.Content>
          </Card>
        </View>

        {/* ========== Supplier Dashboard ========== */}
        {user?.role === "supplier" && user?.status === "approved" && (
          <View style={styles.section}>
            <Text
              variant="titleLarge"
              style={[
                styles.sectionTitle,
                { color: theme.colors.onBackground },
              ]}
            >
              Supplier Dashboard
            </Text>

            <Card
              style={[
                styles.dashboardCard,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <Card.Content>
                <View style={styles.statsRow}>
                  {[
                    { label: "Products", value: "0" },
                    { label: "Orders", value: "0" },
                    { label: "Revenue", value: "0 ETB" },
                  ].map((item, i) => (
                    <View key={i} style={styles.statItem}>
                      <Text
                        variant="headlineSmall"
                        style={[
                          styles.statValue,
                          { color: theme.colors.primary },
                        ]}
                      >
                        {item.value}
                      </Text>
                      <Text
                        variant="bodySmall"
                        style={[
                          styles.statLabel,
                          { color: theme.colors.onSurface },
                        ]}
                      >
                        {item.label}
                      </Text>
                    </View>
                  ))}
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
  container: { flex: 1 },
  content: { flex: 1 },

  welcomeCard: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
  },
  welcomeTitle: { fontWeight: "bold", marginBottom: 12 },

  userInfo: { flexDirection: "row", gap: 8 },
  roleChip: {},
  statusChip: {},

  alertCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  alertHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  alertTitle: { fontWeight: "600" },
  alertText: {},

  section: { padding: 16 },
  sectionTitle: { fontWeight: "bold", marginBottom: 12 },

  actionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  actionCard: { width: "47%", minHeight: 100 },
  actionContent: { alignItems: "center", justifyContent: "center", padding: 8 },
  actionLabel: { textAlign: "center", marginTop: 8 },

  activityCard: { padding: 12 },
  emptyText: { textAlign: "center" },

  dashboardCard: { padding: 8 },
  statsRow: { flexDirection: "row", justifyContent: "space-around" },
  statItem: { alignItems: "center" },
  statValue: { fontWeight: "bold" },
  statLabel: { marginTop: 4 },
});
