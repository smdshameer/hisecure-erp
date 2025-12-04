'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../../../components/Header';
import styles from './crm.module.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CRMDashboard() {
    const [stats, setStats] = useState({
        totalCustomers: 0,
        pendingFollowUps: 0,
        openComplaints: 0,
    });
    const [followUps, setFollowUps] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const [customersRes, followUpsRes, complaintsRes] = await Promise.all([
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/customers`, { headers }),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/followups/pending`, { headers }),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/complaints`, { headers }),
            ]);

            setStats({
                totalCustomers: customersRes.data.length,
                pendingFollowUps: followUpsRes.data.length,
                openComplaints: complaintsRes.data.filter((c: any) => c.status === 'OPEN').length,
            });

            setFollowUps(followUpsRes.data.slice(0, 5)); // Show top 5
        } catch (error) {
            console.error('Failed to fetch CRM data', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Header title="CRM Dashboard" />
            <div className={styles.container}>
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <h3>Total Customers</h3>
                        <div className={styles.statValue}>{stats.totalCustomers}</div>
                        <Link href="/dashboard/crm/customers" className={styles.statLink}>View All</Link>
                    </div>
                    <div className={styles.statCard}>
                        <h3>Pending Follow-ups</h3>
                        <div className={styles.statValue}>{stats.pendingFollowUps}</div>
                        <div className={styles.statSub}>Tasks for today</div>
                    </div>
                    <div className={styles.statCard}>
                        <h3>Open Complaints</h3>
                        <div className={styles.statValue}>{stats.openComplaints}</div>
                        <div className={styles.statSub}>Requires attention</div>
                    </div>
                </div>

                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2>Upcoming Follow-ups</h2>
                    </div>
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Customer</th>
                                    <th>Description</th>
                                    <th>Assigned To</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td></tr>
                                ) : followUps.length === 0 ? (
                                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No pending follow-ups</td></tr>
                                ) : followUps.map((f: any) => (
                                    <tr key={f.id}>
                                        <td>{new Date(f.date).toLocaleDateString()}</td>
                                        <td>{f.customer?.name}</td>
                                        <td>{f.description}</td>
                                        <td>{f.assignedTo?.name || 'Unassigned'}</td>
                                        <td>
                                            <button
                                                className={styles.actionBtn}
                                                onClick={() => router.push(`/dashboard/crm/customers/${f.customerId}`)}
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}
