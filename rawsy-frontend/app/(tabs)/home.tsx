import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';

export default function HomeScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Welcome, {user?.name}!
      </Text>
      <Text variant="bodyLarge" style={styles.subtitle}>
        Role: {user?.role}
      </Text>
      <Text variant="bodyMedium" style={styles.status}>
        Status: {user?.status}
      </Text>

      {user?.role === 'supplier' && user?.status === 'pending' && (
        <Text variant="bodyMedium" style={styles.info}>
          Your supplier account is pending approval from admin.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    marginBottom: 10,
    fontWeight: 'bold',
  },
  subtitle: {
    marginBottom: 5,
    textTransform: 'capitalize',
  },
  status: {
    marginBottom: 20,
    color: '#666',
  },
  info: {
    textAlign: 'center',
    color: '#f59e0b',
    marginTop: 20,
  },
});
