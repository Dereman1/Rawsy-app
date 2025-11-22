import { View, StyleSheet } from 'react-native';
import { Text, Button, Avatar } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <Avatar.Text
        size={80}
        label={user?.name?.charAt(0).toUpperCase() || 'U'}
        style={styles.avatar}
      />

      <Text variant="headlineSmall" style={styles.name}>
        {user?.name}
      </Text>

      <View style={styles.infoContainer}>
        {user?.email && (
          <Text variant="bodyMedium" style={styles.info}>
            Email: {user.email}
          </Text>
        )}
        {user?.phone && (
          <Text variant="bodyMedium" style={styles.info}>
            Phone: {user.phone}
          </Text>
        )}
        <Text variant="bodyMedium" style={styles.info}>
          Role: {user?.role}
        </Text>
        <Text variant="bodyMedium" style={styles.info}>
          Status: {user?.status}
        </Text>
      </View>

      <Button
        mode="contained"
        onPress={handleLogout}
        style={styles.button}
        buttonColor="#dc2626"
      >
        Logout
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  avatar: {
    marginBottom: 20,
  },
  name: {
    fontWeight: 'bold',
    marginBottom: 20,
  },
  infoContainer: {
    width: '100%',
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginBottom: 30,
  },
  info: {
    marginBottom: 10,
  },
  button: {
    width: '100%',
    paddingVertical: 8,
  },
});
