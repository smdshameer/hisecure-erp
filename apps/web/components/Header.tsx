'use client';

import { useEffect, useState } from 'react';
import styles from './Header.module.css';

export default function Header({ title }: { title: string }) {
    const [user, setUser] = useState<{ name: string; role: string } | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    return (
        <header className={styles.header}>
            <h1 className={styles.title}>{title}</h1>
            <div className={styles.profile}>
                <div className={styles.avatar}>
                    {isMounted ? (user?.name?.charAt(0) || 'U') : 'U'}
                </div>
                <div className={styles.info}>
                    <span className={styles.name}>{isMounted ? (user?.name || 'User') : 'User'}</span>
                    <span className={styles.role}>{isMounted ? (user?.role || 'Guest') : 'Guest'}</span>
                </div>
            </div>
        </header>
    );
}
