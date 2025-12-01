'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './warranty.module.css';

interface WarrantyClaim {
    id: number;
    description: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
    resolution: string;
    createdAt: string;
    saleItem: {
        product: {
            name: string;
            sku: string;
        };
        sale: {
            invoiceNo: string;
            customer?: {
                name: string;
            };
        };
    };
}

export default function WarrantyPage() {
    const [claims, setClaims] = useState<WarrantyClaim[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchClaims();
    }, []);

    const fetchClaims = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:3000/warranty/claims', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setClaims(data);
            }
        } catch (error) {
            console.error('Failed to fetch claims', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: number, status: string) => {
        if (!confirm(`Are you sure you want to mark this claim as ${status}?`)) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:3000/warranty/claims/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status }),
            });

            if (res.ok) {
                fetchClaims();
            } else {
                alert('Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status', error);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Warranty Claims</h1>
                <Link href="/dashboard/warranty/check" className={styles.checkButton}>
                    Check Warranty / New Claim
                </Link>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Date</th>
                            <th>Invoice</th>
                            <th>Product</th>
                            <th>Customer</th>
                            <th>Issue</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {claims.map((claim) => (
                            <tr key={claim.id}>
                                <td>#{claim.id}</td>
                                <td>{new Date(claim.createdAt).toLocaleDateString()}</td>
                                <td>{claim.saleItem.sale.invoiceNo}</td>
                                <td>
                                    {claim.saleItem.product.name}
                                    <br />
                                    <small className="text-gray-500">{claim.saleItem.product.sku}</small>
                                </td>
                                <td>{claim.saleItem.sale.customer?.name || 'Walk-in'}</td>
                                <td>{claim.description}</td>
                                <td>
                                    <span className={`${styles.status} ${styles[`status_${claim.status}`]}`}>
                                        {claim.status}
                                    </span>
                                </td>
                                <td>
                                    {claim.status === 'PENDING' && (
                                        <>
                                            <button
                                                onClick={() => updateStatus(claim.id, 'APPROVED')}
                                                className={styles.actionButton}
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => updateStatus(claim.id, 'REJECTED')}
                                                className={styles.actionButton}
                                                style={{ color: '#dc2626' }}
                                            >
                                                Reject
                                            </button>
                                        </>
                                    )}
                                    {claim.status === 'APPROVED' && (
                                        <button
                                            onClick={() => updateStatus(claim.id, 'COMPLETED')}
                                            className={styles.actionButton}
                                        >
                                            Complete
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {claims.length === 0 && (
                            <tr>
                                <td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>
                                    No warranty claims found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
