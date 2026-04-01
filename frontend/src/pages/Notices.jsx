import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getNotices, createNotice, deleteNotice } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const F = 'Inter, sans-serif';

const Notices = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [form, setForm] = useState({
    title: '', content: '', type: 'general', isUrgent: false
  });

  const fetchNotices = async () => {
    try {
      const { data } = await getNotices();
      setNotices(data);
    } catch {
      toast.error('Failed to load notices');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchNotices(); }, []);

  const resetForm = () => {
    setForm({ title: '', content: '', type: 'general', isUrgent: false });
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createNotice(form);
      toast.success('Notice posted!');
      resetForm();
      fetchNotices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post notice');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notice?')) return;
    try {
      await deleteNotice(id);
      toast.success('Notice deleted');
      fetchNotices();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const TYPES = ['general', 'maintenance', 'payment', 'event', 'emergency'];

  const typeColor = {
    general:     { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
    maintenance: { color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
    payment:     { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
    event:       { color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
    emergency:   { color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  };

  const typeIcon = {
    general: '📢', maintenance: '🔧', payment: '💳', event: '🎉', emergency: '🚨'
  };

  const filtered = notices.filter(n =>
    filterType === 'all' || n.type === filterType
  );

  return (
    <Layout
      title="Notices"
      subtitle="Announcements for all tenants"
      action={
        isAdmin && (
          <button
            style={showForm ? {...s.addBtn, backgroundColor: '#6b7280'} : s.addBtn}
            onClick={() => showForm ? resetForm() : setShowForm(true)}
          >
            {showForm ? '✕ Cancel' : '+ Post Notice'}
          </button>
        )
      }
    >

      {/* Form */}
      {showForm && isAdmin && (
        <div style={s.formCard}>
          <h3 style={s.formTitle}>+ New Notice</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid-2" style={s.formGrid}>
              <div style={s.field}>
                <label style={s.label}>Title</label>
                <input
                  style={s.input}
                  placeholder="Water supply maintenance on Sunday..."
                  value={form.title}
                  onChange={e => setForm({...form, title: e.target.value})}
                  required
                />
              </div>
              <div style={s.field}>
                <label style={s.label}>Type</label>
                <select
                  style={s.select}
                  value={form.type}
                  onChange={e => setForm({...form, type: e.target.value})}
                >
                  {TYPES.map(t => (
                    <option key={t} value={t}>
                      {typeIcon[t]} {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{...s.field, gridColumn: '1 / -1'}}>
                <label style={s.label}>Content</label>
                <textarea
                  style={{...s.input, height: '100px', resize: 'vertical'}}
                  placeholder="Write the full notice here..."
                  value={form.content}
                  onChange={e => setForm({...form, content: e.target.value})}
                  required
                />
              </div>
            </div>

            {/* Urgent toggle */}
            <div style={s.urgentRow}>
              <div
                style={form.isUrgent ? {...s.urgentToggle, ...s.urgentToggleOn} : s.urgentToggle}
                onClick={() => setForm({...form, isUrgent: !form.isUrgent})}
              >
                <div style={form.isUrgent ? {...s.toggleDot, ...s.toggleDotOn} : s.toggleDot} />
              </div>
              <div>
                <div style={s.urgentLabel}>Mark as Urgent</div>
                <div style={s.urgentSub}>Urgent notices are highlighted in red for all tenants</div>
              </div>
            </div>

            <div style={s.formActions}>
              <button type="button" onClick={resetForm} style={s.cancelBtn}>Cancel</button>
              <button type="submit" style={s.submitBtn}>Post Notice →</button>
            </div>
          </form>
        </div>
      )}

      {/* Filter */}
      <div style={s.filterRow}>
        <div style={s.filterGroup}>
          {['all', ...TYPES].map(t => (
            <button
              key={t}
              style={filterType === t ? {...s.filterBtn, ...s.filterBtnActive} : s.filterBtn}
              onClick={() => setFilterType(t)}
            >
              {t !== 'all' && typeIcon[t]} {t.charAt(0).toUpperCase() + t.slice(1)}
              <span style={{
                ...s.filterCount,
                backgroundColor: filterType === t ? 'rgba(255,255,255,0.25)' : '#f3f4f6',
                color: filterType === t ? 'white' : '#6b7280',
              }}>
                {t === 'all' ? notices.length : notices.filter(n => n.type === t).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Notices */}
      {loading ? (
        <div style={s.loading}>Loading notices...</div>
      ) : filtered.length === 0 ? (
        <div style={s.empty}>
          <div style={s.emptyIcon}>📢</div>
          <div style={s.emptyTitle}>No notices found</div>
          <div style={s.emptyText}>
            {isAdmin ? 'Post your first notice for tenants' : 'No announcements yet'}
          </div>
        </div>
      ) : (
       <div className="notices-grid" style={s.grid}>
          {filtered.map(n => {
            const tc = typeColor[n.type] || typeColor.general;
            return (
              <div
                key={n._id}
                style={n.isUrgent ? {...s.card, ...s.cardUrgent} : s.card}
              >
                {/* Urgent banner */}
                {n.isUrgent && (
                  <div style={s.urgentBanner}>
                    🚨 URGENT NOTICE
                  </div>
                )}

                {/* Card Header */}
                <div style={s.cardHead}>
                  <div style={{...s.typeIcon, backgroundColor: tc.bg, border: `1px solid ${tc.border}`}}>
                    {typeIcon[n.type]}
                  </div>
                  <div style={s.cardHeadInfo}>
                    <div style={s.cardTitle}>{n.title}</div>
                    <div style={s.cardMeta}>
                      <span style={{...s.typePill, backgroundColor: tc.bg, color: tc.color, border: `1px solid ${tc.border}`}}>
                        {n.type}
                      </span>
                      <span style={s.cardDate}>
                        {new Date(n.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                  {isAdmin && (
                    <button style={s.delBtn} onClick={() => handleDelete(n._id)}>Delete</button>
                  )}
                </div>

                {/* Divider */}
                <div style={s.divider} />

                {/* Content */}
                <p style={s.cardContent}>{n.content}</p>

                {/* Footer */}
                <div style={s.cardFoot}>
                  <span style={s.postedBy}>
                    Posted by {n.createdBy?.name || 'Admin'}
                  </span>
                  {n.isUrgent && (
                    <span style={s.urgentPill}>🚨 Urgent</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
};

const s = {
  addBtn: { padding: '9px 18px', backgroundColor: '#1e40af', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: F },

  formCard: { backgroundColor: 'white', borderRadius: '12px', padding: '24px', marginBottom: '24px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },
  formTitle: { fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '20px', fontFamily: F },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: F },
  input: { padding: '10px 13px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', fontFamily: F, color: '#111827', outline: 'none', backgroundColor: '#fafafa' },
  select: { padding: '10px 13px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', fontFamily: F, color: '#111827', outline: 'none', backgroundColor: '#fafafa', cursor: 'pointer' },

  urgentRow: { display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', backgroundColor: '#fef2f2', borderRadius: '10px', border: '1px solid #fecaca', marginBottom: '16px', cursor: 'pointer' },
  urgentToggle: { width: '40px', height: '22px', backgroundColor: '#e5e7eb', borderRadius: '11px', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 },
  urgentToggleOn: { backgroundColor: '#dc2626' },
  toggleDot: { width: '16px', height: '16px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: '3px', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' },
  toggleDotOn: { left: '21px' },
  urgentLabel: { fontSize: '13px', fontWeight: '600', color: '#dc2626', fontFamily: F },
  urgentSub: { fontSize: '11px', color: '#9ca3af', fontFamily: F, marginTop: '2px' },

  formActions: { display: 'flex', gap: '10px', justifyContent: 'flex-end' },
  cancelBtn: { padding: '9px 20px', backgroundColor: 'white', color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: F },
  submitBtn: { padding: '9px 20px', backgroundColor: '#1e40af', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: F },

  filterRow: { marginBottom: '20px' },
  filterGroup: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  filterBtn: { display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: 'white', color: '#6b7280', fontSize: '12px', fontWeight: '500', cursor: 'pointer', fontFamily: F },
  filterBtnActive: { backgroundColor: '#1e40af', color: 'white', borderColor: '#1e40af', fontWeight: '600' },
  filterCount: { fontSize: '10px', fontWeight: '700', padding: '1px 6px', borderRadius: '10px' },

  loading: { textAlign: 'center', padding: '60px', color: '#6b7280', fontFamily: F },
  empty: { textAlign: 'center', padding: '60px' },
  emptyIcon: { fontSize: '40px', marginBottom: '12px' },
  emptyTitle: { fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '6px', fontFamily: F },
  emptyText: { fontSize: '13px', color: '#6b7280', fontFamily: F },

  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '16px' },

  card: { backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' },
  cardUrgent: { border: '1.5px solid #fca5a5', boxShadow: '0 2px 8px rgba(239,68,68,0.12)' },
  urgentBanner: { backgroundColor: '#dc2626', color: 'white', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', padding: '6px 16px', fontFamily: F },

  cardHead: { display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px 16px 12px' },
  typeIcon: { width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 },
  cardHeadInfo: { flex: 1 },
  cardTitle: { fontSize: '14px', fontWeight: '700', color: '#111827', marginBottom: '6px', fontFamily: F, lineHeight: 1.4 },
  cardMeta: { display: 'flex', alignItems: 'center', gap: '8px' },
  typePill: { fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px', textTransform: 'capitalize', fontFamily: F },
  cardDate: { fontSize: '11px', color: '#9ca3af', fontFamily: F },

  delBtn:  { padding: '6px 14px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: '#dc2626', fontFamily: F },
  divider: { height: '1px', backgroundColor: '#f3f4f6', margin: '0 16px' },
  cardContent: { fontSize: '13px', color: '#374151', lineHeight: 1.7, padding: '12px 16px', fontFamily: F },

  cardFoot: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderTop: '1px solid #f3f4f6', backgroundColor: '#fafafa' },
  postedBy: { fontSize: '11px', color: '#9ca3af', fontFamily: F },
  urgentPill: { fontSize: '11px', fontWeight: '700', backgroundColor: '#fef2f2', color: '#dc2626', padding: '2px 10px', borderRadius: '20px', fontFamily: F },
};

export default Notices;