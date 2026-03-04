// NOTE: ScanScreen internally calls navigation.navigate('Split', { receiptData }).
// That API targets a named screen in a react-navigation stack, but in expo-router
// 'split' lives in the root modal stack — outside the Tabs navigator — so
// useNavigation() from inside a tab can't reach it directly.
//
// When you're ready to wire up the Scan → Split flow, make this one change
// in screens/ScanScreen.tsx:
//
//   Replace:
//     navigation.navigate('Split', { receiptData });
//
//   With:
//     import { router } from 'expo-router';
//     router.push({ pathname: '/split', params: { receiptData: JSON.stringify(receiptData) } });

import ScanScreen from '../../screens/ScanScreen';

export default ScanScreen;
