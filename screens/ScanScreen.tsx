import { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';

import { extractTextFromImage } from '../lib/visionApi';
import { parseReceiptText } from '../lib/receiptParser';

type ImageAsset = {
  uri: string;
  base64: string;
};

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  quality: 0.85,
  base64: true,
  allowsEditing: true,
  aspect: [3, 4],
};

export default function ScanScreen() {
  const [image, setImage] = useState<ImageAsset | null>(null);
  const [scanning, setScanning] = useState(false);

  async function requestAndLaunch(
    launcher: () => Promise<ImagePicker.ImagePickerResult>
  ) {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Camera access is needed to scan receipts.');
      return;
    }
    const result = await launcher();
    if (!result.canceled && result.assets[0].base64) {
      setImage({ uri: result.assets[0].uri, base64: result.assets[0].base64 });
    }
  }

  async function openCamera() {
    await requestAndLaunch(() =>
      ImagePicker.launchCameraAsync(PICKER_OPTIONS)
    );
  }

  async function openLibrary() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Photo library access is needed to select receipts.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);
    if (!result.canceled && result.assets[0].base64) {
      setImage({ uri: result.assets[0].uri, base64: result.assets[0].base64 });
    }
  }

  async function handleScan() {
    if (!image) return;
    setScanning(true);
    try {
      const rawText = await extractTextFromImage(image.base64);
      if (!rawText.trim()) {
        Alert.alert('No text found', 'Make sure the receipt is well-lit and in focus.');
        return;
      }
      const receiptData = await parseReceiptText(rawText);
      router.push({ pathname: '/split', params: { receiptData: JSON.stringify(receiptData) } });
    } catch (err: unknown) {
      Alert.alert('Scan failed', err instanceof Error ? err.message : 'Unknown error.');
    } finally {
      setScanning(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {!image ? (
        <>
          <View style={styles.placeholder}>
            <Text style={styles.placeholderIcon}>📄</Text>
            <Text style={styles.placeholderText}>No receipt selected</Text>
            <Text style={styles.placeholderSub}>
              Take a photo or choose one from your library
            </Text>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.pickButton} onPress={openCamera} activeOpacity={0.8}>
              <Text style={styles.pickButtonIcon}>📷</Text>
              <Text style={styles.pickButtonText}>Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.pickButton} onPress={openLibrary} activeOpacity={0.8}>
              <Text style={styles.pickButtonIcon}>🖼️</Text>
              <Text style={styles.pickButtonText}>Library</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <Image source={{ uri: image.uri }} style={styles.preview} resizeMode="contain" />

          <TouchableOpacity
            style={styles.retakeButton}
            onPress={() => setImage(null)}
            activeOpacity={0.7}
          >
            <Text style={styles.retakeText}>Retake / Choose different</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.scanButton, scanning && styles.scanButtonDisabled]}
            onPress={handleScan}
            disabled={scanning}
            activeOpacity={0.8}
          >
            {scanning ? (
              <View style={styles.scanningRow}>
                <ActivityIndicator color="#fff" style={{ marginRight: 10 }} />
                <Text style={styles.scanButtonText}>Scanning…</Text>
              </View>
            ) : (
              <Text style={styles.scanButtonText}>Scan Receipt</Text>
            )}
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    flexGrow: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    alignItems: 'center',
    marginBottom: 40,
  },
  placeholderIcon: {
    fontSize: 56,
    marginBottom: 12,
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  placeholderSub: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
  },
  pickButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  pickButtonIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  pickButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  preview: {
    width: '100%',
    height: 420,
    borderRadius: 14,
    backgroundColor: '#e5e7eb',
    marginBottom: 16,
  },
  retakeButton: {
    marginBottom: 16,
  },
  retakeText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '600',
  },
  scanButton: {
    width: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  scanButtonDisabled: {
    opacity: 0.6,
  },
  scanningRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
