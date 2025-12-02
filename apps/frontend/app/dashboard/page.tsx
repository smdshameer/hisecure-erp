'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../../components/Header';
import AnalyticsCharts from '../../components/AnalyticsCharts';

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
            <div style={{ padding: '2rem' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1.5rem'
                }}>
                    <div style={cardStyle}>
                        <h3 style={cardTitleStyle}>Total Revenue</h3>
                        <p style={cardValueStyle}>₹{data?.totalRevenue.toLocaleString()}</p>
                    </div>
                    <div style={cardStyle}>
                        <h3 style={cardTitleStyle}>Total Orders</h3>
                        <p style={cardValueStyle}>{data?.totalOrders}</p>
                    </div>
                    <div style={cardStyle}>
                        <h3 style={cardTitleStyle}>Low Stock Items</h3>
                        <p style={{ ...cardValueStyle, color: (data?.lowStockCount || 0) > 0 ? '#ef4444' : 'var(--text-primary)' }}>
                            {data?.lowStockCount}
                        </p>
                    </div>
                    <div style={cardStyle}>
                        <h3 style={cardTitleStyle}>Recent Sales</h3>
                        <p style={cardValueStyle}>{data?.recentSales.length}</p>
                    </div>
                </div>

                {data && <AnalyticsCharts topProducts={data.topProducts} />}
            </div>
        </>
    );
}

const cardStyle = {
    background: 'var(--card-bg)',
    padding: '1.5rem',
    borderRadius: '12px',
    border: '1px solid var(--border-color)'
};

const cardTitleStyle = {
    color: 'var(--text-secondary)',
    fontSize: '0.875rem',
    marginBottom: '0.5rem'
};

const cardValueStyle = {
    fontSize: '2rem',
    fontWeight: '700',
    color: 'var(--text-primary)'
};
