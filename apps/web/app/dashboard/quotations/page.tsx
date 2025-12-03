'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../../../components/Header';
import styles from './quotations.module.css';

interface Quotation {
    id: number;
    customerName: string;
    items: any[];
    totalAmount: number;
    status: string;
    createdAt: string;
}

export default function QuotationsPage() {
    // For now, we'll fetch enquiries as a proxy for quotations, 
    // or we can mock it if the backend doesn't strictly have "quotations" table yet.
    // Given the user request, they likely want to see "Quotations". 
    // I'll reuse the Enquiry structure but present it as Quotations for now, 
    // assuming "Enquiries" can be treated as initial requests for quotations.

    // actually, let's check if there is a specific quotations endpoint. 
    // The file list didn't show one. So I will use Enquiries and label them as Quotations/Enquiries.

    const [quotations, setQuotations] = useState<Quotation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchQuotations();
    }, []);

    const fetchQuotations = async () => {
        try {
            const token = localStorage.getItem('token');
            // Using enquiries endpoint as a placeholder for Quotations
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/enquiries`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Transform enquiry data to look like quotations if needed, 
            // or just display them.
            const data = response.data.map((enq: any) => ({
                id: enq.id,
                customerName: enq.name,
                items: [], // Enquiries might not have items details yet
                totalAmount: 0, // Enquiries might not have amount
                status: enq.status,
                createdAt: enq.createdAt
            }));

            setQuotations(data);
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
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Date</th>
                                <th>Customer</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td></tr>
                            ) : quotations.length === 0 ? (
                                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No quotations found</td></tr>
                            ) : quotations.map((quote) => (
                                <tr key={quote.id}>
                                    <td>#{quote.id}</td>
                                    <td>{new Date(quote.createdAt).toLocaleDateString()}</td>
                                    <td>{quote.customerName}</td>
                                    <td>
                                        <span className={styles.status}>{quote.status}</span>
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
