'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../../../../../components/Header';
import styles from '../../crm.module.css';
import { useParams } from 'next/navigation';

export default function Customer360Page() {
    const { id } = useParams();
    const [customer, setCustomer] = useState<any>(null);
    const [timeline, setTimeline] = useState([]);
    const [insights, setInsights] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('timeline');
    const [interactionNote, setInteractionNote] = useState('');
    const [interactionType, setInteractionType] = useState('CALL');

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const [custRes, timelineRes, insightsRes] = await Promise.all([
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/customers/${id}`, { headers }),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/customers/${id}/timeline`, { headers }),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/customers/${id}/insights`, { headers }),
            ]);

            setCustomer(custRes.data);
            setTimeline(timelineRes.data);
            setInsights(insightsRes.data);
        } catch (error) {
            console.error('Failed to fetch customer data', error);
        } finally {
            setLoading(false);
        }
    };

    const addInteraction = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/interactions`, {
                customerId: Number(id),
                type: interactionType,
                notes: interactionNote
            }, { headers: { Authorization: `Bearer ${token}` } });

            setInteractionNote('');
            fetchData(); // Refresh timeline
        } catch (error) {
            console.error('Failed to add interaction', error);
            alert('Failed to add interaction');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!customer) return <div>Customer not found</div>;

    return (
        <>
            <Header title={`Customer: ${customer.name}`} />
            <div className={styles.container}>
                {/* Header Card */}
                <div className={styles.section} style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{customer.name}</h2>
                        <div style={{ color: '#666' }}>
                            <span>{customer.phone}</span> • <span>{customer.email}</span>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>
                            ₹{Number(insights?.totalSpend || 0).toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#666' }}>Total Lifetime Value</div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                    <button className={styles.actionBtn} onClick={() => window.open(`tel:${customer.phone}`)}>📞 Call</button>
                    <button className={styles.actionBtn} style={{ background: '#25D366' }} onClick={() => window.open(`https://wa.me/${customer.phone}`)}>💬 WhatsApp</button>
                    <button className={styles.actionBtn} style={{ background: '#EA4335' }} onClick={() => window.open(`mailto:${customer.email}`)}>✉️ Email</button>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: '1.5rem' }}>
                    {['timeline', 'interactions', 'sales', 'tickets', 'follow_ups', 'complaints'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '0.75rem 1.5rem',
                                border: 'none',
                                background: 'none',
                                borderBottom: activeTab === tab ? '2px solid #2563eb' : 'none',
                                color: activeTab === tab ? '#2563eb' : '#666',
                                fontWeight: 500,
                                cursor: 'pointer',
                                textTransform: 'capitalize'
                            }}
                        >
                            {tab.replace('_', ' ')}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className={styles.section} style={{ padding: '1.5rem' }}>
                    {activeTab === 'timeline' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {timeline.map((event: any, index) => (
                                <div key={index} style={{ display: 'flex', gap: '1rem' }}>
                                    <div style={{ minWidth: '100px', color: '#666', fontSize: '0.875rem' }}>
                                        {new Date(event.date).toLocaleDateString()}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                                            {event.type === 'SALE' && `🛍️ Purchase: ₹${event.data.totalAmount}`}
                                            {event.type === 'INTERACTION' && `🗣️ ${event.data.type}`}
                                            {event.type === 'TICKET' && `🔧 Service Ticket #${event.data.id}`}
                                            {event.type === 'FOLLOW_UP' && `📅 Follow-up: ${event.data.status}`}
                                            {event.type === 'COMPLAINT' && `⚠️ Complaint: ${event.data.subject}`}
                                        </div>
                                        <div style={{ color: '#4b5563', fontSize: '0.875rem' }}>
                                            {event.type === 'INTERACTION' && event.data.notes}
                                            {event.type === 'TICKET' && event.data.description}
                                            {event.type === 'FOLLOW_UP' && event.data.description}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'interactions' && (
                        <div>
                            <h3>Log Interaction</h3>
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', marginTop: '1rem' }}>
                                <select
                                    value={interactionType}
                                    onChange={(e) => setInteractionType(e.target.value)}
                                    style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }}
                                >
                                    <option value="CALL">Call</option>
                                    <option value="VISIT">Visit</option>
                                    <option value="EMAIL">Email</option>
                                    <option value="WHATSAPP">WhatsApp</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder="Notes..."
                                    value={interactionNote}
                                    onChange={(e) => setInteractionNote(e.target.value)}
                                    style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }}
                                />
                                <button className={styles.actionBtn} onClick={addInteraction}>Add Log</button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'follow_ups' && (
                        <div>
                            <h3>Schedule Follow-up</h3>
                            <p>Follow-up scheduling form coming soon.</p>
                        </div>
                    )}

                    {activeTab === 'complaints' && (
                        <div>
                            <h3>Log Complaint</h3>
                            <p>Complaint logging form coming soon.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
