import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Text,
  Appbar,
  List,
  Avatar,
  Divider,
  Switch,
  Button,
  Surface,
} from 'react-native-paper';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';

export default function AccountScreen() {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header elevated>
        <Appbar.Content title="Account" />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        <Surface style={styles.profileSection} elevation={1}>
          <Avatar.Text
            size={80}
            label={user?.name?.charAt(0).toUpperCase() || 'U'}
            style={styles.avatar}
          />
          <Text variant="headlineSmall" style={styles.userName}>
            {user?.name}
          </Text>
          <Text variant="bodyMedium" style={styles.userRole}>
            {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
          </Text>
          {user?.status && (
            <Text
              variant="bodySmall"
              style={[
                styles.userStatus,
                {
                  color:
                    user.status === 'approved' || user.status === 'active'
                      ? '#10b981'
                      : user.status === 'pending'
                      ? '#f59e0b'
                      : '#dc2626',
                },
              ]}
            >
              Status: {user.status}
            </Text>
          )}
        </Surface>

        <List.Section>
          <List.Subheader>Account Information</List.Subheader>
          {user?.email && (
            <List.Item
              title="Email"
              description={user.email}
              left={(props) => <List.Icon {...props} icon="email" />}
            />
          )}
          {user?.phone && (
            <List.Item
              title="Phone"
              description={user.phone}
              left={(props) => <List.Icon {...props} icon="phone" />}
            />
          )}
          {user?.companyName && (
            <List.Item
              title="Company"
              description={user.companyName}
              left={(props) => <List.Icon {...props} icon="domain" />}
            />
          )}
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>Preferences</List.Subheader>
          <List.Item
            title="Dark Mode"
            description={isDarkMode ? 'Enabled' : 'Disabled'}
            left={(props) => (
              <List.Icon {...props} icon={isDarkMode ? 'weather-night' : 'weather-sunny'} />
            )}
            right={() => <Switch value={isDarkMode} onValueChange={toggleTheme} />}
          />
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>Actions</List.Subheader>
          <List.Item
            title="Orders"
            description="View your order history"
            left={(props) => <List.Icon {...props} icon="package-variant" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {}}
          />
          <List.Item
            title="Wishlist"
            description="View saved products"
            left={(props) => <List.Icon {...props} icon="heart" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {}}
          />
          {user?.role === 'supplier' && (
            <List.Item
              title="My Products"
              description="Manage your products"
              left={(props) => <List.Icon {...props} icon="package" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {}}
            />
          )}
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>Support</List.Subheader>
          <List.Item
            title="Help & Support"
            left={(props) => <List.Icon {...props} icon="help-circle" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {}}
          />
          <List.Item
            title="About"
            left={(props) => <List.Icon {...props} icon="information" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {}}
          />
        </List.Section>

        <View style={styles.logoutSection}>
          <Button
            mode="contained"
            onPress={handleLogout}
            buttonColor={theme.colors.error}
            style={styles.logoutButton}
            icon="logout"
          >
            Logout
          </Button>
        </View>
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
  profileSection: {
    alignItems: 'center',
    padding: 24,
    margin: 16,
    borderRadius: 12,
  },
  avatar: {
    marginBottom: 16,
  },
  userName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userRole: {
    color: '#666',
    marginBottom: 8,
  },
  userStatus: {
    fontWeight: '600',
  },
  logoutSection: {
    padding: 16,
    marginTop: 8,
    marginBottom: 32,
  },
  logoutButton: {
    paddingVertical: 8,
  },
});
