import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import {
  Text,
  Button,
  Appbar,
  Surface,
  Chip,
  IconButton,
  ActivityIndicator,
  Card,
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import api from '../services/api';

export default function UploadVerificationScreen() {
  const { user, refreshUser } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();

  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/me');
      const userData = response.data.profile;
      setDocuments(userData.verificationDocs || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadDocument(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant access to photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadDocument(result.assets[0]);
    }
  };

  const uploadDocument = async (file: any) => {
    try {
      setUploading(true);

      const formData = new FormData();
      const fileToUpload: any = {
        uri: file.uri,
        type: file.mimeType || 'image/jpeg',
        name: file.name || `doc_${Date.now()}.jpg`,
      };

      formData.append('file', fileToUpload);
      formData.append('type', 'business_doc');

      await api.post('/auth/me/upload-doc', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert('Success', 'Document uploaded successfully');
      await fetchDocuments();
      await refreshUser();
    } catch (error: any) {
      console.error('Upload error:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return '#10b981';
      case 'rejected':
        return '#ef4444';
      default:
        return '#f59e0b';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Under Review';
    }
  };

  if (user?.role !== 'supplier') {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Appbar.Header elevated>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Verification Documents" />
        </Appbar.Header>
        <View style={styles.centeredContainer}>
          <Text variant="titleMedium">This feature is only available for suppliers</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Verification Documents" />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        <Surface style={[styles.infoSection, { backgroundColor: theme.colors.primaryContainer }]} elevation={1}>
          <Text variant="titleMedium" style={[styles.infoTitle, { color: theme.colors.onPrimaryContainer }]}>
            Document Verification
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onPrimaryContainer, lineHeight: 20 }}>
            Upload business license, tax documents, or identification to verify your supplier account.
            Admin will review and approve your documents.
          </Text>
        </Surface>

        <View style={styles.uploadSection}>
          <Button
            mode="contained"
            icon="camera"
            onPress={pickImage}
            disabled={uploading}
            style={styles.uploadButton}
          >
            Upload Image
          </Button>
          <Button
            mode="outlined"
            icon="file-document"
            onPress={pickDocument}
            disabled={uploading}
            style={styles.uploadButton}
          >
            Upload Document
          </Button>
        </View>

        {uploading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text variant="bodyMedium" style={{ marginTop: 8 }}>Uploading...</Text>
          </View>
        )}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : documents.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              No documents uploaded
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
              Upload your business documents to get verified
            </Text>
          </View>
        ) : (
          <View style={styles.documentsSection}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Uploaded Documents
            </Text>

            {documents.map((doc, index) => (
              <Card key={index} style={styles.documentCard}>
                <Card.Content>
                  <View style={styles.documentHeader}>
                    <View style={styles.documentInfo}>
                      <Text variant="titleSmall">Document {index + 1}</Text>
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        {doc.type || 'Business Document'}
                      </Text>
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <Chip
                      style={{ backgroundColor: getStatusColor(doc.status) }}
                      textStyle={{ color: '#fff' }}
                    >
                      {getStatusLabel(doc.status)}
                    </Chip>
                  </View>

                  {doc.url && doc.url.includes('image') && (
                    <Image source={{ uri: doc.url }} style={styles.documentPreview} />
                  )}
                </Card.Content>
              </Card>
            ))}
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
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  infoSection: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  infoTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  uploadSection: {
    padding: 16,
    gap: 12,
  },
  uploadButton: {
    paddingVertical: 8,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  documentsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  documentCard: {
    marginBottom: 12,
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  documentInfo: {
    flex: 1,
    marginRight: 12,
  },
  documentPreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 12,
    resizeMode: 'cover',
  },
});
