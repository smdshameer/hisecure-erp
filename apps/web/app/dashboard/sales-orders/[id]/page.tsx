'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

export default function SalesOrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            fetchOrder(Number(params.id));
        }
    }, [params.id]);

    const fetchOrder = async (id: number) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/sales-orders/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setOrder(data);
            } else {
                alert('Order not found');
                router.push('/dashboard/sales-orders');
            }
        } catch (error) {
            console.error('Failed to fetch order', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className={styles.container}><p>Loading...</p></div>;
    if (!order) return <div className={styles.container}><p>Order not found</p></div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>Sales Order: {order.orderNumber}</h1>
                    <p className={styles.subtitle}>Created on {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className={styles.actions}>
                    <Link href="/dashboard/sales-orders" className="btn btn-secondary">← Back to List</Link>
                </div>
            </div>

            <div className={styles.detailCard}>
                <h2>Order Information</h2>
                <div className={styles.grid}>
                    <div className={styles.field}>
                        <label>Order Number:</label>
                        <span>{order.orderNumber}</span>
                    </div>
                    <div className={styles.field}>
                        <label>Status:</label>
                        <span className={`status-badge ${order.status?.toLowerCase()}`}>{order.status}</span>
                    </div>
                    <div className={styles.field}>
                        <label>Customer:</label>
                        <span>{order.customer?.name}</span>
                    </div>
                    <div className={styles.field}>
                        <label>Created By:</label>
                        <span>{order.creator?.name}</span>
                    </div>
                    {order.remarks && (
                        <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
                            <label>Remarks:</label>
                            <span>{order.remarks}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.detailCard}>
                <h2>Order Items</h2>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Ordered Qty</th>
                            <th>Dispatched Qty</th>
                            <th>Unit</th>
                            <th>Price</th>
                            <th>Discount</th>
                            <th>Tax Rate</th>
                            <th>Line Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items?.map((item: any) => (
                            <tr key={item.id}>
                                <td>{item.product?.name || `Product #${item.productId}`}</td>
                                <td>{item.orderedQty}</td>
                                <td>{item.dispatchedQty}</td>
                                <td>{item.unit}</td>
                                <td>₹{item.price?.toFixed(2)}</td>
                                <td>{item.discount}%</td>
                                <td>{item.taxRate}%</td>
                                <td>₹{item.lineTotal?.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {order.deliveryChallans && order.deliveryChallans.length > 0 && (
                <div className={styles.detailCard}>
                    <h2>Linked Delivery Challans</h2>
                    <ul className={styles.linkList}>
                        {order.deliveryChallans.map((dc: any) => (
                            <li key={dc.id}>
                                <Link href={`/dashboard/delivery-challans/${dc.id}`}>
                                    {dc.challanNumber} - {dc.status}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
