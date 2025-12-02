'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../../components/Header';
import AnalyticsCharts from '../../components/AnalyticsCharts';
import styles from './dashboard.module.css';

interface DashboardData {
    totalRevenue: number;
    totalOrders: number;
    lowStockCount: number;
    topProducts: { name: string; sales: number }[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recentSales: any[];
}

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/analytics/dashboard`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(response.data);
        } catch (error) {
            console.error('Failed to fetch dashboard data', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div style={{ padding: '2rem', color: 'var(--text-primary)' }}>Loading dashboard...</div>;
    }

    return (
        <>
            <Header title="Overview" />
            <div className={styles.container}>
                <div className={styles.grid}>
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>Total Revenue</h3>
                        <p className={styles.cardValue}>₹{data?.totalRevenue.toLocaleString()}</p>
                    </div>
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>Total Orders</h3>
                        <p className={styles.cardValue}>{data?.totalOrders}</p>
                    </div>
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>Low Stock Items</h3>
                        <p className={styles.cardValue} style={{ color: (data?.lowStockCount || 0) > 0 ? '#ef4444' : 'var(--text-primary)' }}>
                            {data?.lowStockCount}
                        </p>
                    </div>
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>Recent Sales</h3>
                        <p className={styles.cardValue}>{data?.recentSales.length}</p>
                    </div>
                </div>

                {data && <AnalyticsCharts topProducts={data.topProducts} />}
            </div>
        </>
    );
}
