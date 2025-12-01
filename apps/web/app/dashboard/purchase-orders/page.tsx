'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Header from '../../../components/Header';
import styles from './purchase-orders.module.css';

interface PurchaseOrder {
    id: number;
    poNumber: string;
    status: string;
    totalAmount: string;
    createdAt: string;
    supplier: {
        name: string;
    };
}

export default function PurchaseOrdersPage() {
    const [orders, setOrders] = useState<PurchaseOrder[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/purchase-orders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(response.data);
        } catch (error) {
            console.error('Failed to fetch orders', error);
        } finally {
            setLoading(false);
        }
    };

    const receiveOrder = async (id: number) => {
        if (!confirm('Are you sure you want to mark this PO as Received? This will update stock.')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:3000/purchase-orders/${id}/receive`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchOrders();
        } catch (error) {
            console.error('Failed to receive order', error);
            alert('Failed to receive order');
        }
    };

    return (
        <>
            <Header title="Purchase Orders" />
            <div className={styles.container}>
                <div className={styles.actions}>
                    <input type="text" placeholder="Search POs..." className={styles.search} />
                    <Link href="/dashboard/purchase-orders/create" className={styles.addButton}>
                        + Create PO
                    </Link>
                </div>

                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>PO Number</th>
                                <th>Supplier</th>
                                <th>Date</th>
                                <th>Total Amount</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td></tr>
                            ) : orders.map((po) => (
                                <tr key={po.id}>
                                    <td>{po.poNumber}</td>
                                    <td>{po.supplier?.name}</td>
                                    <td>{new Date(po.createdAt).toLocaleDateString()}</td>
                                    <td>₹{Number(po.totalAmount).toFixed(2)}</td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${styles['status' + po.status]}`}>
                                            {po.status}
                                        </span>
                                    </td>
                                    <td>
                                        {po.status !== 'RECEIVED' && (
                                            <button
                                                className={styles.viewBtn}
                                                onClick={() => receiveOrder(po.id)}
                                                style={{ marginRight: '0.5rem' }}
                                            >
                                                Receive
                                            </button>
                                        )}
                                        {/* <Link href={`/dashboard/purchase-orders/${po.id}`} className={styles.viewBtn}>
                                            View
                                        </Link> */}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
