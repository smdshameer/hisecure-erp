import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Modal, TouchableOpacity } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';

interface BarcodeScannerProps {
    visible: boolean;
    onClose: () => void;
    onScanned: (data: string) => void;
}

export default function BarcodeScanner({ visible, onClose, onScanned }: BarcodeScannerProps) {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        if (visible) {
            setScanned(false);
        }
    }, [visible]);

    if (!permission) {
        // Camera permissions are still loading.
        return <View />;
    }

    if (!permission.granted) {
        return (
            <Modal visible={visible} animationType="slide">
                <View style={styles.container}>
                    <Text style={styles.message}>We need your permission to show the camera</Text>
                    <Button onPress={requestPermission} title="grant permission" />
                    <Button onPress={onClose} title="Cancel" />
                </View>
            </Modal>
        );
    }

    const handleBarCodeScanned = ({ data }: { data: string }) => {
        if (scanned) return;
        setScanned(true);
        onScanned(data);
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide">
            <View style={styles.container}>
                <CameraView
                    style={styles.camera}
                    facing="back"
                    onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                >
                    <View style={styles.overlay}>
                        <View style={styles.scanArea} />
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Text style={styles.closeButtonText}>Close Camera</Text>
                        </TouchableOpacity>
                    </View>
                </CameraView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
    },
    camera: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanArea: {
        width: 250,
        height: 250,
        borderWidth: 2,
        borderColor: '#fff',
        backgroundColor: 'transparent',
    },
    closeButton: {
        position: 'absolute',
        bottom: 50,
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
    },
    closeButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
});
