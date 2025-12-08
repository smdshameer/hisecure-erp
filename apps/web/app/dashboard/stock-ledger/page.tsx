'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';

export default function StockLedgerPage() {
    const [entries, setEntries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        productId: '',
        warehouseId: '',
        refType: '',
        dateFrom: '',
        dateTo: '',
    });
    const [products, setProducts] = useState<any[]>([]);
    const [warehouses, setWarehouses] = useState<any[]>([]);

    useEffect(() => {
        fetchDropdowns();
        fetchEntries();
    }, []);

    const fetchDropdowns = async () => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
            const [pRes, wRes] = await Promise.all([
                fetch(`${apiUrl}/products`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${apiUrl}/branches`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            if (pRes.ok) setProducts(await pRes.json());
            if (wRes.ok) setWarehouses(await wRes.json());
        } catch (error) {
            console.error('Failed to fetch dropdowns', error);
        }
    };

    const fetchEntries = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            if (filters.productId) params.append('productId', filters.productId);
            if (filters.warehouseId) params.append('warehouseId', filters.warehouseId);
            if (filters.refType) params.append('refType', filters.refType);
            if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
            if (filters.dateTo) params.append('dateTo', filters.dateTo);

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/stock-ledger?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const result = await res.json();
                setEntries(result.data || result);
            }
        } catch (error) {
            console.error('Failed to fetch', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (field: string, value: string) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const applyFilters = () => fetchEntries();
    const clearFilters = () => {
        setFilters({ productId: '', warehouseId: '', refType: '', dateFrom: '', dateTo: '' });
        setTimeout(fetchEntries, 100);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Stock Ledger</h1>
            </div>

            <div className={styles.filters}>
                <select value={filters.productId} onChange={e => handleFilterChange('productId', e.target.value)}>
                    <option value="">All Products</option>
                    {products.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <select value={filters.warehouseId} onChange={e => handleFilterChange('warehouseId', e.target.value)}>
                    <option value="">All Warehouses</option>
                    {warehouses.map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
                <select value={filters.refType} onChange={e => handleFilterChange('refType', e.target.value)}>
                    <option value="">All Types</option>
                    <option value="DELIVERY_CHALLAN">Delivery Challan</option>
                    <option value="GRN">GRN</option>
                    <option value="ADJUSTMENT">Adjustment</option>
                    <option value="TRANSFER">Transfer</option>
                </select>
                <input type="date" value={filters.dateFrom} onChange={e => handleFilterChange('dateFrom', e.target.value)} />
                <input type="date" value={filters.dateTo} onChange={e => handleFilterChange('dateTo', e.target.value)} />
                <button onClick={applyFilters} className="btn btn-primary">Apply</button>
                <button onClick={clearFilters} className="btn btn-secondary">Clear</button>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Product</th>
                            <th>Warehouse</th>
                            <th>Type</th>
                            <th>Qty In</th>
                            <th>Qty Out</th>
                            <th>Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {entries.map((e: any) => (
                            <tr key={e.id}>
                                <td>{new Date(e.entryDate).toLocaleDateString()}</td>
                                <td>{e.product?.name || `#${e.productId}`}</td>
                                <td>{e.warehouse?.name || `#${e.warehouseId}`}</td>
                                <td>{e.refType}</td>
                                <td style={{ color: e.qtyIn > 0 ? 'green' : 'inherit' }}>{e.qtyIn || '-'}</td>
                                <td style={{ color: e.qtyOut > 0 ? 'red' : 'inherit' }}>{e.qtyOut || '-'}</td>
                                <td><strong>{e.balanceQty}</strong></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
