'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function DeliveryChallansPage() {
    const [challans, setChallans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        dateFrom: '',
        dateTo: '',
        status: '',
        type: '',
        customerId: '',
    });
    const [customers, setCustomers] = useState<any[]>([]);

    useEffect(() => {
        fetchCustomers();
        fetchChallans();
    }, []);

    const fetchCustomers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/customers`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setCustomers(await res.json());
        } catch (error) {
            console.error('Failed to fetch customers', error);
        }
    };

    const fetchChallans = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
            if (filters.dateTo) params.append('dateTo', filters.dateTo);
            if (filters.status) params.append('status', filters.status);
            if (filters.type) params.append('type', filters.type);
            if (filters.customerId) params.append('customerId', filters.customerId);

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/delivery-challans?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const result = await res.json();
                setChallans(result.data || result);
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

    const applyFilters = () => {
        fetchChallans();
    };

    const clearFilters = () => {
        setFilters({ dateFrom: '', dateTo: '', status: '', type: '', customerId: '' });
        setTimeout(fetchChallans, 100);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Delivery Challans</h1>
                <Link href="/dashboard/delivery-challans/create" className="btn btn-primary">
                    + New Delivery Challan
                </Link>
            </div>

            <div className={styles.filters}>
                <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={e => handleFilterChange('dateFrom', e.target.value)}
                    placeholder="From Date"
                />
                <input
                    type="date"
                    value={filters.dateTo}
                    onChange={e => handleFilterChange('dateTo', e.target.value)}
                    placeholder="To Date"
                />
                <select value={filters.status} onChange={e => handleFilterChange('status', e.target.value)}>
                    <option value="">All Status</option>
                    <option value="DRAFT">Draft</option>
                    <option value="DISPATCHED">Dispatched</option>
                    <option value="INVOICED">Invoiced</option>
                    <option value="CANCELLED">Cancelled</option>
                </select>
                <select value={filters.type} onChange={e => handleFilterChange('type', e.target.value)}>
                    <option value="">All Types</option>
                    <option value="SO">Sales Order</option>
                    <option value="TRANSFER">Stock Transfer</option>
                    <option value="SERVICE">Service</option>
                    <option value="SAMPLE">Sample</option>
                    <option value="OTHER">Other</option>
                </select>
                <select value={filters.customerId} onChange={e => handleFilterChange('customerId', e.target.value)}>
                    <option value="">All Customers</option>
                    {customers.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <button onClick={applyFilters} className="btn btn-primary">Apply</button>
                <button onClick={clearFilters} className="btn btn-secondary">Clear</button>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Challan No</th>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Customer</th>
                            <th>From Warehouse</th>
                            <th>Status</th>
                            <th>Items</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {challans.map((dc: any) => (
                            <tr key={dc.id}>
                                <td>{dc.challanNumber}</td>
                                <td>{new Date(dc.challanDate).toLocaleDateString()}</td>
                                <td>{dc.type}</td>
                                <td>{dc.customer?.name || '-'}</td>
                                <td>{dc.fromWarehouse?.name}</td>
                                <td><span className={`status-badge ${dc.status?.toLowerCase()}`}>{dc.status}</span></td>
                                <td>{dc._count?.items || 0}</td>
                                <td>
                                    <Link href={`/dashboard/delivery-challans/${dc.id}`}>View</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
