'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../../../components/Header';
import PaymentModal from '../../../components/PaymentModal';
import styles from './pos.module.css';

interface Product {
    id: number;
    sku: string;
    name: string;
    price: string;
    stockQuantity: number;
    gstRate: number;
}

interface CartItem extends Product {
    quantity: number;
}

export default function POSPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'UPI'>('CASH');
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/products`);
            setProducts(response.data);
        } catch (error) {
            console.error('Failed to fetch products', error);
        }
    };

    const addToCart = (product: Product) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.id === product.id);
            if (existing) {
                return prev.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId: number) => {
        setCart((prev) => prev.filter((item) => item.id !== productId));
    };

    const updateQuantity = (productId: number, delta: number) => {
        setCart((prev) =>
            prev.map((item) => {
                if (item.id === productId) {
                    const newQty = item.quantity + delta;
                    return newQty > 0 ? { ...item, quantity: newQty } : item;
                }
                return item;
            })
        );
    };

    // Calculate Totals
    const subTotal = cart.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);

    // Calculate Tax (Assuming Intra-state: CGST + SGST)
    const totalTax = cart.reduce((sum, item) => {
        const itemTotal = parseFloat(item.price) * item.quantity;
        const taxRate = item.gstRate || 0; // Default to 0 if not set
        return sum + (itemTotal * taxRate / 100);
    }, 0);

    const cgst = totalTax / 2;
    const sgst = totalTax / 2;
    const grandTotal = subTotal + totalTax;

    const handleCheckout = async () => {
        if (cart.length === 0) return;

        if (paymentMethod !== 'CASH') {
            setShowPaymentModal(true);
            return;
        }

        await processSale();
    };

    const processSale = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            // Use port 3005
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/sales`,
                {
                    paymentMethod,
                    items: cart.map((item) => ({
                        productId: item.id,
                        quantity: item.quantity,
                        price: parseFloat(item.price),
                    })),
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Sale completed successfully!');
            setCart([]);
            fetchProducts(); // Refresh stock
        } catch (error) {
            console.error('Checkout failed', error);
            alert('Checkout failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            <Header title="Point of Sale" />
            <div className={styles.container}>
                <div className={styles.productSection}>
                    <input
                        type="text"
                        placeholder="Search products by Name or SKU..."
                        className={styles.search}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <div className={styles.grid}>
                        {filteredProducts.length === 0 ? (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: '#666' }}>
                                {products.length === 0 ? 'No products found in inventory.' : 'No products match your search.'}
                            </div>
                        ) : (
                            filteredProducts.map((product) => (
                                <div
                                    key={product.id}
                                    className={styles.card}
                                    onClick={() => addToCart(product)}
                                >
                                    <div className={styles.cardHeader}>
                                        <span className={styles.sku}>{product.sku}</span>
                                        <span className={styles.stock}>{product.stockQuantity} in stock</span>
                                    </div>
                                    <h3 className={styles.productName}>{product.name}</h3>
                                    <p className={styles.price}>₹{product.price} <span style={{ fontSize: '0.8em', color: '#666' }}>+ {product.gstRate}% GST</span></p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className={styles.cartSection}>
                    <h2 className={styles.cartTitle}>Current Sale</h2>
                    <div className={styles.cartItems}>
                        {cart.length === 0 ? (
                            <p className={styles.emptyCart}>Cart is empty</p>
                        ) : (
                            cart.map((item) => (
                                <div key={item.id} className={styles.cartItem}>
                                    <div className={styles.itemInfo}>
                                        <h4>{item.name}</h4>
                                        <p>₹{item.price} x {item.quantity}</p>
                                        <span style={{ fontSize: '0.75rem', color: '#888' }}>GST: {item.gstRate}%</span>
                                    </div>
                                    <div className={styles.controls}>
                                        <button onClick={() => updateQuantity(item.id, -1)}>-</button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                                        <button onClick={() => removeFromCart(item.id)} className={styles.remove}>×</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <div className={styles.cartFooter}>
                        <div className={styles.summaryRow}>
                            <span>Subtotal</span>
                            <span>₹{subTotal.toFixed(2)}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>CGST</span>
                            <span>₹{cgst.toFixed(2)}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>SGST</span>
                            <span>₹{sgst.toFixed(2)}</span>
                        </div>
                        <div className={`${styles.summaryRow} ${styles.total}`}>
                            <span>Total</span>
                            <span>₹{grandTotal.toFixed(2)}</span>
                        </div>

                        <div className={styles.paymentMethods}>
                            <label>Payment Method:</label>
                            <select
                                value={paymentMethod}
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                onChange={(e) => setPaymentMethod(e.target.value as any)}
                                className={styles.paymentSelect}
                            >
                                <option value="CASH">Cash</option>
                                <option value="CARD">Card</option>
                                <option value="UPI">UPI</option>
                            </select>
                        </div>

                        <button
                            className={styles.checkoutBtn}
                            onClick={handleCheckout}
                            disabled={cart.length === 0 || loading}
                        >
                            {loading ? 'Processing...' : 'Complete Sale'}
                        </button>
                    </div>
                </div>
            </div>
            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onSuccess={processSale}
                amount={grandTotal}
                method={paymentMethod as 'CARD' | 'UPI'}
            />
        </>
    );
}
