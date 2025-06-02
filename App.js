// // QRScanner.js
// import React, { useEffect, useState } from 'react';
// import { View, Text, PermissionsAndroid, Platform, StyleSheet, Alert } from 'react-native';
// import { ModernQRScanner } from 'react-native-modern-qrscanner';

// const QRScanner = () => {
//   const [hasPermission, setHasPermission] = useState(false);
//   const [scannedText, setScannedText] = useState('');

//   useEffect(() => {
//     async function requestPermission() {
//       if (Platform.OS === 'android') {
//         const granted = await PermissionsAndroid.request(
//           PermissionsAndroid.PERMISSIONS.CAMERA,
//           {
//             title: 'Camera Permission',
//             message: 'This app needs access to your camera to scan QR codes.',
//             buttonNeutral: 'Ask Me Later',
//             buttonNegative: 'Cancel',
//             buttonPositive: 'OK',
//           }
//         );
//         setHasPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
//       } else {
//         setHasPermission(true);
//       }
//     }

//     requestPermission();
//   }, []);

//   const handleScan = (data) => {
//     if (data && data !== scannedText) {
//       setScannedText(data);
//       Alert.alert('Scanned QR Code', data);
//     }
//   };

//   if (!hasPermission) {
//     return (
//       <View style={styles.center}>
//         <Text>Requesting camera permission...</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <ModernQRScanner
//         style={styles.scanner}
//         onRead={handleScan}
//         frameColor="green"
//         laserColor="red"
//         borderRadius={10}
//       />
//       <View style={styles.footer}>
//         <Text style={styles.resultText}>Result: {scannedText || 'Scan a QR code'}</Text>
//       </View>
//     </View>
//   );
// };

// export default QRScanner;

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   scanner: {
//     flex: 1,
//   },
//   footer: {
//     padding: 20,
//     backgroundColor: '#f0f0f0',
//   },
//   resultText: {
//     fontSize: 16,
//     textAlign: 'center',
//   },
//   center: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
// });
