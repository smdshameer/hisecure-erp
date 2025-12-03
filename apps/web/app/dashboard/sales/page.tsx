'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import Header from '../../../components/Header';
import styles from './sales.module.css';

interface Sale {
    id: number;
    invoiceNo: string;
    customerName: string;
    totalAmount: number;
    paymentMethod: string;
    createdAt: string;
}

export default function SalesPage() {
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSales();
    }, []);

    const fetchSales = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/sales`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSales(response.data);
        } catch (error) {
            console.error('Failed to fetch sales', error);
        } finally {
            setLoading(false);
        }
    };

    const downloadInvoice = async (saleId: number, invoiceNo: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/sales/${saleId}/invoice`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice-${invoiceNo}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Failed to download invoice', error);
            alert('Failed to download invoice');
        }
    };

    return (
        <>
            <Header title="Sales & Invoices" />
            <div className={styles.container}>
                <div className={styles.actions}>
                    <Link
                        href="/dashboard/sales/create"
                        className={styles.downloadBtn}
                        style={{ textDecoration: 'none' }}
                    >
                        + Create Invoice
                    </Link>
                </div>
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Invoice No</th>
                                <th>Date</th>
                                <th>Customer</th>
                                <th>Amount</th>
                                <th>Payment</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td></tr>
                            ) : sales.length === 0 ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>No sales found</td></tr>
                            ) : sales.map((sale) => (
                                <tr key={sale.id}>
                                    <td>{sale.invoiceNo}</td>
                                    <td>{new Date(sale.createdAt).toLocaleDateString()}</td>
                                    <td>{sale.customerName || 'Walk-in'}</td>
                                    <td>₹{Number(sale.totalAmount).toFixed(2)}</td>
                                    <td>{sale.paymentMethod}</td>
                                    <td>
                                        <button
                                            className={styles.downloadBtn}
                                            onClick={() => downloadInvoice(sale.id, sale.invoiceNo)}
                                        >
                                            Download Invoice
                                        </button>
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
