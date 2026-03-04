import { useLocalSearchParams } from 'expo-router';
import SplitScreen from '../screens/SplitScreen';
import type { ReceiptData, ScanStackParamList } from '../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

// expo-router passes all params as strings; receiptData arrives JSON-stringified.
// We parse it here and reconstruct the route prop shape that SplitScreen expects,
// so screens/SplitScreen.tsx needs zero changes.

type SplitScreenProps = NativeStackScreenProps<ScanStackParamList, 'Split'>;

export default function SplitRoute() {
  const { receiptData: receiptDataJson } = useLocalSearchParams<{ receiptData: string }>();

  const receiptData: ReceiptData = receiptDataJson
    ? (JSON.parse(receiptDataJson) as ReceiptData)
    : { items: [], subtotal: 0, tax: 0, tip: 0, total: 0 };

  // Construct a minimal route object matching NativeStackScreenProps
  const route = {
    key: 'split',
    name: 'Split' as const,
    params: { receiptData },
  } satisfies SplitScreenProps['route'];

  return <SplitScreen route={route} navigation={null as unknown as SplitScreenProps['navigation']} />;
}
