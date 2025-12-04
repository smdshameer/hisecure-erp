'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '../../../../components/Header';
import styles from '../purchase-orders.module.css';

interface Supplier {
    id: number;
    name: string;
}

interface Product {
    id: number;
    name: string;
    sku: string;
    costPrice: string;
}

interface POItem {
    productId: number;
    quantity: number;
    unitCost: number;
}

export default function CreatePurchaseOrderPage() {
    const router = useRouter();
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const [supplierId, setSupplierId] = useState<number | ''>('');
    const [items, setItems] = useState<POItem[]>([{ productId: 0, quantity: 1, unitCost: 0 }]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [suppliersRes, productsRes] = await Promise.all([
                axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/suppliers`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/products`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setSuppliers(suppliersRes.data);
            setProducts(productsRes.data);
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleItemChange = (index: number, field: keyof POItem, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };

        // Auto-fill cost price if product changes
        if (field === 'productId') {
            const product = products.find(p => p.id === Number(value));
            if (product) {
                newItems[index].unitCost = Number(product.costPrice);
            }
        }

        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { productId: 0, quantity: 1, unitCost: 0 }]);
    };

    const removeItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/purchase-orders`, {
                supplierId: Number(supplierId),
                items: items.map(item => ({
                    productId: Number(item.productId),
                    quantity: Number(item.quantity),
                    unitCost: Number(item.unitCost)
                }))
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            router.push('/dashboard/purchase-orders');
        } catch (error) {
            console.error('Failed to create PO', error);
            alert('Failed to create PO');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <>
            <Header title="Create Purchase Order" />
            <div className={styles.container}>
                <form onSubmit={handleSubmit} className={styles.formContainer}>
                    <div className={styles.formGroup}>
                        <label>Supplier</label>
                        <h3>Order Items</h3>
                        {items.map((item, index) => (
                            <div key={index} className={styles.itemRow}>
                                <div className={styles.formGroup}>
                                    <label>Product</label>
                                    <select
                                        required
                                        value={item.productId}
                                        onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                                    >
                                        <option value={0}>Select Product</option>
                                        {products.map(p => (
                                            <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Quantity</label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        value={item.quantity}
                                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Unit Cost</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        required
                                        value={item.unitCost}
                                        onChange={(e) => handleItemChange(index, 'unitCost', e.target.value)}
                                    />
                                </div>
                                {items.length > 1 && (
                                    <button type="button" className={styles.removeBtn} onClick={() => removeItem(index)}>
                                        X
                                    </button>
                                )}
                            </div>
                        ))}
                        <button type="button" className={styles.addItemBtn} onClick={addItem}>
                            + Add Item
                        </button>
                    </div>

                    <div className={styles.formActions}>
                        <Link href="/dashboard/purchase-orders" className={styles.cancelBtn}>Cancel</Link>
                        <button type="submit" className={styles.submitBtn}>Create Order</button>
                    </div>
                </form>
            </div>
        </>
    );
}
