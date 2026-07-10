"use client";

import { useState, useEffect } from 'react';
import { Icons } from '@/components/Icons';
import { getCategories, addCategory, updateCategory, deleteCategory, Category } from '@/lib/firebaseDb';
import styles from '../Orders.module.css';

export default function MenusPage() {
  const [menus, setMenus] = useState<Category[]>([]);
  const [newMenuName, setNewMenuName] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories().then(data => { setMenus(data); setLoading(false); });
  }, []);

  const addMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMenuName.trim()) return;

    const slug = newMenuName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const newMenu = await addCategory({ name: newMenuName, slug, active: true });
    setMenus(prev => [...prev, newMenu]);
    setNewMenuName('');
    setSuccess(`Menu "${newMenu.name}" added!`);
    setTimeout(() => setSuccess(''), 3000);
  };

  const toggleMenu = async (menu: Category) => {
    await updateCategory(menu.id, { active: !menu.active });
    setMenus(prev => prev.map(m => m.id === menu.id ? { ...m, active: !m.active } : m));
  };

  const deleteMenu = async (id: string) => {
    await deleteCategory(id);
    setMenus(prev => prev.filter(m => m.id !== id));
  };

  if (loading) {
    return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading menus from Firestore...</div>;
  }

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Icons.Menu /> Menu Management
        </h1>
      </div>

      <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>Add New Menu Category</h2>
        <form onSubmit={addMenu} style={{ display: 'flex', gap: '1rem' }}>
          <input
            id="menu-name"
            name="menu-name"
            type="text"
            placeholder="e.g. Smart Watches"
            value={newMenuName}
            onChange={e => setNewMenuName(e.target.value)}
            required
            style={{ flex: 1, padding: '12px 16px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', fontFamily: 'Outfit, sans-serif', fontSize: '1rem', outline: 'none' }}
          />
          <button type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Icons.Plus /> Add Menu
          </button>
        </form>
        {success && (
          <div style={{ marginTop: '1rem', color: '#10b981', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icons.Check /> {success}
          </div>
        )}
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Menu Name</th>
              <th className={styles.th}>Slug</th>
              <th className={styles.th}>Status</th>
              <th className={styles.th}>Visibility</th>
              <th className={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {menus.length === 0 ? (
              <tr><td colSpan={5} className={styles.td} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No menus yet.</td></tr>
            ) : (
              menus.map(menu => (
                <tr key={menu.id} className={styles.row}>
                  <td className={styles.td}><strong>{menu.name}</strong></td>
                  <td className={styles.td} style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{menu.slug}</td>
                  <td className={styles.td}>
                    <span className={menu.active ? styles.statusReady : styles.statusPending}>
                      {menu.active ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <button className={styles.actionBtn} onClick={() => toggleMenu(menu)}
                      style={{ borderColor: menu.active ? '#f59e0b' : '#10b981', color: menu.active ? '#f59e0b' : '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {menu.active ? <><Icons.EyeOff /> Hide</> : <><Icons.Eye /> Show</>}
                    </button>
                  </td>
                  <td className={styles.td}>
                    <button onClick={() => deleteMenu(menu.id)}
                      style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Icons.Trash /> Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
