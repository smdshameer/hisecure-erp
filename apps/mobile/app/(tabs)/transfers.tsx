import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Config from '../../constants/Config';
import { Ionicons } from '@expo/vector-icons';
import BranchSelector from '../../components/BranchSelector';
import BarcodeScanner from '../../components/BarcodeScanner';

interface Product {
    id: number;
    name: string;
    sku: string;
    stockQuantity: number; // Main warehouse stock
}

export default function TransfersScreen() {
    const { token, currentBranch } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [transferQuantities, setTransferQuantities] = useState<{ [key: number]: string }>({});
    const [submitting, setSubmitting] = useState(false);
    const [scanning, setScanning] = useState(false);

    useEffect(() => {
        if (token) {
            fetchProducts();
        }
    }, [token]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${Config.API_URL}/products`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProducts(response.data);
        } catch (error) {
            console.error('Failed to fetch products:', error);
            Alert.alert('Error', 'Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleTransfer = async (productId: number) => {
        const quantityStr = transferQuantities[productId];
        const quantity = parseInt(quantityStr);

        if (!quantity || quantity <= 0) {
            Alert.alert('Invalid Quantity', 'Please enter a valid quantity');
            return;
        }

        if (!currentBranch) {
            Alert.alert('Select Branch', 'Please select a target branch first');
            return;
        }

        try {
            setSubmitting(true);
            // Transfer from Main Warehouse (sourceBranchId: null) to Current Branch
            await axios.post(`${Config.API_URL}/transfers`, {
                sourceBranchId: null,
                targetBranchId: currentBranch.id,
                productId,
                quantity
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Alert.alert('Success', 'Stock transfer completed successfully');
            setTransferQuantities(prev => ({ ...prev, [productId]: '' }));
            fetchProducts(); // Refresh stock levels
        } catch (error: any) {
            console.error('Transfer failed:', error);
            Alert.alert('Transfer Failed', error.response?.data?.message || 'An error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderProductItem = ({ item }: { item: Product }) => (
        <View style={styles.productCard}>
            <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productSku}>SKU: {item.sku}</Text>
                <Text style={styles.stockLevel}>Main Warehouse Stock: {item.stockQuantity}</Text>
            </View>

            <View style={styles.transferAction}>
                <TextInput
                    style={styles.quantityInput}
                    placeholder="Qty"
                    keyboardType="numeric"
                    value={transferQuantities[item.id] || ''}
                    onChangeText={(text) => setTransferQuantities(prev => ({ ...prev, [item.id]: text }))}
                />
                <TouchableOpacity
                    style={[styles.transferButton, (!currentBranch || submitting) && styles.disabledButton]}
                    onPress={() => handleTransfer(item.id)}
                    disabled={!currentBranch || submitting}
                >
                    <Text style={styles.transferButtonText}>Get</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <BranchSelector />

            <View style={styles.header}>
                <Text style={styles.title}>Stock Request</Text>
                <Text style={styles.subtitle}>Request stock from Main Warehouse</Text>
            </View>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search products..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                <TouchableOpacity onPress={() => setScanning(true)} style={styles.scanButton}>
                    <Ionicons name="qr-code-outline" size={24} color="#007AFF" />
                </TouchableOpacity>
            </View>

            <BarcodeScanner
                visible={scanning}
                onClose={() => setScanning(false)}
                onScanned={(data) => setSearchQuery(data)}
            />

            {loading ? (
                <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={filteredProducts}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderProductItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No products found</Text>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        margin: 16,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: 44,
        fontSize: 16,
    },
    scanButton: {
        padding: 8,
    },
    listContent: {
        padding: 16,
        paddingTop: 0,
    },
    productCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    productSku: {
        fontSize: 12,
        color: '#666',
        marginBottom: 2,
    },
    stockLevel: {
        fontSize: 12,
        color: '#007AFF',
        fontWeight: '500',
    },
    transferAction: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 12,
    },
    quantityInput: {
        width: 50,
        height: 40,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 8,
        textAlign: 'center',
        marginRight: 8,
        backgroundColor: '#f9f9f9',
    },
    transferButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    transferButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    emptyText: {
        textAlign: 'center',
        color: '#666',
        marginTop: 40,
    },
});
