'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../page.module.css';

export default function CreateQuotationPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        customerId: '',
        validityDate: '',
        remarks: '',
    });
    const [items, setItems] = useState([{ productId: '', quantity: 1, unitPrice: 0 }]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
            const [cRes, pRes] = await Promise.all([
                fetch(`${apiUrl}/customers`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${apiUrl}/products`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            if (cRes.ok) setCustomers(await cRes.json());
            if (pRes.ok) setProducts(await pRes.json());
        } catch (error) {
            console.error('Fetch failed', error);
        }
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };

        // Auto-fill price when product selected
        if (field === 'productId') {
            const product = products.find(p => p.id === Number(value));
            if (product) {
                newItems[index].unitPrice = Number(product.price);
            }
        }

        setItems(newItems);
    };

    const addItem = () => setItems([...items, { productId: '', quantity: 1, unitPrice: 0 }]);
    const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const payload = {
                customerId: Number(formData.customerId),
                validityDate: formData.validityDate || undefined,
                remarks: formData.remarks,
                items: items.map(i => ({
                    productId: Number(i.productId),
                    quantity: Number(i.quantity),
                    unitPrice: Number(i.unitPrice),
                }))
            };

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/quotations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const result = await res.json();
                alert('Quotation created!');
                router.push(`/dashboard/quotations/${result.id}`);
            } else {
                const err = await res.json();
                alert(`Error: ${err.message}`);
            }
        } catch (error) {
            console.error('Submit failed', error);
        }
    };

    return (
        <div className={styles.container}>
            <h1>Create Quotation</h1>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label>Customer:
                        <select required value={formData.customerId} onChange={e => setFormData({ ...formData, customerId: e.target.value })}>
                            <option value="">Select Customer</option>
                            {customers.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </label>
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>Valid Until:
                        <input type="date" value={formData.validityDate} onChange={e => setFormData({ ...formData, validityDate: e.target.value })} />
                    </label>
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>Remarks:
                        <textarea value={formData.remarks} onChange={e => setFormData({ ...formData, remarks: e.target.value })} />
                    </label>
                </div>

                <h3>Items</h3>
                {items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                        <select required value={item.productId} onChange={e => handleItemChange(idx, 'productId', e.target.value)}>
                            <option value="">Select Product</option>
                            {products.map((p: any) => <option key={p.id} value={p.id}>{p.name} - ₹{p.price}</option>)}
                        </select>
                        <input type="number" min="1" value={item.quantity} onChange={e => handleItemChange(idx, 'quantity', e.target.value)} placeholder="Qty" style={{ width: '80px' }} />
                        <input type="number" step="0.01" value={item.unitPrice} onChange={e => handleItemChange(idx, 'unitPrice', e.target.value)} placeholder="Price" style={{ width: '100px' }} />
                        <button type="button" onClick={() => removeItem(idx)}>Remove</button>
                    </div>
                ))}
                <button type="button" onClick={addItem} style={{ marginBottom: '20px' }}>+ Add Item</button>

                <div>
                    <button type="submit" className="btn btn-primary">Create Quotation</button>
                </div>
            </form>
        </div>
    );
}
