'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import styles from './branches.module.css';
import Header from '../../../components/Header';

interface Branch {
    id: number;
    name: string;
    location: string;
    contactPerson: string;
    phone: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    stocks: any[];
}

export default function BranchesPage() {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        contactPerson: '',
        phone: '',
    });

    const router = useRouter();

    const fetchBranches = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/branches`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setBranches(response.data);
        } catch (error) {
            console.error('Error fetching branches:', error);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchBranches();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/branches`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setIsModalOpen(false);
            setFormData({ name: '', location: '', contactPerson: '', phone: '' });
            fetchBranches();
        } catch (error) {
            console.error('Error creating branch:', error);
        }
    };

    return (
        <>
            <Header title="Branches" />
            <div className={styles.container}>
                <div className={styles.actions}>
                    <button className={styles.addButton} onClick={() => setIsModalOpen(true)}>
                        + Add Branch
                    </button>
                </div>

                <div className={styles.grid}>
                    {branches.map((branch) => (
                        <div key={branch.id} className={styles.card}>
                            <h3>{branch.name}</h3>
                            <p><strong>Location:</strong> {branch.location}</p>
                            <p><strong>Contact:</strong> {branch.contactPerson}</p>
                            <p><strong>Phone:</strong> {branch.phone}</p>
                        </div>
                    ))}
                </div>

                {isModalOpen && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modal}>
                            <h2>Add New Branch</h2>
                            <form onSubmit={handleCreate}>
                                <div className={styles.formGroup}>
                                    <label>Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Location</label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        required
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
                                    <label>Phone</label>
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div className={styles.modalActions}>
                                    <button type="button" onClick={() => setIsModalOpen(false)} className={styles.cancelButton}>
                                        Cancel
                                    </button>
                                    <button type="submit" className={styles.saveButton}>
                                        Save
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
