'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

export default function SalesInvoiceDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [invoice, setInvoice] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            fetchInvoice(Number(params.id));
        }
    }, [params.id]);

    const fetchInvoice = async (id: number) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/sales-invoices/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setInvoice(data);
            } else {
                alert('Invoice not found');
                router.push('/dashboard/sales-invoices');
            }
        } catch (error) {
            console.error('Failed to fetch invoice', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className={styles.container}><p>Loading...</p></div>;
    if (!invoice) return <div className={styles.container}><p>Invoice not found</p></div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>Sales Invoice: {invoice.invoiceNumber}</h1>
                    <p className={styles.subtitle}>Created on {new Date(invoice.createdAt).toLocaleDateString()}</p>
                </div>
                <div className={styles.actions}>
                    <Link href="/dashboard/sales-invoices" className="btn btn-secondary">← Back to List</Link>
                    <button className="btn btn-primary">Print Invoice</button>
                </div>
            </div>

            <div className={styles.detailCard}>
                <h2>Invoice Information</h2>
                <div className={styles.grid}>
                    <div className={styles.field}>
                        <label>Invoice Number:</label>
                        <span>{invoice.invoiceNumber}</span>
                    </div>
                    <div className={styles.field}>
                        <label>Status:</label>
                        <span className={`status-badge ${invoice.status?.toLowerCase()}`}>{invoice.status}</span>
                    </div>
                    <div className={styles.field}>
                        <label>Customer:</label>
                        <span>{invoice.customer?.name}</span>
                    </div>
                    <div className={styles.field}>
                        <label>Created By:</label>
                        <span>{invoice.creator?.name}</span>
                    </div>
                    {invoice.remarks && (
                        <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
                            <label>Remarks:</label>
                            <span>{invoice.remarks}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.detailCard}>
                <h2>Invoice Items</h2>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Tax Rate</th>
                            <th>Line Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.items?.map((item: any) => (
                            <tr key={item.id}>
                                <td>{item.product?.name || `Product #${item.productId}`}</td>
                                <td>{item.quantity}</td>
                                <td>₹{item.price?.toFixed(2)}</td>
                                <td>{item.taxRate}%</td>
                                <td>₹{item.lineTotal?.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className={styles.detailCard}>
                <h2>Invoice Summary</h2>
                <div className={styles.summary}>
                    <div className={styles.summaryRow}>
                        <span>Subtotal (Before Tax):</span>
                        <strong>₹{invoice.totalBeforeTax?.toFixed(2)}</strong>
                    </div>
                    <div className={styles.summaryRow}>
                        <span>Tax Amount:</span>
                        <strong>₹{invoice.totalTax?.toFixed(2)}</strong>
                    </div>
                    <div className={styles.summaryRow} style={{ fontSize: '1.2rem', borderTop: '2px solid #333', paddingTop: '0.5rem' }}>
                        <span>Total Amount:</span>
                        <strong>₹{invoice.totalAmount?.toFixed(2)}</strong>
                    </div>
                </div>
            </div>

            {invoice.challanLinks && invoice.challanLinks.length > 0 && (
                <div className={styles.detailCard}>
                    <h2>Linked Delivery Challans</h2>
                    <ul className={styles.linkList}>
                        {invoice.challanLinks.map((link: any) => (
                            <li key={link.id}>
                                <Link href={`/dashboard/delivery-challans/${link.deliveryChallan?.id}`}>
                                    {link.deliveryChallan?.challanNumber}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
