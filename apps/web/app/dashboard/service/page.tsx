'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../../../components/Header';
import styles from './service.module.css';

interface Customer {
    id: number;
    name: string;
    phone: string;
}

interface Ticket {
    id: number;
    description: string;
    status: string;
    createdAt: string;
    customer: Customer;
}

export default function ServicePage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/service-tickets`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTickets(response.data);
        } catch (error) {
            console.error('Failed to fetch tickets', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: number, newStatus: string) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/service-tickets/${id}`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchTickets();
        } catch (error) {
            console.error('Failed to update status', error);
            alert('Failed to update status');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN': return styles.statusOpen;
            case 'IN_PROGRESS': return styles.statusProgress;
            case 'WAITING_FOR_PARTS': return styles.statusWaiting;
            case 'COMPLETED': return styles.statusCompleted;
            default: return '';
        }
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTicket, setNewTicket] = useState({
        customerId: '',
        description: '',
        status: 'OPEN'
    });
    const [customers, setCustomers] = useState<Customer[]>([]);

    useEffect(() => {
        fetchTickets();
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
        }
    };

    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/service-tickets`, {
                customerId: Number(newTicket.customerId),
                description: newTicket.description,
                status: newTicket.status
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsModalOpen(false);
            setNewTicket({ customerId: '', description: '', status: 'OPEN' });
            fetchTickets();
        } catch (error) {
            console.error('Failed to create ticket', error);
            alert('Failed to create ticket');
        }
    };

    return (
        <>
            <Header title="Service & Repair" />
            <div className={styles.container}>
                <div className={styles.actions}>
                    <button className={styles.addButton} onClick={() => setIsModalOpen(true)}>+ New Ticket</button>
                </div>

                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Customer</th>
                                <th>Description</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td></tr>
                            ) : tickets.length === 0 ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>No tickets found</td></tr>
                            ) : tickets.map((ticket) => (
                                <tr key={ticket.id}>
                                    <td>#{ticket.id}</td>
                                    <td>
                                        <div className={styles.customerName}>{ticket.customer?.name}</div>
                                        <div className={styles.customerPhone}>{ticket.customer?.phone}</div>
                                    </td>
                                    <td>{ticket.description}</td>
                                    <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <select
                                            value={ticket.status}
                                            onChange={(e) => updateStatus(ticket.id, e.target.value)}
                                            className={`${styles.statusSelect} ${getStatusColor(ticket.status)}`}
                                        >
                                            <option value="OPEN">Open</option>
                                            <option value="IN_PROGRESS">In Progress</option>
                                            <option value="WAITING_FOR_PARTS">Waiting for Parts</option>
                                            <option value="COMPLETED">Completed</option>
                                        </select>
                                    </td>
                                    <td>
                                        <button
                                            className={styles.actionBtn}
                                            onClick={() => setSelectedTicket(ticket)}
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* New Ticket Modal */}
            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2>New Service Ticket</h2>
                        <form onSubmit={handleCreateTicket}>
                            <div className={styles.formGroup}>
                                <label>Customer</label>
                                <select
                                    required
                                    value={newTicket.customerId}
                                    onChange={(e) => setNewTicket({ ...newTicket, customerId: e.target.value })}
                                >
                                    <option value="">Select Customer</option>
                                    {customers.map(c => (
                                        <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Description</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={newTicket.description}
                                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                                    className={styles.textarea}
                                    placeholder="Describe the issue..."
                                />
                            </div>
                            <div className={styles.modalActions}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className={styles.submitBtn}>Create Ticket</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Details Modal */}
            {selectedTicket && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2>Ticket Details #{selectedTicket.id}</h2>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <p><strong>Customer:</strong> {selectedTicket.customer?.name}</p>
                            <p><strong>Phone:</strong> {selectedTicket.customer?.phone}</p>
                            <p><strong>Date:</strong> {new Date(selectedTicket.createdAt).toLocaleString()}</p>
                            <p><strong>Status:</strong> {selectedTicket.status}</p>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Description</label>
                            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                {selectedTicket.description}
                            </div>
                        </div>
                        <div className={styles.modalActions}>
                            <button
                                type="button"
                                className={styles.submitBtn}
                                onClick={() => setSelectedTicket(null)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
