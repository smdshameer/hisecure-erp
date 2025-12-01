import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import SyncService from '../../services/SyncService';
import { Ionicons } from '@expo/vector-icons';

export default function JobCompletionScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [notes, setNotes] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleSubmit = async () => {
        if (!notes) {
            Alert.alert('Error', 'Please add some notes about the job completion.');
            return;
        }

        setLoading(true);
        try {
            // Add to sync queue
            await SyncService.addToQueue({
                type: 'COMPLETE_JOB',
                payload: {
                    ticketId: id,
                    notes: notes,
                    photoUri: image,
                },
            });

            Alert.alert('Success', 'Job completion submitted (will sync when online).');
            router.back();
        } catch (error) {
            Alert.alert('Error', 'Failed to submit job completion.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Complete Job #{id}</Text>

            <Text style={styles.label}>Completion Notes</Text>
            <TextInput
                style={styles.input}
                multiline
                numberOfLines={4}
                placeholder="Describe the work done..."
                value={notes}
                onChangeText={setNotes}
            />

            <Text style={styles.label}>Photo Proof (Optional)</Text>
            <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                <Ionicons name="camera" size={24} color="#fff" />
                <Text style={styles.imageButtonText}>Take Photo</Text>
            </TouchableOpacity>

            {image && (
                <Image source={{ uri: image }} style={styles.previewImage} />
            )}

            <TouchableOpacity
                style={[styles.submitButton, loading && styles.disabledButton]}
                onPress={handleSubmit}
                disabled={loading}
            >
                <Text style={styles.submitButtonText}>{loading ? 'Submitting...' : 'Complete Job'}</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: '#555',
    },
    input: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        marginBottom: 20,
        textAlignVertical: 'top',
        minHeight: 100,
    },
    imageButton: {
        flexDirection: 'row',
        backgroundColor: '#4a90e2',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    imageButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 10,
    },
    previewImage: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginBottom: 20,
    },
    submitButton: {
        backgroundColor: '#2ecc71',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#95a5a6',
    },
    submitButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
