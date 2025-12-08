'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function SalesInvoicesPage() {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/sales-invoices`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setInvoices(data);
            }
        } catch (error) {
            console.error('Failed to fetch invoices', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Sales Invoices</h1>
                <Link href="/dashboard/sales-invoices/create" className="btn btn-primary">
                    Create New Invoice
                </Link>
            </div>

            <div className={styles.tableContainer}>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Invoice #</th>
                                <th>Date</th>
                                <th>Customer</th>
                                <th>Total Amount</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map((inv: any) => (
                                <tr key={inv.id}>
                                    <td>{inv.invoiceNumber}</td>
                                    <td>{new Date(inv.createdAt).toLocaleDateString()}</td>
                                    <td>{inv.customer?.name}</td>
                                    <td>{inv.totalAmount?.toFixed(2)}</td>
                                    <td>
                                        <span className={`status-badge ${inv.status.toLowerCase()}`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td>
                                        <Link href={`/dashboard/sales-invoices/${inv.id}`}>View</Link>
                                    </td>
                                </tr>
                            ))}
                            {invoices.length === 0 && (
                                <tr>
                                    <td colSpan={6} className={styles.empty}>No invoices found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
