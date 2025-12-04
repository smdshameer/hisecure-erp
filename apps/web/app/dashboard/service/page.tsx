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

    return (
        <>
            <Header title="Service & Repair" />
            <div className={styles.container}>
                <div className={styles.actions}>
                    <button className={styles.addButton}>+ New Ticket</button>
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
                                        <button className={styles.actionBtn}>View Details</button>
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
