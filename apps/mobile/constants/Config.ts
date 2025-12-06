import { Platform } from 'react-native';

// Use 10.0.2.2 for Android Emulator to access localhost
// Use localhost for iOS Simulator
// Use your machine's IP address for physical devices
const API_URL = Platform.select({
    android: 'http://10.0.2.2:4000',
    ios: 'http://localhost:4000',
    default: 'http://localhost:4000',
});

export default {
    API_URL,
};
