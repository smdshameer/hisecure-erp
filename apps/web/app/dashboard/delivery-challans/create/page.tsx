'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../page.module.css'; // Reuse basic styles or create new

export default function CreateDeliveryChallanPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        type: 'SO', // SO, TRANSFER, etc.
        fromWarehouseId: '',
        toWarehouseId: '', // Optional
        customerId: '', // Optional
        remarks: '',
        items: []
    });

    const [items, setItems] = useState([
        { productId: '', quantity: 1, unit: 'pcs', description: '' }
    ]);

    const [branches, setBranches] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

            const [resBranches, resCustomers, resProducts] = await Promise.all([
                fetch(`${apiUrl}/branches`, { headers }),
                fetch(`${apiUrl}/customers`, { headers }),
                fetch(`${apiUrl}/products`, { headers })
            ]);

            if (resBranches.ok) setBranches(await resBranches.json());
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
        setItems([...items, { productId: '', quantity: 1, unit: 'pcs', description: '' }]);
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
                fromWarehouseId: Number(formData.fromWarehouseId),
                toWarehouseId: formData.toWarehouseId ? Number(formData.toWarehouseId) : undefined,
                customerId: formData.customerId ? Number(formData.customerId) : undefined,
                items: items.map(i => ({
                    ...i,
                    productId: Number(i.productId),
                    quantity: Number(i.quantity)
                }))
            };

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/delivery-challans`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert('Delivery Challan Created!');
                router.push('/dashboard/delivery-challans');
            } else {
                const err = await res.json();
                alert(`Error: ${err.message}`);
            }
        } catch (error) {
            console.error('Submit failed', error);
            alert('Failed to create challan');
        }
    };

    return (
        <div className={styles.container}>
            <h1>Create Delivery Challan</h1>
            <form onSubmit={handleSubmit} className={styles.form}>

                <div className={styles.row}>
                    <label>
                        Type:
                        <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                            <option value="SO">Sales Order</option>
                            <option value="TRANSFER">Stock Transfer</option>
                        </select>
                    </label>

                    <label>
                        From Warehouse:
                        <select
                            required
                            value={formData.fromWarehouseId}
                            onChange={e => setFormData({ ...formData, fromWarehouseId: e.target.value })}
                        >
                            <option value="">Select Branch</option>
                            {branches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </label>
                </div>

                {formData.type === 'SO' ? (
                    <label>
                        Customer:
                        <select
                            value={formData.customerId}
                            onChange={e => setFormData({ ...formData, customerId: e.target.value })}
                        >
                            <option value="">Select Customer</option>
                            {customers.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </label>
                ) : (
                    <label>
                        To Warehouse:
                        <select
                            value={formData.toWarehouseId}
                            onChange={e => setFormData({ ...formData, toWarehouseId: e.target.value })}
                        >
                            <option value="">Select Branch</option>
                            {branches.filter((b: any) => String(b.id) !== formData.fromWarehouseId).map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </label>
                )}

                <label>
                    Remarks:
                    <textarea value={formData.remarks} onChange={e => setFormData({ ...formData, remarks: e.target.value })} />
                </label>

                <h3>Items</h3>
                {items.map((item, idx) => (
                    <div key={idx} className={styles.itemRow}>
                        <select
                            required
                            value={item.productId}
                            onChange={e => handleItemChange(idx, 'productId', e.target.value)}
                        >
                            <option value="">Select Product</option>
                            {products.map((p: any) => <option key={p.id} value={p.id}>{p.name} (Stock: {p.stockQuantity})</option>)}
                        </select>
                        <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                            placeholder="Qty"
                        />
                        <input
                            type="text"
                            value={item.description}
                            onChange={e => handleItemChange(idx, 'description', e.target.value)}
                            placeholder="Description"
                        />
                        <button type="button" onClick={() => removeItem(idx)}>Remove</button>
                    </div>
                ))}
                <button type="button" onClick={addItem}>Add Item</button>

                <div className={styles.actions}>
                    <button type="submit" className="btn btn-primary">Create Challan</button>
                </div>

            </form>
        </div>
    );
}
