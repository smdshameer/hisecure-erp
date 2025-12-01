'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';

const menuItems = [
    { name: 'Overview', path: '/dashboard' },
    { name: 'Inventory', path: '/dashboard/inventory' },
    { name: 'Suppliers', path: '/dashboard/suppliers' },
    { name: 'Purchase Orders', path: '/dashboard/purchase-orders' },
    { name: 'Warranty', path: '/dashboard/warranty' },
    { name: 'Accounting', path: '/dashboard/accounting' },
    { name: 'POS', path: '/dashboard/pos' },
    { name: 'Service Tickets', path: '/dashboard/service' },
    { name: 'Customers', path: '/dashboard/customers' },
    { name: 'Branches', path: '/dashboard/branches' },
    { name: 'Transfers', path: '/dashboard/transfers' },
    { name: 'CRM', path: '/dashboard/crm' },
    { name: 'Reports', path: '/dashboard/reports' },
    { name: 'Settings', path: '/dashboard/settings' },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo}>
                <h2>Hi Secure</h2>
            </div>
            <nav className={styles.nav}>
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        href={item.path}
                        className={`${styles.link} ${pathname === item.path ? styles.active : ''}`}
                    >
                        {item.name}
                    </Link>
                ))}
            </nav>
            <div className={styles.footer}>
                <button className={styles.logoutBtn} onClick={() => {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                }}>
                    Logout
                </button>
            </div>
        </aside>
    );
}
