'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../../../components/Header';
import styles from './inventory.module.css';

interface Product {
    id: number;
    sku: string;
    name: string;
    category: string;
    price: string;
    costPrice: string;
    stockQuantity: number;
    lowStockThreshold: number;
    hsnCode: string;
    gstRate: number;
    warrantyMonths: number;
}

export default function InventoryPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState<Partial<Product>>({
        sku: '',
        name: '',
        category: '',
        price: '0',
        costPrice: '0',
        stockQuantity: 0,
        lowStockThreshold: 5,
        warrantyMonths: 0,
        hsnCode: '',
        gstRate: 0
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get('http://localhost:3000/products');
            setProducts(response.data);
        } catch (error) {
            console.error('Failed to fetch products', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const payload = {
                ...formData,
                price: Number(formData.price),
                costPrice: Number(formData.costPrice),
                stockQuantity: Number(formData.stockQuantity),
                lowStockThreshold: Number(formData.lowStockThreshold),
                warrantyMonths: Number(formData.warrantyMonths),
                gstRate: Number(formData.gstRate)
            };
            await axios.post('http://localhost:3000/products', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowModal(false);
            fetchProducts();
            setFormData({
                sku: '',
                name: '',
                category: '',
                price: '0',
                costPrice: '0',
                stockQuantity: 0,
                lowStockThreshold: 5,
                warrantyMonths: 0,
                hsnCode: '',
                gstRate: 0
            });
        } catch (error) {
            console.error('Failed to create product', error);
            alert('Failed to create product');
        }
    };

    return (
        <>
            <Header title="Inventory Management" />
            <div className={styles.container}>
                <div className={styles.actions}>
                    <input type="text" placeholder="Search products..." className={styles.search} />
                    <button className={styles.addButton} onClick={() => setShowModal(true)}>+ Add Product</button>
                </div>

                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>SKU</th>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>GST %</th>
                                <th>Stock</th>
                                <th>Warranty</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={9} style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td></tr>
                            ) : products.map((product) => (
                                <tr key={product.id}>
                                    <td>{product.sku}</td>
                                    <td>{product.name}</td>
                                    <td>{product.category || '-'}</td>
                                    <td>₹{product.price}</td>
                                    <td>{product.gstRate}%</td>
                                    <td>{product.stockQuantity}</td>
                                    <td>{product.warrantyMonths > 0 ? `${product.warrantyMonths} Months` : '-'}</td>
                                    <td>
                                        <span className={`${styles.badge} ${product.stockQuantity > product.lowStockThreshold ? styles.success : styles.warning}`}>
                                            {product.stockQuantity > product.lowStockThreshold ? 'In Stock' : 'Low Stock'}
                                        </span>
                                    </td>
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
                        <h2>Add New Product</h2>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label>SKU</label>
                                <input
                                    type="text"
                                    value={formData.sku}
                                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                    required
                                />
                            </div>
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
                                <label>Category</label>
                                <input
                                    type="text"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                />
                            </div>
                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label>Price (Excl. Tax)</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Cost Price</label>
                                    <input
                                        type="number"
                                        value={formData.costPrice}
                                        onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label>HSN Code</label>
                                    <input
                                        type="text"
                                        value={formData.hsnCode}
                                        onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>GST Rate (%)</label>
                                    <input
                                        type="number"
                                        value={formData.gstRate}
                                        onChange={(e) => setFormData({ ...formData, gstRate: Number(e.target.value) })}
                                        placeholder="0, 5, 12, 18, 28"
                                    />
                                </div>
                            </div>
                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label>Stock Quantity</label>
                                    <input
                                        type="number"
                                        value={formData.stockQuantity}
                                        onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Low Stock Threshold</label>
                                    <input
                                        type="number"
                                        value={formData.lowStockThreshold}
                                        onChange={(e) => setFormData({ ...formData, lowStockThreshold: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Warranty (Months)</label>
                                <input
                                    type="number"
                                    value={formData.warrantyMonths}
                                    onChange={(e) => setFormData({ ...formData, warrantyMonths: Number(e.target.value) })}
                                    placeholder="0 for no warranty"
                                />
                            </div>
                            <div className={styles.modalActions}>
                                <button type="button" onClick={() => setShowModal(false)} className={styles.cancelBtn}>Cancel</button>
                                <button type="submit" className={styles.submitBtn}>Save Product</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
