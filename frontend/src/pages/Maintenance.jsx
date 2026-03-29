import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getMaintenanceRequests, getMyRequests, createRequest, sendMessage, updateStatus } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const F = 'Inter, sans-serif';

const Maintenance = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [msgText, setMsgText] = useState('');
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', category: 'electrical', priority: 'medium'
  });

  const fetchData = async () => {
    try {
      const { data } = isAdmin
        ? await getMaintenanceRequests()
        : await getMyRequests();
      setRequests(data);
      if (selected) {
        const updated = data.find(r => r._id === selected._id);
        if (updated) setSelected(updated);
      }
    } catch {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => { fetchData(); }, []);
  const resetForm = () => {
    setForm({ title: '', description: '', category: 'electrical', priority: 'medium' });
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createRequest(form);
      toast.success('Request submitted!');
      resetForm();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    }
  };

  const handleSendMsg = async (e) => {
    e.preventDefault();
    if (!msgText.trim()) return;
    setSending(true);
    try {
      await sendMessage(selected._id, { text: msgText });
      setMsgText('');
      fetchData();
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateStatus(id, { status });
      toast.success(`Status updated to ${status}`);
      fetchData();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const filtered = requests.filter(r =>
    filterStatus === 'all' || r.status === filterStatus
  );

  const priorityColor = { low: '#16a34a', medium: '#d97706', high: '#dc2626' };
  const priorityBg   = { low: '#f0fdf4', medium: '#fffbeb', high: '#fef2f2' };
  const statusColor  = { open: '#2563eb', 'in-progress': '#d97706', resolved: '#16a34a', closed: '#6b7280' };
  const statusBg     = { open: '#eff6ff', 'in-progress': '#fffbeb', resolved: '#f0fdf4', closed: '#f3f4f6' };

  const CATEGORIES = ['electrical', 'plumbing', 'furniture', 'appliance', 'cleaning', 'other'];
  const PRIORITIES = ['low', 'medium', 'high'];
  const STATUSES   = ['open', 'in-progress', 'resolved', 'closed'];

  return (
    <Layout
      title="Maintenance"
      subtitle={isAdmin ? 'Manage all maintenance requests' : 'Submit and track your requests'}
      action={
        !isAdmin && (
          <button
            style={showForm ? {...s.addBtn, backgroundColor: '#6b7280'} : s.addBtn}
            onClick={() => showForm ? resetForm() : setShowForm(true)}
          >
            {showForm ? '✕ Cancel' : '+ New Request'}
          </button>
        )
      }
    >
       <div className="maint-root" style={s.root}>
        {/* ── LEFT PANEL ── */}
        <div className="maint-left" style={s.left}>


          {/* Tenant form */}
          {showForm && !isAdmin && (
            <div style={s.formCard}>
              <h3 style={s.formTitle}>New Request</h3>
              <form onSubmit={handleSubmit}>
                <div style={s.field}>
                  <label style={s.label}>Title</label>
                  <input style={s.input} placeholder="AC not cooling..."
                    value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Description</label>
                  <textarea style={{...s.input, height: '80px', resize: 'vertical'}}
                    placeholder="Describe the issue..."
                    value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
                </div>
                <div style={s.row2}>
                  <div style={s.field}>
                    <label style={s.label}>Category</label>
                    <select style={s.select} value={form.category}
                      onChange={e => setForm({...form, category: e.target.value})}>
                      {CATEGORIES.map(c => (
                        <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Priority</label>
                    <select style={s.select} value={form.priority}
                      onChange={e => setForm({...form, priority: e.target.value})}>
                      {PRIORITIES.map(p => (
                        <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div style={s.formActions}>
                  <button type="button" onClick={resetForm} style={s.cancelBtn}>Cancel</button>
                  <button type="submit" style={s.submitBtn}>Submit →</button>
                </div>
              </form>
            </div>
          )}

          {/* Filter tabs */}
          <div style={s.filterRow}>
            {['all', ...STATUSES].map(st => (
              <button
                key={st}
                style={filterStatus === st ? {...s.filterBtn, ...s.filterBtnActive} : s.filterBtn}
                onClick={() => setFilterStatus(st)}
              >
                {st === 'all' ? 'All' : st.replace('-', ' ')}
                <span style={{
                  ...s.filterCount,
                  backgroundColor: filterStatus === st ? 'rgba(255,255,255,0.25)' : '#f3f4f6',
                  color: filterStatus === st ? 'white' : '#6b7280',
                }}>
                  {st === 'all' ? requests.length : requests.filter(r => r.status === st).length}
                </span>
              </button>
            ))}
          </div>

          {/* Request list */}
          {loading ? (
            <div style={s.loading}>Loading...</div>
          ) : filtered.length === 0 ? (
            <div style={s.empty}>
              <div style={s.emptyIcon}>🔧</div>
              <div style={s.emptyTitle}>No requests</div>
            </div>
          ) : (
            <div style={s.list}>
              {filtered.map(r => (
                <div
                  key={r._id}
                  style={selected?._id === r._id ? {...s.listItem, ...s.listItemActive} : s.listItem}
                  onClick={() => setSelected(r)}
                >
                  <div style={s.listTop}>
                    <div style={s.listTitle}>{r.title}</div>
                    <span style={{...s.priorityPill, backgroundColor: priorityBg[r.priority], color: priorityColor[r.priority]}}>
                      {r.priority}
                    </span>
                  </div>
                  <div style={s.listMeta}>
                    <span style={{...s.statusPill, backgroundColor: statusBg[r.status], color: statusColor[r.status]}}>
                      {r.status.replace('-', ' ')}
                    </span>
                    <span style={s.listCategory}>#{r.category}</span>
                    <span style={s.listDate}>
                      {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  {r.tenant?.user?.name && (
                    <div style={s.listTenant}>👤 {r.tenant.user.name} · Room {r.tenant.room?.roomNumber}</div>
                  )}
                  <div style={s.listMsgCount}>
                    💬 {r.messages?.length || 0} messages
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT PANEL — Chat ── */}
        <div className="maint-right" style={s.right}>
          {!selected ? (
            <div style={s.noSelect}>
              <div style={s.noSelectIcon}>💬</div>
              <div style={s.noSelectTitle}>Select a request</div>
              <div style={s.noSelectText}>Click any request to view details and chat</div>
            </div>
          ) : (
            <div style={s.chatWrap}>

              {/* Chat Header */}
              <div style={s.chatHeader}>
                <div style={s.chatHeaderLeft}>
                  <div style={s.chatTitle}>{selected.title}</div>
                  <div style={s.chatMeta}>
                    <span style={{...s.statusPill, backgroundColor: statusBg[selected.status], color: statusColor[selected.status]}}>
                      {selected.status.replace('-', ' ')}
                    </span>
                    <span style={s.chatCategory}>#{selected.category}</span>
                    <span style={{...s.priorityPill, backgroundColor: priorityBg[selected.priority], color: priorityColor[selected.priority]}}>
                      {selected.priority} priority
                    </span>
                  </div>
                </div>
                {isAdmin && (
                  <select
                    style={s.statusSelect}
                    value={selected.status}
                    onChange={e => handleStatusChange(selected._id, e.target.value)}
                  >
                    {STATUSES.map(st => (
                      <option key={st} value={st}>{st.replace('-', ' ')}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Description */}
              <div style={s.descBox}>
                <div style={s.descLabel}>Description</div>
                <div style={s.descText}>{selected.description}</div>
                {selected.tenant?.user?.name && (
                  <div style={s.descTenant}>
                    Submitted by <strong>{selected.tenant.user.name}</strong> · Room {selected.tenant.room?.roomNumber} · Bed {selected.tenant.bedNumber}
                  </div>
                )}
              </div>

              {/* Messages */}
              <div style={s.messages}>
                {(!selected.messages || selected.messages.length === 0) ? (
                  <div style={s.noMsg}>No messages yet. Start the conversation.</div>
                ) : (
                  selected.messages.map((msg, i) => {
                    const isMe = msg.senderRole === (isAdmin ? 'admin' : 'tenant');
                    return (
                      <div key={i} style={isMe ? {...s.msgRow, justifyContent: 'flex-end'} : s.msgRow}>
                        {!isMe && (
                          <div style={s.msgAvatar}>
                            {msg.senderRole === 'admin' ? 'A' : 'T'}
                          </div>
                        )}
                        <div style={isMe ? {...s.msgBubble, ...s.msgBubbleMe} : s.msgBubble}>
                          <div style={s.msgText}>{msg.text}</div>
                          <div style={s.msgTime}>
                            {new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        {isMe && (
                          <div style={{...s.msgAvatar, backgroundColor: '#1e40af'}}>
                            {isAdmin ? 'A' : 'T'}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Message Input */}
              {selected.status !== 'closed' && (
                <form onSubmit={handleSendMsg} style={s.msgForm}>
                  <input
                    style={s.msgInput}
                    placeholder="Type a message..."
                    value={msgText}
                    onChange={e => setMsgText(e.target.value)}
                  />
                  <button type="submit" style={s.sendBtn} disabled={sending}>
                    {sending ? '...' : 'Send →'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

const s = {
  root: { display: 'flex', gap: '20px', height: 'calc(100vh - 140px)' },
  left: { width: '360px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' },
  right: { flex: 1, backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden', display: 'flex', flexDirection: 'column' },

  addBtn: { padding: '9px 18px', backgroundColor: '#1e40af', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: F },

  formCard: { backgroundColor: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', flexShrink: 0 },
  formTitle: { fontSize: '14px', fontWeight: '700', color: '#111827', marginBottom: '16px', fontFamily: F },
  field: { display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '12px' },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  label: { fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: F },
  input: { padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', fontFamily: F, color: '#111827', outline: 'none', backgroundColor: '#fafafa' },
  select: { padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', fontFamily: F, color: '#111827', outline: 'none', backgroundColor: '#fafafa', cursor: 'pointer' },
  formActions: { display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' },
  cancelBtn: { padding: '8px 16px', backgroundColor: 'white', color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: F },
  submitBtn: { padding: '8px 16px', backgroundColor: '#1e40af', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: F },

  filterRow: { display: 'flex', gap: '4px', flexWrap: 'wrap', flexShrink: 0 },
  filterBtn: { display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 10px', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: 'white', color: '#6b7280', fontSize: '12px', fontWeight: '500', cursor: 'pointer', fontFamily: F },
  filterBtnActive: { backgroundColor: '#1e40af', color: 'white', borderColor: '#1e40af', fontWeight: '600' },
  filterCount: { fontSize: '10px', fontWeight: '700', padding: '1px 6px', borderRadius: '10px' },

  loading: { textAlign: 'center', padding: '40px', color: '#6b7280', fontFamily: F },
  empty: { textAlign: 'center', padding: '40px' },
  emptyIcon: { fontSize: '32px', marginBottom: '8px' },
  emptyTitle: { fontSize: '14px', fontWeight: '600', color: '#6b7280', fontFamily: F },

  list: { display: 'flex', flexDirection: 'column', gap: '8px' },
  listItem: { backgroundColor: 'white', borderRadius: '10px', padding: '14px', border: '1px solid #e5e7eb', cursor: 'pointer', transition: 'all 0.15s' },
  listItemActive: { borderColor: '#2563eb', backgroundColor: '#eff6ff', boxShadow: '0 0 0 2px #bfdbfe' },
  listTop: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' },
  listTitle: { fontSize: '13px', fontWeight: '600', color: '#111827', fontFamily: F, flex: 1 },
  listMeta: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' },
  listCategory: { fontSize: '11px', color: '#9ca3af', fontFamily: F },
  listDate: { fontSize: '11px', color: '#9ca3af', fontFamily: F, marginLeft: 'auto' },
  listTenant: { fontSize: '11px', color: '#6b7280', fontFamily: F, marginBottom: '4px' },
  listMsgCount: { fontSize: '11px', color: '#9ca3af', fontFamily: F },

  priorityPill: { fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px', textTransform: 'capitalize', fontFamily: F, flexShrink: 0 },
  statusPill: { fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px', textTransform: 'capitalize', fontFamily: F },

  noSelect: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' },
  noSelectIcon: { fontSize: '48px' },
  noSelectTitle: { fontSize: '16px', fontWeight: '700', color: '#111827', fontFamily: F },
  noSelectText: { fontSize: '13px', color: '#6b7280', fontFamily: F },

  chatWrap: { display: 'flex', flexDirection: 'column', height: '100%' },
  chatHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #e5e7eb', gap: '12px', flexShrink: 0 },
  chatHeaderLeft: { flex: 1 },
  chatTitle: { fontSize: '15px', fontWeight: '700', color: '#111827', fontFamily: F, marginBottom: '6px' },
  chatMeta: { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' },
  chatCategory: { fontSize: '11px', color: '#9ca3af', fontFamily: F },
  statusSelect: { padding: '7px 12px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '12px', fontFamily: F, color: '#111827', outline: 'none', backgroundColor: '#f9fafb', cursor: 'pointer', flexShrink: 0 },

  descBox: { padding: '14px 20px', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', flexShrink: 0 },
  descLabel: { fontSize: '10px', fontWeight: '700', color: '#9ca3af', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '6px', fontFamily: F },
  descText: { fontSize: '13px', color: '#374151', lineHeight: 1.6, fontFamily: F, marginBottom: '6px' },
  descTenant: { fontSize: '12px', color: '#6b7280', fontFamily: F },

  messages: { flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' },
  noMsg: { textAlign: 'center', color: '#9ca3af', fontSize: '13px', fontFamily: F, padding: '40px 0' },

  msgRow: { display: 'flex', alignItems: 'flex-end', gap: '8px' },
  msgAvatar: { width: '28px', height: '28px', backgroundColor: '#6b7280', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '11px', fontWeight: '700', flexShrink: 0, fontFamily: F },
  msgBubble: { maxWidth: '70%', backgroundColor: '#f3f4f6', padding: '10px 14px', borderRadius: '12px 12px 12px 4px' },
  msgBubbleMe: { backgroundColor: '#1e40af', borderRadius: '12px 12px 4px 12px' },
  msgText: { fontSize: '13px', color: '#111827', lineHeight: 1.5, fontFamily: F },
  msgTime: { fontSize: '10px', color: '#9ca3af', marginTop: '4px', fontFamily: F },

  msgForm: { display: 'flex', gap: '8px', padding: '14px 20px', borderTop: '1px solid #e5e7eb', flexShrink: 0 },
  msgInput: { flex: 1, padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', fontFamily: F, color: '#111827', outline: 'none', backgroundColor: '#fafafa' },
  sendBtn: { padding: '10px 20px', backgroundColor: '#1e40af', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: F },
};

export default Maintenance;