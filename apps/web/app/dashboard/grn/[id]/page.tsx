'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

export default function GrnDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [grn, setGrn] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            fetchGrn(Number(params.id));
        }
    }, [params.id]);

    const fetchGrn = async (id: number) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/grn/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setGrn(data);
            } else {
                alert('GRN not found');
                router.push('/dashboard/grn');
            }
        } catch (error) {
            console.error('Failed to fetch GRN', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className={styles.container}><p>Loading...</p></div>;
    if (!grn) return <div className={styles.container}><p>GRN not found</p></div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>Goods Receipt Note: {grn.grnNumber}</h1>
                    <p className={styles.subtitle}>Created on {new Date(grn.createdAt).toLocaleDateString()}</p>
                </div>
                <div className={styles.actions}>
                    <Link href="/dashboard/grn" className="btn btn-secondary">← Back to List</Link>
                </div>
            </div>

            <div className={styles.detailCard}>
                <h2>GRN Information</h2>
                <div className={styles.grid}>
                    <div className={styles.field}>
                        <label>GRN Number:</label>
                        <span>{grn.grnNumber}</span>
                    </div>
                    <div className={styles.field}>
                        <label>Warehouse:</label>
                        <span>{grn.warehouse?.name}</span>
                    </div>
                    {grn.supplier && (
                        <div className={styles.field}>
                            <label>Supplier:</label>
                            <span>{grn.supplier.name}</span>
                        </div>
                    )}
                    <div className={styles.field}>
                        <label>Created By:</label>
                        <span>{grn.creator?.name}</span>
                    </div>
                    {grn.remarks && (
                        <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
                            <label>Remarks:</label>
                            <span>{grn.remarks}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.detailCard}>
                <h2>Received Items</h2>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Unit</th>
                            <th>Purchase Price</th>
                            <th>Line Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {grn.items?.map((item: any) => (
                            <tr key={item.id}>
                                <td>{item.product?.name || `Product #${item.productId}`}</td>
                                <td>{item.quantity}</td>
                                <td>{item.unit}</td>
                                <td>₹{item.purchasePrice?.toFixed(2)}</td>
                                <td>₹{item.lineTotal?.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
