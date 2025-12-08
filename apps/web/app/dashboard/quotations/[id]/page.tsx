'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

export default function QuotationDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [quotation, setQuotation] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) fetchQuotation(Number(params.id));
    }, [params.id]);

    const fetchQuotation = async (id: number) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/quotations/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setQuotation(await res.json());
            } else {
                alert('Quotation not found');
                router.push('/dashboard/quotations');
            }
        } catch (error) {
            console.error('Failed to fetch', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action: string) => {
        if (!confirm(`Are you sure you want to ${action} this quotation?`)) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/quotations/${params.id}/${action}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                alert(`Quotation ${action} successful!`);
                fetchQuotation(Number(params.id));
            } else {
                const err = await res.json();
                alert(`Error: ${err.message}`);
            }
        } catch (error) {
            console.error(`${action} failed`, error);
        }
    };

    const handleConvertToOrder = async () => {
        if (!confirm('Convert to Sales Order?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/quotations/${params.id}/convert-to-order`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const order = await res.json();
                alert('Sales Order created!');
                router.push(`/dashboard/sales-orders/${order.id}`);
            } else {
                const err = await res.json();
                alert(`Error: ${err.message}`);
            }
        } catch (error) {
            console.error('Convert failed', error);
        }
    };

    if (loading) return <div className={styles.container}><p>Loading...</p></div>;
    if (!quotation) return <div className={styles.container}><p>Quotation not found</p></div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>Quotation: {quotation.quotationNo}</h1>
                    <p className={styles.subtitle}>Created on {new Date(quotation.createdAt).toLocaleDateString()}</p>
                </div>
                <div className={styles.actions}>
                    <Link href="/dashboard/quotations" className="btn btn-secondary">← Back</Link>
                    {quotation.status === 'DRAFT' && (
                        <button onClick={() => handleAction('send')} className="btn btn-primary">Send</button>
                    )}
                    {quotation.status === 'SENT' && (
                        <>
                            <button onClick={() => handleAction('accept')} className="btn btn-primary" style={{ backgroundColor: '#28a745' }}>Accept</button>
                            <button onClick={() => handleAction('reject')} className="btn btn-danger" style={{ backgroundColor: '#dc3545', color: 'white' }}>Reject</button>
                        </>
                    )}
                    {quotation.status === 'ACCEPTED' && (
                        <button onClick={handleConvertToOrder} className="btn btn-primary" style={{ backgroundColor: '#17a2b8' }}>Convert to Sales Order</button>
                    )}
                    {quotation.status !== 'CANCELLED' && (
                        <button onClick={() => handleAction('cancel')} className="btn btn-secondary">Cancel</button>
                    )}
                </div>
            </div>

            <div className={styles.detailCard}>
                <h2>Quotation Info</h2>
                <div className={styles.grid}>
                    <div className={styles.field}><label>Quotation No:</label><span>{quotation.quotationNo}</span></div>
                    <div className={styles.field}><label>Status:</label><span className={`status-badge ${quotation.status?.toLowerCase()}`}>{quotation.status}</span></div>
                    <div className={styles.field}><label>Customer:</label><span>{quotation.customer?.name}</span></div>
                    <div className={styles.field}><label>Total:</label><span>₹{Number(quotation.totalAmount || 0).toFixed(2)}</span></div>
                    {quotation.validityDate && (
                        <div className={styles.field}><label>Valid Until:</label><span>{new Date(quotation.validityDate).toLocaleDateString()}</span></div>
                    )}
                </div>
            </div>

            <div className={styles.detailCard}>
                <h2>Items</h2>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Qty</th>
                            <th>Unit Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {quotation.items?.map((item: any) => (
                            <tr key={item.id}>
                                <td>{item.product?.name || `Product #${item.productId}`}</td>
                                <td>{item.quantity}</td>
                                <td>₹{Number(item.unitPrice || 0).toFixed(2)}</td>
                                <td>₹{(Number(item.unitPrice || 0) * item.quantity).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {quotation.salesOrders && quotation.salesOrders.length > 0 && (
                <div className={styles.detailCard}>
                    <h2>Linked Sales Orders</h2>
                    <ul>
                        {quotation.salesOrders.map((so: any) => (
                            <li key={so.id}>
                                <Link href={`/dashboard/sales-orders/${so.id}`}>{so.orderNumber}</Link> - {so.status}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
