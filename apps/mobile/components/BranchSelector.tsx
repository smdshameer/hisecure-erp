import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Config from '../constants/Config';
import { Ionicons } from '@expo/vector-icons';

interface Branch {
    id: number;
    name: string;
    location: string;
}

export default function BranchSelector() {
    const { currentBranch, setCurrentBranch, token } = useAuth();
    const [branches, setBranches] = useState<Branch[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (token) {
            fetchBranches();
        }
    }, [token]);

    const fetchBranches = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${Config.API_URL}/branches`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBranches(response.data);

            // Set default branch if none selected and branches exist
            if (!currentBranch && response.data.length > 0) {
                // Ideally, user profile should have a default branch, but for now we pick the first one or Main Warehouse if logic permits
                // setCurrentBranch(response.data[0]); 
            }
        } catch (error) {
            console.error('Failed to fetch branches:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectBranch = (branch: Branch | null) => {
        setCurrentBranch(branch);
        setModalVisible(false);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.selector} onPress={() => setModalVisible(true)}>
                <Ionicons name="business-outline" size={20} color="#333" />
                <Text style={styles.selectorText}>
                    {currentBranch ? currentBranch.name : 'Select Branch (Main Warehouse)'}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#666" />
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Branch</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        {loading ? (
                            <ActivityIndicator size="large" color="#007AFF" />
                        ) : (
                            <FlatList
                                data={[{ id: 0, name: 'Main Warehouse', location: 'HQ' }, ...branches]}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[
                                            styles.branchItem,
                                            (currentBranch?.id === item.id || (!currentBranch && item.id === 0)) && styles.selectedBranch
                                        ]}
                                        onPress={() => handleSelectBranch(item.id === 0 ? null : item)}
                                    >
                                        <View>
                                            <Text style={styles.branchName}>{item.name}</Text>
                                            <Text style={styles.branchLocation}>{item.location}</Text>
                                        </View>
                                        {(currentBranch?.id === item.id || (!currentBranch && item.id === 0)) && (
                                            <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
                                        )}
                                    </TouchableOpacity>
                                )}
                            />
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    selector: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
    },
    selectorText: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    branchItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    selectedBranch: {
        backgroundColor: '#f0f9ff',
    },
    branchName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    branchLocation: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
});
