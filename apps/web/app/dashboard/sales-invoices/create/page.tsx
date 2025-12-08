'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../page.module.css';

export default function CreateSalesInvoicePage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        customerId: '',
        deliveryChallanIds: [] as number[],
        remarks: '',
        items: []
    });

    const [items, setItems] = useState([
        { productId: '', quantity: 1, price: 0, taxRate: 0, description: '' }
    ]);

    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    // In future: Fetch pending Delivery Challans for this customer to auto-fill

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

            const [resCustomers, resProducts] = await Promise.all([
                fetch(`${apiUrl}/customers`, { headers }),
                fetch(`${apiUrl}/products`, { headers })
            ]);

            if (resCustomers.ok) setCustomers(await resCustomers.json());
            if (resProducts.ok) setProducts(await resProducts.json());

        } catch (error) {
            console.error('Initial data fetch failed', error);
        }
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { productId: '', quantity: 1, price: 0, taxRate: 0, description: '' }]);
    };

    const removeItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const payload = {
                ...formData,
                customerId: Number(formData.customerId),
                items: items.map(i => ({
                    ...i,
                    productId: Number(i.productId),
                    quantity: Number(i.quantity),
                    price: Number(i.price),
                    taxRate: Number(i.taxRate)
                }))
            };

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/sales-invoices`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert('Invoice Created!');
                router.push('/dashboard/sales-invoices');
            } else {
                const err = await res.json();
                alert(`Error: ${err.message}`);
            }
        } catch (error) {
            console.error('Submit failed', error);
            alert('Failed to create invoice');
        }
    };

    return (
        <div className={styles.container}>
            <h1>Create Sales Invoice</h1>
            <form onSubmit={handleSubmit} className={styles.form} style={{ maxWidth: '800px', background: 'white', padding: '2rem', borderRadius: '8px' }}>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                        Customer:
                        <select
                            style={{ width: '100%', padding: '0.5rem' }}
                            required
                            value={formData.customerId}
                            onChange={e => setFormData({ ...formData, customerId: e.target.value })}
                        >
                            <option value="">Select Customer</option>
                            {customers.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </label>
                </div>

                <h3>Items</h3>
                {items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'flex-end' }}>
                        <div style={{ flex: 2 }}>
                            <label>Product</label>
                            <select
                                style={{ width: '100%', padding: '0.5rem' }}
                                required
                                value={item.productId}
                                onChange={e => handleItemChange(idx, 'productId', e.target.value)}
                            >
                                <option value="">Select Product</option>
                                {products.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label>Qty</label>
                            <input
                                style={{ width: '100%', padding: '0.5rem' }}
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label>Price</label>
                            <input
                                style={{ width: '100%', padding: '0.5rem' }}
                                type="number"
                                min="0"
                                value={item.price}
                                onChange={e => handleItemChange(idx, 'price', e.target.value)}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label>Tax %</label>
                            <input
                                style={{ width: '100%', padding: '0.5rem' }}
                                type="number"
                                min="0"
                                value={item.taxRate}
                                onChange={e => handleItemChange(idx, 'taxRate', e.target.value)}
                            />
                        </div>
                        <div style={{ alignSelf: 'center' }}>
                            <button type="button" onClick={() => removeItem(idx)} style={{ padding: '0.5rem', background: '#ff4d4f', color: 'white', border: 'none', borderRadius: '4px' }}>X</button>
                        </div>
                    </div>
                ))}
                <button type="button" onClick={addItem} style={{ padding: '0.5rem 1rem', marginBottom: '2rem' }}>+ Add Item</button>

                <div className={styles.actions}>
                    <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', background: 'var(--primary-color, #0070f3)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Generate Invoice</button>
                </div>

            </form>
        </div>
    );
}
