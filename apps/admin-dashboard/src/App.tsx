import React, { useState } from 'react';

// Premium aesthetics: Deep dark mode, vibrant accents, glassmorphism.
const styles = {
  container: {
    fontFamily: "'Inter', sans-serif",
    backgroundColor: '#0f111a',
    color: '#e2e8f0',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  header: {
    padding: '24px 48px',
    background: 'rgba(255, 255, 255, 0.02)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backdropFilter: 'blur(12px)',
  },
  title: {
    fontSize: '24px',
    fontWeight: 600,
    margin: 0,
    background: 'linear-gradient(90deg, #818cf8 0%, #c084fc 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  buttonPrimary: {
    backgroundColor: '#6366f1',
    color: '#ffffff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
  },
  main: {
    padding: '48px',
    flex: 1,
    display: 'grid',
    gridTemplateColumns: '1fr 3fr',
    gap: '32px',
  },
  sidebar: {
    background: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    padding: '24px',
  },
  contentArea: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    padding: '32px',
    backdropFilter: 'blur(12px)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  },
  th: {
    textAlign: 'left' as const,
    padding: '16px',
    color: '#94a3b8',
    fontSize: '12px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  td: {
    padding: '16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.02)',
    fontSize: '14px',
  },
  badge: {
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  badgePublished: {
    background: 'rgba(16, 185, 129, 0.1)',
    color: '#34d399',
    border: '1px solid rgba(16, 185, 129, 0.2)',
  },
  badgeDraft: {
    background: 'rgba(245, 158, 11, 0.1)',
    color: '#fbbf24',
    border: '1px solid rgba(245, 158, 11, 0.2)',
  }
};

const MOCK_SOPS = [
  { id: 1, title: 'Salesforce Opportunity Creation', targetApp: 'salesforce.com', status: 'PUBLISHED', lastUpdated: '2 hours ago' },
  { id: 2, title: 'Jira Ticket Triage Rules', targetApp: 'jira.atlassian.com', status: 'DRAFT', lastUpdated: '1 day ago' },
  { id: 3, title: 'Workday Time-off Request', targetApp: 'workday.com', status: 'PUBLISHED', lastUpdated: '3 days ago' },
];

export const Dashboard: React.FC = () => {
  const [sops, setSops] = useState(MOCK_SOPS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', targetApp: '', content: '' });

  const handleCreateSop = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:3000/v1/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid_token' // Satisfy mock auth
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        const data = await response.json();
        // Prepend the new SOP to the table
        setSops([{
          id: Math.random(),
          title: data.title,
          targetApp: formData.targetApp,
          status: data.status,
          lastUpdated: 'Just now'
        }, ...sops]);
        
        setIsModalOpen(false);
        setFormData({ title: '', targetApp: '', content: '' });
      }
    } catch (error) {
      console.error('Failed to create SOP:', error);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>JIT Workflow Admin</h1>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: '#94a3b8' }}>Workspace: Engineering</span>
          <button 
            style={styles.buttonPrimary}
            onClick={() => setIsModalOpen(true)}
            onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            + Create SOP
          </button>
        </div>
      </header>

      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
        }}>
          <div style={{
            background: '#1e293b', padding: '32px', borderRadius: '16px',
            width: '400px', border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '20px' }}>Create New SOP</h2>
            <form onSubmit={handleCreateSop} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input 
                type="text" placeholder="SOP Title" required
                value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} 
              />
              <input 
                type="text" placeholder="Target App (e.g. salesforce.com)" required
                value={formData.targetApp} onChange={e => setFormData({...formData, targetApp: e.target.value})}
                style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} 
              />
              <textarea 
                placeholder="SOP Content / AI Instructions" required rows={4}
                value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})}
                style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} 
              />
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{...styles.buttonPrimary, background: 'transparent', border: '1px solid #475569'}}>Cancel</button>
                <button type="submit" style={styles.buttonPrimary}>Publish</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <main style={styles.main}>
        <aside style={styles.sidebar}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '16px', color: '#e2e8f0' }}>Knowledge Base</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li style={{ color: '#818cf8', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>All SOPs</li>
            <li style={{ color: '#94a3b8', cursor: 'pointer', fontSize: '14px' }}>Drafts</li>
            <li style={{ color: '#94a3b8', cursor: 'pointer', fontSize: '14px' }}>Archived</li>
            <li style={{ color: '#94a3b8', cursor: 'pointer', fontSize: '14px', marginTop: '24px' }}>Detection Rules</li>
            <li style={{ color: '#94a3b8', cursor: 'pointer', fontSize: '14px' }}>Analytics</li>
          </ul>
        </aside>

        <section style={styles.contentArea}>
          <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: 500 }}>Standard Operating Procedures</h2>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Title</th>
                <th style={styles.th}>Target Application</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Last Updated</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sops.map((sop) => (
                <tr key={sop.id}>
                  <td style={{...styles.td, fontWeight: 500, color: '#f8fafc'}}>{sop.title}</td>
                  <td style={{...styles.td, color: '#94a3b8'}}>{sop.targetApp}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge, 
                      ...(sop.status === 'PUBLISHED' ? styles.badgePublished : styles.badgeDraft)
                    }}>
                      {sop.status}
                    </span>
                  </td>
                  <td style={{...styles.td, color: '#64748b'}}>{sop.lastUpdated}</td>
                  <td style={styles.td}>
                    <button style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', borderRadius: '4px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px' }}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
