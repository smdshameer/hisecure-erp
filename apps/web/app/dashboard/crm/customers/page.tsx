'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../../../../components/Header';
import styles from '../crm-dashboard.module.css';
import { useRouter } from 'next/navigation';

export default function CustomerListPage() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '', segment: 'General' });
    const router = useRouter();

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/customers`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCustomers(response.data);
        } catch (error) {
            console.error('Failed to fetch customers', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCustomer = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/customers`, newCustomer, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsModalOpen(false);
            setNewCustomer({ name: '', phone: '', email: '', segment: 'General' });
            fetchCustomers();
        } catch (error) {
            console.error('Failed to add customer', error);
            alert('Failed to add customer');
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
                        onClick={() => setIsModalOpen(true)}
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
                                        <span className={`${styles.badge} ${c.segment === 'VIP' ? styles.badgeYellow :
                                            c.segment === 'New' ? styles.badgeGreen :
                                                styles.badgeBlue
                                            }`}>
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

            {/* Add Customer Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '400px' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Add New Customer</h2>
                        <form onSubmit={handleAddCustomer}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Name</label>
                                <input
                                    type="text"
                                    required
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }}
                                    value={newCustomer.name}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Phone</label>
                                <input
                                    type="text"
                                    required
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }}
                                    value={newCustomer.phone}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
                                <input
                                    type="email"
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }}
                                    value={newCustomer.email}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                                />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Segment</label>
                                <select
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }}
                                    value={newCustomer.segment}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, segment: e.target.value })}
                                >
                                    <option value="General">General</option>
                                    <option value="VIP">VIP</option>
                                    <option value="New">New</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    style={{ padding: '0.5rem 1rem', border: 'none', background: '#e5e7eb', borderRadius: '6px', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={styles.primaryBtn}
                                >
                                    Save Customer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
