'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../../../components/Header';
import styles from './crm.module.css';

interface Enquiry {
    id: number;
    name: string;
    email: string;
    phone: string;
    message: string;
    status: string;
    createdAt: string;
}

export default function CRMPage() {
    const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [tempStatus, setTempStatus] = useState<string>('');

    useEffect(() => {
        fetchEnquiries();
    }, []);

    const fetchEnquiries = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/enquiries', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEnquiries(response.data);
        } catch (error) {
            console.error('Failed to fetch enquiries', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (id: number, currentStatus: string) => {
        setEditingId(id);
        setTempStatus(currentStatus);
    };

    const saveStatus = async (id: number) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:3000/enquiries/${id}`,
                { status: tempStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setEditingId(null);
            fetchEnquiries();
        } catch (error) {
            console.error('Failed to update status', error);
            alert('Failed to update status');
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setTempStatus('');
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'NEW': return styles.statusNew;
            case 'CONTACTED': return styles.statusContacted;
            case 'CONVERTED': return styles.statusConverted;
            case 'CLOSED': return styles.statusClosed;
            default: return '';
        }
    };

    return (
        <>
            <Header title="CRM & Enquiries" />
            <div className={styles.container}>
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Contact</th>
                                <th>Message</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td></tr>
                            ) : enquiries.length === 0 ? (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>No enquiries found</td></tr>
                            ) : enquiries.map((enquiry) => (
                                <tr key={enquiry.id}>
                                    <td>#{enquiry.id}</td>
                                    <td>{enquiry.name}</td>
                                    <td>
                                        <div className={styles.email}>{enquiry.email}</div>
                                        <div className={styles.phone}>{enquiry.phone}</div>
                                    </td>
                                    <td className={styles.message}>{enquiry.message}</td>
                                    <td>{new Date(enquiry.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <select
                                            value={editingId === enquiry.id ? tempStatus : enquiry.status}
                                            onChange={(e) => {
                                                setEditingId(enquiry.id);
                                                setTempStatus(e.target.value);
                                            }}
                                            className={`${styles.statusSelect} ${getStatusColor(enquiry.status)}`}
                                        >
                                            <option value="NEW">New</option>
                                            <option value="CONTACTED">Contacted</option>
                                            <option value="CONVERTED">Converted</option>
                                            <option value="CLOSED">Closed</option>
                                        </select>
                                    </td>
                                    <td>
                                        {editingId === enquiry.id ? (
                                            <>
                                                <button
                                                    className={styles.saveBtn}
                                                    onClick={() => saveStatus(enquiry.id)}
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    className={styles.cancelBtn}
                                                    onClick={cancelEdit}
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <button className={styles.actionBtn}>View</button>
                                        )}
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
