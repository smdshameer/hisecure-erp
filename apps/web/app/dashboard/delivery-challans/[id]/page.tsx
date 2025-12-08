'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

export default function DeliveryChallanDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [challan, setChallan] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            fetchChallan(Number(params.id));
        }
    }, [params.id]);

    const fetchChallan = async (id: number) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/delivery-challans/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setChallan(data);
            } else {
                alert('Delivery Challan not found');
                router.push('/dashboard/delivery-challans');
            }
        } catch (error) {
            console.error('Failed to fetch challan', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className={styles.container}><p>Loading...</p></div>;
    if (!challan) return <div className={styles.container}><p>Challan not found</p></div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>Delivery Challan: {challan.challanNumber}</h1>
                    <p className={styles.subtitle}>Created on {new Date(challan.createdAt).toLocaleDateString()}</p>
                </div>
                <div className={styles.actions}>
                    <Link href="/dashboard/delivery-challans" className="btn btn-secondary">← Back to List</Link>
                    <button className="btn btn-primary">Print</button>
                </div>
            </div>

            <div className={styles.detailCard}>
                <h2>Challan Information</h2>
                <div className={styles.grid}>
                    <div className={styles.field}>
                        <label>Challan Number:</label>
                        <span>{challan.challanNumber}</span>
                    </div>
                    <div className={styles.field}>
                        <label>Type:</label>
                        <span>{challan.type}</span>
                    </div>
                    <div className={styles.field}>
                        <label>Status:</label>
                        <span className={`status-badge ${challan.status?.toLowerCase()}`}>{challan.status}</span>
                    </div>
                    <div className={styles.field}>
                        <label>From Warehouse:</label>
                        <span>{challan.fromWarehouse?.name}</span>
                    </div>
                    {challan.customer && (
                        <div className={styles.field}>
                            <label>Customer:</label>
                            <span>{challan.customer.name}</span>
                        </div>
                    )}
                    {challan.toWarehouse && (
                        <div className={styles.field}>
                            <label>To Warehouse:</label>
                            <span>{challan.toWarehouse.name}</span>
                        </div>
                    )}
                    <div className={styles.field}>
                        <label>Created By:</label>
                        <span>{challan.creator?.name}</span>
                    </div>
                    {challan.remarks && (
                        <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
                            <label>Remarks:</label>
                            <span>{challan.remarks}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.detailCard}>
                <h2>Items</h2>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Unit</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {challan.items?.map((item: any) => (
                            <tr key={item.id}>
                                <td>{item.product?.name || `Product #${item.productId}`}</td>
                                <td>{item.quantity}</td>
                                <td>{item.unit}</td>
                                <td>{item.description || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
