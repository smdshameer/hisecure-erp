'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../../../components/Header';
import styles from './suppliers.module.css';

interface Supplier {
    id: number;
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    address: string;
    gstin?: string;
    state?: string;
}

export default function SuppliersPage() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        gstin: '',
        state: ''
    });

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3005/suppliers', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuppliers(response.data);
        } catch (error) {
            console.error('Failed to fetch suppliers', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:3005/suppliers', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowModal(false);
            setFormData({ name: '', contactPerson: '', email: '', phone: '', address: '', gstin: '', state: '' });
            fetchSuppliers();
        } catch (error) {
            console.error('Failed to create supplier', error);
            alert('Failed to create supplier');
        }
    };

    return (
        <>
            <Header title="Supplier Management" />
            <div className={styles.container}>
                <div className={styles.actions}>
                    <input type="text" placeholder="Search suppliers..." className={styles.search} />
                    <button className={styles.addButton} onClick={() => setShowModal(true)}>+ Add Supplier</button>
                </div>

                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Contact Person</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Address</th>
                                <th>GSTIN</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td></tr>
                            ) : suppliers.map((supplier) => (
                                <tr key={supplier.id}>
                                    <td>{supplier.name}</td>
                                    <td>{supplier.contactPerson || '-'}</td>
                                    <td>{supplier.email || '-'}</td>
                                    <td>{supplier.phone || '-'}</td>
                                    <td>{supplier.address || '-'}</td>
                                    <td>{supplier.gstin || '-'}</td>
                                    <td>
                                        <button className={styles.actionBtn}>Edit</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2>Add New Supplier</h2>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label>Company Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Contact Person</label>
                                <input
                                    type="text"
                                    value={formData.contactPerson}
                                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Phone</label>
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Address</label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>GSTIN</label>
                                <input
                                    type="text"
                                    value={formData.gstin}
                                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                                    placeholder="GST Identification Number"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>State</label>
                                <input
                                    type="text"
                                    value={formData.state}
                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                    placeholder="State (for tax calculation)"
                                />
                            </div>
                            <div className={styles.modalActions}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className={styles.submitBtn}>Create Supplier</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
