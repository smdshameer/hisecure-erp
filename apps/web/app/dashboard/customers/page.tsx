'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../../../components/Header';
import styles from './customers.module.css';

interface Customer {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    gstin?: string;
    state?: string;
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [customerForm, setCustomerForm] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        gstin: '',
        state: ''
    });

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3005/customers', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCustomers(response.data);
        } catch (error) {
            console.error('Failed to fetch customers', error);
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditingCustomer(null);
        setCustomerForm({ name: '', email: '', phone: '', address: '', gstin: '', state: '' });
        setShowModal(true);
    };

    const openEditModal = (customer: Customer) => {
        setEditingCustomer(customer);
        setCustomerForm({
            name: customer.name,
            email: customer.email || '',
            phone: customer.phone,
            address: customer.address || '',
            gstin: customer.gstin || '',
            state: customer.state || ''
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCustomer) {
            await updateCustomer();
        } else {
            await createCustomer();
        }
    };

    const createCustomer = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:3005/customers', customerForm, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowModal(false);
            setCustomerForm({ name: '', email: '', phone: '', address: '', gstin: '', state: '' });
            fetchCustomers();
            alert('Customer created successfully!');
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to create customer';
            if (errorMessage.includes('already exists')) {
                alert('❌ Customer already exists with this email or phone number!');
            } else {
                alert('Failed to create customer: ' + errorMessage);
            }
        }
    };

    const updateCustomer = async () => {
        if (!editingCustomer) return;
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:3005/customers/${editingCustomer.id}`, customerForm, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowModal(false);
            setEditingCustomer(null);
            setCustomerForm({ name: '', email: '', phone: '', address: '', gstin: '', state: '' });
            fetchCustomers();
            alert('Customer updated successfully!');
        } catch (error: any) {
            alert('Failed to update customer: ' + (error.response?.data?.message || error.message));
        }
    };

    const deleteCustomer = async (id: number, name: string) => {
        console.log('Delete button clicked for customer:', id, name);
        if (!confirm(`Are you sure you want to delete customer "${name}"?`)) {
            console.log('User cancelled deletion');
            return;
        }
        console.log('User confirmed deletion, proceeding...');
        try {
            const token = localStorage.getItem('token');
            console.log('Token:', token ? 'Found' : 'Missing');
            const response = await axios.delete(`http://localhost:3005/customers/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Delete response:', response.data);
            fetchCustomers();
            alert('Customer deleted successfully!');
        } catch (error: any) {
            console.error('Delete error:', error);
            alert('Failed to delete customer: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <>
            <Header title="Customer Management" />
            <div className={styles.container}>
                <div className={styles.actions}>
                    <button className={styles.addButton} onClick={openCreateModal}>
                        + Add Customer
                    </button>
                </div>

                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Phone</th>
                                <th>Email</th>
                                <th>Address</th>
                                <th>GSTIN</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td></tr>
                            ) : customers.length === 0 ? (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>No customers found</td></tr>
                            ) : customers.map((customer) => (
                                <tr key={customer.id}>
                                    <td>#{customer.id}</td>
                                    <td>{customer.name}</td>
                                    <td>{customer.phone}</td>
                                    <td>{customer.email || '-'}</td>
                                    <td>{customer.address || '-'}</td>
                                    <td>{customer.gstin || '-'}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                className={styles.editBtn}
                                                onClick={() => openEditModal(customer)}
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button
                                                className={styles.deleteBtn}
                                                onClick={() => deleteCustomer(customer.id, customer.name)}
                                            >
                                                🗑️ Delete
                                            </button>
                                        </div>
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
                        <h2>{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label>Customer Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={customerForm.name}
                                    onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Email *</label>
                                <input
                                    type="email"
                                    required
                                    value={customerForm.email}
                                    onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Phone *</label>
                                <input
                                    type="text"
                                    required
                                    value={customerForm.phone}
                                    onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Address</label>
                                <input
                                    type="text"
                                    value={customerForm.address}
                                    onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>GSTIN</label>
                                <input
                                    type="text"
                                    value={customerForm.gstin}
                                    onChange={(e) => setCustomerForm({ ...customerForm, gstin: e.target.value })}
                                    placeholder="GST Identification Number"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>State</label>
                                <input
                                    type="text"
                                    value={customerForm.state}
                                    onChange={(e) => setCustomerForm({ ...customerForm, state: e.target.value })}
                                    placeholder="State (for tax calculation)"
                                />
                            </div>
                            <div className={styles.modalActions}>
                                <button
                                    type="button"
                                    className={styles.cancelBtn}
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className={styles.submitBtn}>
                                    SAVE
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
