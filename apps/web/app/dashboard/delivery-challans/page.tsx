'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function DeliveryChallansPage() {
    const [challans, setChallans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchChallans();
    }, []);

    const fetchChallans = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/delivery-challans`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setChallans(data);
            }
        } catch (error) {
            console.error('Failed to fetch challans', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Delivery Challans</h1>
                <Link href="/dashboard/delivery-challans/create" className="btn btn-primary">
                    Create New Challan
                </Link>
            </div>

            <div className={styles.tableContainer}>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>DC Number</th>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Customer / Warehouse</th>
                                <th>Status</th>
                                <th>Items</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {challans.map((dc: any) => (
                                <tr key={dc.id}>
                                    <td>{dc.challanNumber}</td>
                                    <td>{new Date(dc.createdAt).toLocaleDateString()}</td>
                                    <td>{dc.type}</td>
                                    <td>
                                        {dc.customer ? dc.customer.name : (dc.toWarehouse ? `Warehouse: ${dc.toWarehouse.name}` : '-')}
                                    </td>
                                    <td>
                                        <span className={`status-badge ${dc.status.toLowerCase()}`}>
                                            {dc.status}
                                        </span>
                                    </td>
                                    <td>{dc._count?.items || 0}</td>
                                    <td>
                                        <Link href={`/dashboard/delivery-challans/${dc.id}`}>View</Link>
                                    </td>
                                </tr>
                            ))}
                            {challans.length === 0 && (
                                <tr>
                                    <td colSpan={7} className={styles.empty}>No delivery challans found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
