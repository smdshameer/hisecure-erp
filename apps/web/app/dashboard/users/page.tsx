'use client';

import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import styles from './users.module.css';

interface User {
    id: number;
    email: string;
    name: string;
    role: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [newRole, setNewRole] = useState('');
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) {
                if (res.status === 403) throw new Error('You do not have permission to view users.');
                throw new Error('Failed to fetch users');
            }
            const data = await res.json();
            setUsers(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (user: User) => {
        setEditingUser(user);
        setNewRole(user.role);
        setModalOpen(true);
    };

    const handleSaveRole = async () => {
        if (!editingUser) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/users/${editingUser.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ role: newRole })
            });

            if (res.ok) {
                // Update local state
                setUsers(users.map(u => u.id === editingUser.id ? { ...u, role: newRole } : u));
                setModalOpen(false);
                setEditingUser(null);
            } else {
                alert('Failed to update role');
            }
        } catch (e) {
            console.error(e);
            alert('Error updating role');
        }
    };

    if (loading) return <div className={styles.loading}>Loading users...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <div className={styles.container}>
            <Header title="User Management" />

            <div className={styles.content}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>
                                    <span className={`${styles.badge} ${styles[user.role.toLowerCase()]}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td>
                                    <button className={styles.editBtn} onClick={() => handleEditClick(user)}>Edit Role</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {modalOpen && (
                <div className={styles.modalOverlay} onClick={() => setModalOpen(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <h3>Edit Role for {editingUser?.name}</h3>
                        <select
                            value={newRole}
                            onChange={e => setNewRole(e.target.value)}
                            className={styles.select}
                        >
                            <option value="USER">USER</option>
                            <option value="MANAGER">MANAGER</option>
                            <option value="ADMIN">ADMIN</option>
                        </select>
                        <div className={styles.modalActions}>
                            <button onClick={handleSaveRole} className={styles.saveBtn}>Save</button>
                            <button onClick={() => setModalOpen(false)} className={styles.cancelBtn}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
