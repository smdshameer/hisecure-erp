'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './transfers.module.css';

interface Branch {
    id: number;
    name: string;
}

interface Product {
    id: number;
    name: string;
    stockQuantity: number;
}

interface Transfer {
    id: number;
    product: Product;
    sourceBranch: Branch | null;
    targetBranch: Branch | null;
    quantity: number;
    createdAt: string;
}

export default function TransfersPage() {
    const [transfers, setTransfers] = useState<Transfer[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        sourceBranchId: '', // Empty string means Main Warehouse
        targetBranchId: '', // Empty string means Main Warehouse
        productId: '',
        quantity: '',
    });

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const [transfersRes, branchesRes, productsRes] = await Promise.all([
                axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/transfers`, { headers }),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/branches`, { headers }),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/products`, { headers }),
            ]);

            setTransfers(transfersRes.data);
            setBranches(branchesRes.data);
            setProducts(productsRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchData();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.productId) {
            alert('Please select a product');
            return;
        }

        if (Number(formData.quantity) < 1) {
            alert('Quantity must be at least 1');
            return;
        }

        const sourceId = formData.sourceBranchId ? Number(formData.sourceBranchId) : undefined;
        const targetId = formData.targetBranchId ? Number(formData.targetBranchId) : undefined;

        if (sourceId === targetId) {
            alert('Source and Target locations cannot be the same');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const payload = {
                sourceBranchId: sourceId,
                targetBranchId: targetId,
                productId: Number(formData.productId),
                quantity: Number(formData.quantity),
            };

            await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/transfers`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setIsModalOpen(false);
            setFormData({ sourceBranchId: '', targetBranchId: '', productId: '', quantity: '' });
            fetchData();
            alert('Transfer successful!');
        } catch (error: any) {
            console.error('Error creating transfer:', error);
            let message = 'Transfer failed.';
            if (error.response?.data?.message) {
                if (Array.isArray(error.response.data.message)) {
                    message += '\n' + error.response.data.message.join('\n');
                } else {
                    message += ' ' + error.response.data.message;
                }
            }
            alert(message);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Stock Transfers</h1>
                <button className={styles.addButton} onClick={() => setIsModalOpen(true)}>
                    New Transfer
                </button>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Product</th>
                            <th>Source</th>
                            <th>Target</th>
                            <th>Quantity</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transfers.map((transfer) => (
                            <tr key={transfer.id}>
                                <td>{new Date(transfer.createdAt).toLocaleDateString()}</td>
                                <td>{transfer.product?.name}</td>
                                <td>{transfer.sourceBranch?.name || 'Main Warehouse'}</td>
                                <td>{transfer.targetBranch?.name || 'Main Warehouse'}</td>
                                <td>{transfer.quantity}</td>
                                <td>
                                    <span className={styles.statusCompleted}>Completed</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2>New Stock Transfer</h2>
                        <form onSubmit={handleCreate}>
                            <div className={styles.formGroup}>
                                <label>Source Location</label>
                                <select
                                    value={formData.sourceBranchId}
                                    onChange={(e) => setFormData({ ...formData, sourceBranchId: e.target.value })}
                                >
                                    <option value="">Main Warehouse</option>
                                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Target Location</label>
                                <select
                                    value={formData.targetBranchId}
                                    onChange={(e) => setFormData({ ...formData, targetBranchId: e.target.value })}
                                >
                                    <option value="">Main Warehouse</option>
                                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Product</label>
                                <select
                                    value={formData.productId}
                                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                                    required
                                >
                                    <option value="">Select Product</option>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.stockQuantity})</option>)}
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Quantity</label>
                                <input
                                    type="number"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                    required
                                    min="1"
                                />
                            </div>

                            <div className={styles.actions}>
                                <button type="button" onClick={() => setIsModalOpen(false)} className={styles.cancelButton}>
                                    Cancel
                                </button>
                                <button type="submit" className={styles.saveButton}>
                                    Transfer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
