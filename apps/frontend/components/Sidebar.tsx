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
    className = {`${styles.link} ${pathname === item.path ? styles.active : ''}`}
                    >
    { item.name }
                    </Link >
                ))}
            </nav >
    <div className={styles.footer}>
        <button className={styles.logoutBtn} onClick={() => {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }}>
            Logout
        </button>
    </div>
        </aside >
    );
}
