'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Header from '../../../../components/Header';
import styles from '../sales.module.css';

interface Customer {
    id: number;
    name: string;
}

interface Product {
    id: number;
    name: string;
    price: number;
    stock: number;
}

interface SaleItem {
    productId: number;
    quantity: number;
    price: number;
    productName?: string;
}

export default function CreateSalePage() {
    const router = useRouter();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        customerId: '',
        paymentMethod: 'CASH',
        items: [] as SaleItem[],
    });

    const [currentItem, setCurrentItem] = useState({
        productId: '',
        quantity: 1,
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            const [customersRes, productsRes] = await Promise.all([
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/customers`, { headers }),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/products`, { headers })
            ]);
            setCustomers(customersRes.data);
            setProducts(productsRes.data);
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    const addItem = () => {
        if (!currentItem.productId) return;

        const product = products.find(p => p.id === Number(currentItem.productId));
        if (!product) return;

        const newItem: SaleItem = {
            productId: product.id,
            quantity: Number(currentItem.quantity),
            price: Number(product.price),
            productName: product.name
        };

        setFormData({
            ...formData,
            items: [...formData.items, newItem]
        });

        setCurrentItem({ productId: '', quantity: 1 });
    };

    const removeItem = (index: number) => {
        const newItems = [...formData.items];
        newItems.splice(index, 1);
        setFormData({ ...formData, items: newItems });
    };

    const calculateTotal = () => {
        return formData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.items.length === 0) {
            alert('Please add at least one item');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/sales`, {
                customerId: formData.customerId ? Number(formData.customerId) : undefined,
                paymentMethod: formData.paymentMethod,
                items: formData.items.map(({ productName, ...item }) => item)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            router.push('/dashboard/sales');
        } catch (error) {
            console.error('Failed to create sale', error);
            alert('Failed to create sale');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <>
            <Header title="Create New Invoice" />
            <div className={styles.container}>
                <div className={styles.formContainer} style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <form onSubmit={handleSubmit}>
                        <div className={styles.card} style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                                <div className={styles.formGroup}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Customer</label>
                                    <select
                                        className={styles.select}
                                        value={formData.customerId}
                                        onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                                    >
                                        <option value="">Select Customer (Optional)</option>
                                        {customers.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Payment Method</label>
                                    <select
                                        className={styles.select}
                                        value={formData.paymentMethod}
                                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                                    >
                                        <option value="CASH">Cash</option>
                                        <option value="CARD">Card</option>
                                        <option value="UPI">UPI</option>
                                        <option value="BANK_TRANSFER">Bank Transfer</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(0,0,0,0.05)', borderRadius: '8px' }}>
                                <h3 style={{ marginBottom: '1rem' }}>Add Items</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Product</label>
                                        <select
                                            value={currentItem.productId}
                                            onChange={(e) => setCurrentItem({ ...currentItem, productId: e.target.value })}
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                                        >
                                            <option value="">Select Product</option>
                                            {products.map(p => (
                                                <option key={p.id} value={p.id}>{p.name} (₹{p.price})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Quantity</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={currentItem.quantity}
                                            onChange={(e) => setCurrentItem({ ...currentItem, quantity: Number(e.target.value) })}
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addItem}
                                        style={{ padding: '0.75rem 1.5rem', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>

                            <div className={styles.tableContainer} style={{ marginBottom: '2rem' }}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Price</th>
                                            <th>Qty</th>
                                            <th>Total</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formData.items.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.productName}</td>
                                                <td>₹{item.price}</td>
                                                <td>{item.quantity}</td>
                                                <td>₹{item.price * item.quantity}</td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(index)}
                                                        style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                                                    >
                                                        Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {formData.items.length === 0 && (
                                            <tr>
                                                <td colSpan={5} style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-secondary)' }}>No items added</td>
                                            </tr>
                                        )}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan={3} style={{ textAlign: 'right', fontWeight: 'bold' }}>Grand Total:</td>
                                            <td colSpan={2} style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>₹{calculateTotal()}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button
                                    type="button"
                                    onClick={() => router.back()}
                                    style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{ padding: '0.75rem 1.5rem', background: 'var(--accent-color)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                                >
                                    Create Invoice
                                </button>
                            </div>

                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
