"use client";

import { useState, useEffect } from 'react';
import { Icons } from '@/components/Icons';
import { getClients, Client, getSubscribers, Subscriber } from '@/lib/firebaseDb';
import styles from '../Orders.module.css';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [activeTab, setActiveTab] = useState<'buyers' | 'subscribers'>('buyers');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getClients(), getSubscribers()]).then(([clientData, subData]) => {
      setClients(clientData);
      setSubscribers(subData);
      setLoading(false);
    });
  }, []);

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const filteredSubscribers = subscribers.filter(s =>
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const exportClientsCSV = () => {
    const rows = [
      ['ID', 'Name', 'Phone', 'Email', 'Address', 'Last Order ID', 'Date Joined'],
      ...clients.map(c => [c.id, c.name, c.phone, c.email, c.address, c.lastOrder, c.date])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'clients_report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportSubscribersCSV = () => {
    const rows = [
      ['Subscriber ID', 'Email Address', 'Date Subscribed'],
      ...subscribers.map(s => [s.id, s.email, s.date])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'newsletter_subscribers.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading clients from Firestore...</div>;
  }

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Icons.Clients /> Customer Registry & Leads
        </h1>
        {activeTab === 'buyers' ? (
          <button className="btn-primary" onClick={exportClientsCSV} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icons.Export /> Export Clients CSV
          </button>
        ) : (
          <button className="btn-primary" onClick={exportSubscribersCSV} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icons.Export /> Export Subscribers CSV
          </button>
        )}
      </div>

      {/* Tabs Selector */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', marginBottom: '2rem', paddingBottom: '0.5rem' }}>
        <button 
          onClick={() => { setActiveTab('buyers'); setSearch(''); }}
          style={{
            background: 'none', border: 'none', padding: '10px 16px', fontSize: '1rem', fontWeight: 600,
            color: activeTab === 'buyers' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'buyers' ? '2px solid var(--primary)' : '2px solid transparent',
            cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s'
          }}
        >
          👤 Buyers Database ({clients.length})
        </button>
        <button 
          onClick={() => { setActiveTab('subscribers'); setSearch(''); }}
          style={{
            background: 'none', border: 'none', padding: '10px 16px', fontSize: '1rem', fontWeight: 600,
            color: activeTab === 'subscribers' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'subscribers' ? '2px solid var(--primary)' : '2px solid transparent',
            cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s'
          }}
        >
          ✉️ Newsletter Subscribers ({subscribers.length})
        </button>
      </div>

      {/* Stats Cards */}
      {activeTab === 'buyers' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
          {[
            { label: 'Total Buyer Clients', value: clients.length, color: 'var(--primary)' },
            { label: 'Active Buyers', value: clients.filter(c => c.lastOrder).length, color: '#f59e0b' },
            { label: 'Latest Joined', value: clients[0]?.date || '—', color: '#10b981' },
          ].map(stat => (
            <div key={stat.label} className="card" style={{ padding: '1.5rem' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{stat.label}</p>
              <p style={{ fontSize: '1.8rem', fontWeight: 700, color: stat.color }}>{stat.value}</p>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
          {[
            { label: 'Total Email Leads', value: subscribers.length, color: 'var(--primary)' },
            { label: 'Joined This Month', value: subscribers.filter(s => s.date.startsWith(new Date().toISOString().slice(0, 7))).length, color: '#f59e0b' },
            { label: 'Latest Signup', value: subscribers[0]?.email || '—', color: '#10b981' },
          ].map(stat => (
            <div key={stat.label} className="card" style={{ padding: '1.5rem' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{stat.label}</p>
              <p style={{ fontSize: '1.8rem', fontWeight: 700, color: stat.color, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={stat.value.toString()}>{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search Filter */}
      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
          <Icons.Search />
        </div>
        <input
          id="clients-search"
          name="clients-search"
          type="text"
          aria-label="Search clients"
          placeholder={activeTab === 'buyers' ? "Search by name, phone or email..." : "Search by email address..."}
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', padding: '12px 16px 12px 44px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-main)', fontFamily: 'Outfit, sans-serif', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }}
        />
      </div>

      {/* Database Tables */}
      <div className={styles.tableContainer}>
        {activeTab === 'buyers' ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Name</th>
                <th className={styles.th}>Email</th>
                <th className={styles.th}>Phone</th>
                <th className={styles.th}>Address</th>
                <th className={styles.th}>Last Order ID</th>
                <th className={styles.th}>Date Joined</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.length === 0 ? (
                <tr><td colSpan={6} className={styles.td} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No buyers yet. Buyers appear here when they place orders.</td></tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id} className={styles.row}>
                    <td className={styles.td}><strong>{client.name}</strong></td>
                    <td className={styles.td}>{client.email}</td>
                    <td className={styles.td}>{client.phone}</td>
                    <td className={styles.td}>{client.address}</td>
                    <td className={styles.td}><span className={styles.statusReady}>{client.lastOrder.slice(-6).toUpperCase()}</span></td>
                    <td className={styles.td}>{client.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Email Address</th>
                <th className={styles.th}>Date Subscribed</th>
                <th className={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscribers.length === 0 ? (
                <tr><td colSpan={3} className={styles.td} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No newsletter subscribers yet. Submissions from buyer landing pages will appear here.</td></tr>
              ) : (
                filteredSubscribers.map((sub) => (
                  <tr key={sub.id} className={styles.row}>
                    <td className={styles.td}><strong>{sub.email}</strong></td>
                    <td className={styles.td}>{sub.date}</td>
                    <td className={styles.td}><span className={styles.statusReady}>Active Lead</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
