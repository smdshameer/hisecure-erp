'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../../../../components/Header';
import styles from '../crm.module.css';
import { useRouter } from 'next/navigation';

export default function CustomerListPage() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/customers`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCustomers(response.data);
        } catch (error) {
            console.error('Failed to fetch customers', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCustomers = customers.filter((c: any) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <Header title="Customer Master" />
            <div className={styles.container}>
                <div className={styles.sectionHeader}>
                    <input
                        type="text"
                        placeholder="Search by name, phone, email..."
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc', width: '300px' }}
                    />
                    <button
                        className={styles.primaryBtn}
                        onClick={() => alert('Add Customer Modal to be implemented')}
                        style={{ marginLeft: 'auto' }}
                    >
                        + Add Customer
                    </button>
                </div>
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Phone</th>
                                <th>Email</th>
                                <th>Segment</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td></tr>
                            ) : filteredCustomers.length === 0 ? (
                                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No customers found</td></tr>
                            ) : filteredCustomers.map((c: any) => (
                                <tr key={c.id}>
                                    <td>{c.name}</td>
                                    <td>{c.phone}</td>
                                    <td>{c.email || '-'}</td>
                                    <td>
                                        <span style={{
                                            padding: '2px 8px',
                                            borderRadius: '12px',
                                            background: '#e0e7ff',
                                            color: '#3730a3',
                                            fontSize: '0.75rem',
                                            fontWeight: '500'
                                        }}>
                                            {c.segment || 'General'}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className={styles.actionBtn}
                                            onClick={() => router.push(`/dashboard/crm/customers/${c.id}`)}
                                        >
                                            View 360°
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
