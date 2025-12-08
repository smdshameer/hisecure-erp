'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function GrnPage() {
    const [grns, setGrns] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGrns();
    }, []);

    const fetchGrns = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/grn`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setGrns(data);
            }
        } catch (error) {
            console.error('Failed to fetch GRNs', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Goods Receipt Notes</h1>
                <Link href="/dashboard/grn/create" className="btn btn-primary">
                    Create New GRN
                </Link>
            </div>

            <div className={styles.tableContainer}>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>GRN #</th>
                                <th>Date</th>
                                <th>Supplier / Source</th>
                                <th>Warehouse</th>
                                <th>Items</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {grns.map((grn: any) => (
                                <tr key={grn.id}>
                                    <td>{grn.grnNumber}</td>
                                    <td>{new Date(grn.createdAt).toLocaleDateString()}</td>
                                    <td>{grn.supplier ? grn.supplier.name : '-'}</td>
                                    <td>{grn.warehouse?.name}</td>
                                    <td>{grn._count?.items || 0}</td>
                                    <td>
                                        <Link href={`/dashboard/grn/${grn.id}`}>View</Link>
                                    </td>
                                </tr>
                            ))}
                            {grns.length === 0 && (
                                <tr>
                                    <td colSpan={6} className={styles.empty}>No GRNs found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
