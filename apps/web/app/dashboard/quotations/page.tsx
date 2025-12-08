'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function QuotationsPage() {
    const [quotations, setQuotations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        dateFrom: '',
        dateTo: '',
        status: '',
        customerId: '',
    });
    const [customers, setCustomers] = useState<any[]>([]);

    useEffect(() => {
        fetchCustomers();
        fetchQuotations();
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

    const fetchQuotations = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
            if (filters.dateTo) params.append('dateTo', filters.dateTo);
            if (filters.status) params.append('status', filters.status);
            if (filters.customerId) params.append('customerId', filters.customerId);

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/quotations?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const result = await res.json();
                setQuotations(result.data || result);
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

    const applyFilters = () => fetchQuotations();
    const clearFilters = () => {
        setFilters({ dateFrom: '', dateTo: '', status: '', customerId: '' });
        setTimeout(fetchQuotations, 100);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Quotations</h1>
                <Link href="/dashboard/quotations/create" className="btn btn-primary">
                    + New Quotation
                </Link>
            </div>

            <div className={styles.filters}>
                <input type="date" value={filters.dateFrom} onChange={e => handleFilterChange('dateFrom', e.target.value)} />
                <input type="date" value={filters.dateTo} onChange={e => handleFilterChange('dateTo', e.target.value)} />
                <select value={filters.status} onChange={e => handleFilterChange('status', e.target.value)}>
                    <option value="">All Status</option>
                    <option value="DRAFT">Draft</option>
                    <option value="SENT">Sent</option>
                    <option value="ACCEPTED">Accepted</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="CANCELLED">Cancelled</option>
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
                            <th>Quotation No</th>
                            <th>Date</th>
                            <th>Customer</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {quotations.map((q: any) => (
                            <tr key={q.id}>
                                <td>{q.quotationNo}</td>
                                <td>{new Date(q.quoteDate || q.createdAt).toLocaleDateString()}</td>
                                <td>{q.customer?.name || '-'}</td>
                                <td>₹{Number(q.totalAmount || 0).toFixed(2)}</td>
                                <td><span className={`status-badge ${q.status?.toLowerCase()}`}>{q.status}</span></td>
                                <td>
                                    <Link href={`/dashboard/quotations/${q.id}`}>View</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
