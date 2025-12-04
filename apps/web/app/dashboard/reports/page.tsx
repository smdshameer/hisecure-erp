'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './reports.module.css';
import Header from '../../../components/Header';

interface Stats {
    totalRevenue: number;
    totalOrders: number;
    lowStockCount: number;
    pendingTickets: number;
}

interface Product {
    id: number;
    name: string;
    sku: string;
    stock: number;
}

export default function ReportsPage() {
    const [activeTab, setActiveTab] = useState<'general' | 'gst'>('general');
    const [gstMonth, setGstMonth] = useState(new Date().getMonth() + 1);
    const [gstYear, setGstYear] = useState(new Date().getFullYear());
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [gstr1Data, setGstr1Data] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [gstr3bData, setGstr3bData] = useState<any>(null);

    const [stats, setStats] = useState<Stats | null>(null);
    const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (activeTab === 'gst') {
            fetchGstReports();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, gstMonth, gstYear]);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const [statsRes, lowStockRes] = await Promise.all([
                axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/reports/stats`, { headers }),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/reports/low-stock`, { headers })
            ]);

            setStats(statsRes.data);
            setLowStockProducts(lowStockRes.data);
        } catch (error) {
            console.error('Failed to fetch reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchGstReports = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const [gstr1Res, gstr3bRes] = await Promise.all([
                axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/reports/gst/gstr1?month=${gstMonth}&year=${gstYear}`, { headers }),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/reports/gst/gstr3b?month=${gstMonth}&year=${gstYear}`, { headers })
            ]);

            setGstr1Data(gstr1Res.data);
            setGstr3bData(gstr3bRes.data);
        } catch (error) {
            console.error('Failed to fetch GST reports:', error);
        }
    };

    if (loading) return <div>Loading reports...</div>;

    return (
        <>
            <Header title="Business Reports" />
            <div className={styles.container}>
                <div className={styles.tabs} style={{ marginBottom: '2rem' }}>
                    <button
                        className={`${styles.tab} ${activeTab === 'general' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('general')}
                    >
                        General
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'gst' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('gst')}
                    >
                        GST Reports
                    </button>
                </div>

                {activeTab === 'general' ? (
                    <>
                        {stats && (
                            <div className={styles.statsGrid}>
                                <div className={styles.statCard}>
                                    <span className={styles.statLabel}>Total Revenue</span>
                                    <span className={styles.statValue}>₹{stats.totalRevenue.toLocaleString()}</span>
                                </div>
                                <div className={styles.statCard}>
                                    <span className={styles.statLabel}>Total Orders</span>
                                    <span className={styles.statValue}>{stats.totalOrders}</span>
                                </div>
                                <div className={styles.statCard}>
                                    <span className={styles.statLabel}>Low Stock Items</span>
                                    <span className={styles.statValue} style={{ color: '#ef4444' }}>{stats.lowStockCount}</span>
                                </div>
                                <div className={styles.statCard}>
                                    <span className={styles.statLabel}>Pending Tickets</span>
                                    <span className={styles.statValue}>{stats.pendingTickets}</span>
                                </div>
                            </div>
                        )}

                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>Low Stock Alert</h2>
                            <div className={styles.tableContainer}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>SKU</th>
                                            <th>Product Name</th>
                                            <th>Current Stock</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lowStockProducts.map((product) => (
                                            <tr key={product.id}>
                                                <td>{product.sku}</td>
                                                <td>{product.name}</td>
                                                <td className={styles.lowStock}>{product.stock}</td>
                                            </tr>
                                        ))}
                                        {lowStockProducts.length === 0 && (
                                            <tr>
                                                <td colSpan={3} style={{ textAlign: 'center', color: '#64748b' }}>
                                                    All products are well stocked.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className={styles.gstContainer}>
                        <div className={styles.filters}>
                            <select value={gstMonth} onChange={(e) => setGstMonth(Number(e.target.value))} className={styles.select}>
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                    <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('default', { month: 'long' })}</option>
                                ))}
                            </select>
                            <select value={gstYear} onChange={(e) => setGstYear(Number(e.target.value))} className={styles.select}>
                                <option value={2024}>2024</option>
                                <option value={2025}>2025</option>
                            </select>
                        </div>

                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>GSTR-3B Summary</h2>
                            {gstr3bData && (
                                <div className={styles.summaryGrid}>
                                    <div className={styles.summaryCard}>
                                        <h3>Outward Supplies (Sales)</h3>
                                        <p>Taxable Value: ₹{Number(gstr3bData.outwardSupplies.taxableValue).toFixed(2)}</p>
                                        <p>Total Tax: ₹{Number(gstr3bData.outwardSupplies.totalTax).toFixed(2)}</p>
                                    </div>
                                    <div className={styles.summaryCard}>
                                        <h3>ITC Available (Purchases)</h3>
                                        <p>Taxable Value: ₹{Number(gstr3bData.itcAvailable.taxableValue).toFixed(2)}</p>
                                        <p>Total Tax: ₹{Number(gstr3bData.itcAvailable.totalTax).toFixed(2)}</p>
                                    </div>
                                    <div className={styles.summaryCard}>
                                        <h3>Net Tax Payable</h3>
                                        <p>CGST: ₹{Number(gstr3bData.taxPayable.cgst).toFixed(2)}</p>
                                        <p>SGST: ₹{Number(gstr3bData.taxPayable.sgst).toFixed(2)}</p>
                                        <p>IGST: ₹{Number(gstr3bData.taxPayable.igst).toFixed(2)}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>GSTR-1 (Outward Supplies)</h2>
                            <div className={styles.tableContainer}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Invoice No</th>
                                            <th>Date</th>
                                            <th>Customer</th>
                                            <th>GSTIN</th>
                                            <th>Taxable Value</th>
                                            <th>CGST</th>
                                            <th>SGST</th>
                                            <th>IGST</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        {gstr1Data.map((row: any) => (
                                            <tr key={row.invoiceNo}>
                                                <td>{row.invoiceNo}</td>
                                                <td>{new Date(row.date).toLocaleDateString()}</td>
                                                <td>{row.customerName}</td>
                                                <td>{row.customerGstin}</td>
                                                <td>₹{Number(row.taxableValue).toFixed(2)}</td>
                                                <td>₹{Number(row.cgst).toFixed(2)}</td>
                                                <td>₹{Number(row.sgst).toFixed(2)}</td>
                                                <td>₹{Number(row.igst).toFixed(2)}</td>
                                                <td>₹{Number(row.totalAmount).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
