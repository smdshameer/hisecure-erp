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
            // Use environment variable for backend
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';
            const response = await axios.get(`${apiUrl}/analytics/dashboard`, {
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
                        <div className={styles.cardHeader}>
                            <div className={styles.iconWrapper}>💰</div>
                            <span className={styles.cardTitle}>Total Revenue</span>
                        </div>
                        <p className={styles.cardValue}>₹{data?.totalRevenue.toLocaleString()}</p>
                        <div className={styles.trend}>
                            <span className={styles.trendUp}>↗ +12%</span>
                            <span className={styles.trendNeutral}>vs last month</span>
                        </div>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div className={styles.iconWrapper}>📦</div>
                            <span className={styles.cardTitle}>Total Orders</span>
                        </div>
                        <p className={styles.cardValue}>{data?.totalOrders}</p>
                        <div className={styles.trend}>
                            <span className={styles.trendUp}>↗ +5%</span>
                            <span className={styles.trendNeutral}>vs last month</span>
                        </div>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div className={styles.iconWrapper}>⚠️</div>
                            <span className={styles.cardTitle}>Low Stock Items</span>
                        </div>
                        <p className={styles.cardValue} style={{ color: (data?.lowStockCount || 0) > 0 ? '#ef4444' : 'var(--text-primary)' }}>
                            {data?.lowStockCount}
                        </p>
                        <div className={styles.trend}>
                            <span className={styles.trendNeutral}>Requires attention</span>
                        </div>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div className={styles.iconWrapper}>📈</div>
                            <span className={styles.cardTitle}>Recent Sales</span>
                        </div>
                        <p className={styles.cardValue}>{data?.recentSales.length}</p>
                        <div className={styles.trend}>
                            <span className={styles.trendNeutral}>Latest activity</span>
                        </div>
                    </div>
                </div>

                <div className={styles.chartsSection}>
                    {data && <AnalyticsCharts topProducts={data.topProducts} />}
                </div>
            </div>
        </>
    );
}
