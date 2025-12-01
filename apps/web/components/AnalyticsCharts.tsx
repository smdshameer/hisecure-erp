'use client';

import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';

interface AnalyticsChartsProps {
    topProducts: { name: string; sales: number }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AnalyticsCharts({ topProducts }: AnalyticsChartsProps) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '2rem' }}>
            <div style={{ background: 'var(--secondary-color)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Top Selling Products</h3>
                <div style={{ height: 300, width: '100%' }}>
                    <ResponsiveContainer>
                        <BarChart
                            data={topProducts}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                            <XAxis dataKey="name" stroke="var(--text-secondary)" />
                            <YAxis stroke="var(--text-secondary)" />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'var(--secondary-color)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                            />
                            <Legend />
                            <Bar dataKey="sales" fill="var(--accent-color)" name="Units Sold" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div style={{ background: 'var(--secondary-color)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Sales Distribution</h3>
                <div style={{ height: 300, width: '100%' }}>
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie
                                data={topProducts}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="sales"
                            >
                                {topProducts.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
