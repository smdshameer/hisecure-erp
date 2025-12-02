'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import styles from './login.module.css';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Warm up the backend connection on page load
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3005';
        axios.get(apiUrl).catch(() => {
            // Ignore errors, just trying to wake up the server/DB
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        console.time('loginRequest');

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3005';
            const response = await axios.post(`${apiUrl}/auth/login`, {
                email,
                password,
            });

            console.timeEnd('loginRequest');

            if (response.data.access_token) {
                localStorage.setItem('token', response.data.access_token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                router.push('/dashboard');
            }
        } catch (err: any) {
            console.timeEnd('loginRequest');
            console.error('Login error:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
            setError(`Error: ${errorMessage}`);
            setLoading(false);
        }
        // Note: setLoading(false) is handled in catch or after redirect (component unmounts)
        // But if redirect fails or takes time, we might want to keep loading state?
        // Actually, if we push to router, we shouldn't set loading false immediately to prevent flash.
        // But if error, we must set it false.
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Hi Secure Solutions</h1>
                    <p className={styles.subtitle}>Sign in to your ERP account</p>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="email" className={styles.label}>Email Address</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input}
                            placeholder="admin@example.com"
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="password" className={styles.label}>Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.input}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button type="submit" className={styles.button} disabled={loading} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                        {loading ? <span className={styles.spinner}></span> : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
}
