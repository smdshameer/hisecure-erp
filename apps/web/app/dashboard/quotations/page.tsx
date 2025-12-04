'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Header from '../../../components/Header';
import styles from './quotations.module.css';

interface Quotation {
    id: number;
    quotationNo: string;
    customer: { name: string };
    totalAmount: number;
    status: string;
    createdAt: string;
}

export default function QuotationsPage() {
    const router = useRouter();
    const [quotations, setQuotations] = useState<Quotation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchQuotations();
    }, []);

    const fetchQuotations = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/quotations`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setQuotations(response.data);
        } catch (error) {
            console.error('Failed to fetch quotations', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Header title="Quotations" />
            <div className={styles.container}>
                <div className={styles.actions}>
                    <button
                        className={styles.addButton}
                        onClick={() => router.push('/dashboard/quotations/create')}
                    >
                        + New Quotation
                    </button>
                </div>
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Quotation No</th>
                                <th>Date</th>
                                <th>Customer</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td></tr>
                            ) : quotations.length === 0 ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>No quotations found</td></tr>
                            ) : quotations.map((quote) => (
                                <tr key={quote.id}>
                                    <td>{quote.quotationNo}</td>
                                    <td>{new Date(quote.createdAt).toLocaleDateString()}</td>
                                    <td>{quote.customer?.name}</td>
                                    <td>₹{Number(quote.totalAmount).toFixed(2)}</td>
                                    <td>
                                        <span className={`${styles.status} ${quote.status === 'ACCEPTED' ? styles.statusAccepted :
                                                quote.status === 'REJECTED' ? styles.statusRejected :
                                                    quote.status === 'SENT' ? styles.statusSent :
                                                        styles.statusNew
                                            }`}>
                                            {quote.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button className={styles.viewBtn}>View Details</button>
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
