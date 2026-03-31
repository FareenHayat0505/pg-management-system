import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getPayments, createPayment, markAsPaid, getPaymentSummary, getTenants } from '../services/api';
import toast from 'react-hot-toast';

const F = "'Poppins', sans-serif";
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const Payments = () => {
  const [payments,  setPayments]  = useState([]);
  const [summary,   setSummary]   = useState(null);
  const [tenants,   setTenants]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview | history
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [form, setForm] = useState({
    tenantId: '', amount: '', month: '', year: new Date().getFullYear(), method: 'cash'
  });

  const fetchData = async () => {
    try {
      const [p, s, t] = await Promise.all([getPayments(), getPaymentSummary(), getTenants()]);
      setPayments(p.data);
      setSummary(s.data);
      setTenants(t.data);
    } catch {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
    setForm({ tenantId: '', amount: '', month: '', year: new Date().getFullYear(), method: 'cash' });
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createPayment(form);
      toast.success('Payment record created!');
      resetForm();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create payment');
    }
  };

  const handleMarkPaid = async (id, name) => {
    try {
      await markAsPaid(id, { method: 'cash' });
      toast.success(`Payment marked as paid!`);
      fetchData();
    } catch {
      toast.error('Failed to mark paid');
    }
  };

  // Build tenant payment overview
  const currentMonth = new Date().getMonth() + 1;
  const currentYear  = new Date().getFullYear();

  const tenantOverview = tenants.map(t => {
    const tenantPayments = payments.filter(p => p.tenant?._id === t._id);
    const currentMonthPayment = tenantPayments.find(
      p => p.month === currentMonth && p.year === currentYear
    );
    const lastPayment = tenantPayments.filter(p => p.status === 'paid')
      .sort((a, b) => new Date(b.paidDate) - new Date(a.paidDate))[0];

    const dueDate = new Date(currentYear, currentMonth - 1, 1);
    const today   = new Date();
    const daysOverdue = currentMonthPayment?.status !== 'paid'
      ? Math.max(0, Math.floor((today - dueDate) / (1000*60*60*24)))
      : 0;

    const status = currentMonthPayment
      ? currentMonthPayment.status
      : today > dueDate ? 'overdue' : 'pending';

    return {
      tenant: t,
      currentPayment: currentMonthPayment,
      lastPayment,
      status,
      daysOverdue,
      dueDate,
      totalPaid: tenantPayments.filter(p => p.status === 'paid').length,
      totalPayments: tenantPayments.length,
    };
  });

  const filtered = tenantOverview.filter(t =>
    filterStatus === 'all' || t.status === filterStatus
  );

  const statusColor = { paid: '#16a34a', pending: '#d97706', overdue: '#dc2626' };
  const statusBg    = { paid: '#dcfce7', pending: '#fef9c3', overdue: '#fee2e2' };
  const statusBorder = { paid: '#bbf7d0', pending: '#fde68a', overdue: '#fecaca' };

  // Tenant payment history
  const tenantHistory = selectedTenant
    ? payments.filter(p => p.tenant?._id === selectedTenant._id)
        .sort((a, b) => b.year - a.year || b.month - a.month)
    : [];

  return (
    <Layout
      title="Payments"
      subtitle="Tenant-wise rent tracking"
      action={
        <button
          style={showForm ? {...s.addBtn, backgroundColor: '#6b7280'} : s.addBtn}
          onClick={() => showForm ? resetForm() : setShowForm(true)}
        >
          {showForm ? '✕ Cancel' : '+ Add Payment'}
        </button>
      }
    >

      {/* Summary Cards */}
      {summary && (
        <div className="summary-row" style={s.summaryRow}>
          {[
            { label: 'Total Collected', value: `₹${(summary.totalCollected||0).toLocaleString()}`, color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', icon: '💰' },
            { label: 'Pending Amount',  value: `₹${(summary.totalPending||0).toLocaleString()}`,   color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: '⏳' },
            { label: 'Overdue Amount',  value: `₹${(summary.totalOverdue||0).toLocaleString()}`,   color: '#dc2626', bg: '#fef2f2', border: '#fecaca', icon: '🚨' },
            { label: 'Total Tenants',   value: tenants.length,                                      color: '#1e40af', bg: '#eff6ff', border: '#bfdbfe', icon: '👥' },
          ].map(c => (
            <div key={c.label} className="kpi-card" style={{...s.summaryCard, backgroundColor: c.bg, borderColor: c.border}}>
              <div style={s.summaryTop}>
                <span style={s.summaryIcon}>{c.icon}</span>
                <div style={{...s.summaryVal, color: c.color}}>{c.value}</div>
              </div>
              <div style={s.summaryLbl}>{c.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Add Payment Form */}
      {showForm && (
        <div style={s.formCard}>
          <h3 style={s.formTitle}>+ New Payment Record</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid-2" style={s.formGrid}>
              <div style={s.field}>
                <label style={s.label}>Tenant</label>
                <select style={s.select} value={form.tenantId}
                  onChange={e => {
                    const t = tenants.find(t => t._id === e.target.value);
                    setForm({...form, tenantId: e.target.value, amount: t?.room?.rent || ''});
                  }} required>
                  <option value="">Select tenant...</option>
                  {tenants.map(t => (
                    <option key={t._id} value={t._id}>
                      {t.user?.name} — Room {t.room?.roomNumber} (₹{t.room?.rent?.toLocaleString()}/mo)
                    </option>
                  ))}
                </select>
              </div>
              <div style={s.field}>
                <label style={s.label}>Amount (₹)</label>
                <input style={s.input} type="number" placeholder="8500"
                  value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required />
              </div>
              <div style={s.field}>
                <label style={s.label}>Month</label>
                <select style={s.select} value={form.month}
                  onChange={e => setForm({...form, month: e.target.value})} required>
                  <option value="">Select month...</option>
                  {MONTHS.map((m, i) => (
                    <option key={m} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
              <div style={s.field}>
                <label style={s.label}>Year</label>
                <input style={s.input} type="number" value={form.year}
                  onChange={e => setForm({...form, year: e.target.value})} required />
              </div>
              <div style={s.field}>
                <label style={s.label}>Payment Method</label>
                <select style={s.select} value={form.method}
                  onChange={e => setForm({...form, method: e.target.value})}>
                  {['cash', 'upi', 'bank_transfer', 'cheque'].map(m => (
                    <option key={m} value={m}>{m.replace('_', ' ').toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={s.formActions}>
              <button type="button" onClick={resetForm} style={s.cancelBtn}>Cancel</button>
              <button type="submit" style={s.submitBtn}>Create Payment →</button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div style={s.tabRow}>
        <div style={s.tabs}>
          {[
            { key: 'overview', label: 'Tenant Overview' },
            { key: 'history',  label: 'Payment History' },
          ].map(tab => (
            <button
              key={tab.key}
              style={activeTab === tab.key ? {...s.tab, ...s.tabActive} : s.tab}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filter */}
        <div style={s.filterGroup}>
          {['all', 'paid', 'pending', 'overdue'].map(st => (
            <button
              key={st}
              style={filterStatus === st ? {...s.filterBtn, ...s.filterBtnActive} : s.filterBtn}
              onClick={() => setFilterStatus(st)}
            >
              {st.charAt(0).toUpperCase() + st.slice(1)}
              {st !== 'all' && (
                <span style={{
                  ...s.filterCount,
                  backgroundColor: filterStatus === st ? 'rgba(255,255,255,0.3)' : statusBg[st],
                  color: filterStatus === st ? 'white' : statusColor[st],
                }}>
                  {tenantOverview.filter(t => t.status === st).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === 'overview' && (
        loading ? (
          <div style={s.loading}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={s.empty}>
            <div style={s.emptyIcon}>💳</div>
            <div style={s.emptyTitle}>No tenants found</div>
            <div style={s.emptyText}>Add tenants to track payments</div>
          </div>
        ) : (
          <div className="table-wrap" style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr style={s.thead}>
{['Tenant', 'Room & Bed', 'Monthly Rent', 'Due Date', 'This Month', 'Action'].map(h => (
  <th key={h} style={s.th}>{h}</th>
))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, i) => {
                  const { tenant, currentPayment, status } = item;
                  return (
                    <tr
                      key={tenant._id}
                      className="table-row"
                      style={i % 2 === 0 ? s.trEven : s.trOdd}
                    >

                      {/* Tenant */}
                      <td style={s.td}>
                        <div style={s.tenantCell}>
                          <div style={s.avatar}>{tenant.user?.name?.charAt(0).toUpperCase()}</div>
                          <div>
                            <div style={s.tenantName}>{tenant.user?.name}</div>
                            <div style={s.tenantEmail}>{tenant.user?.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Room */}
                      <td style={s.td}>
                        <div style={s.roomText}>Room {tenant.room?.roomNumber}</div>
                        <div style={s.bedText}>Bed {tenant.bedNumber}</div>
                      </td>

                      {/* Rent */}
                      <td style={s.td}>
                        <div style={s.rentText}>₹{tenant.room?.rent?.toLocaleString()}</div>
                        <div style={s.perMonth}>/month</div>
                      </td>

                      {/* Due Date */}
                      <td style={s.td}>
                        <div style={s.dueDate}>1st {MONTHS_SHORT[currentMonth - 1]}</div>
                        <div style={s.dueYear}>{currentYear}</div>
                      </td>

                      {/* This Month Status */}
                      <td style={s.td}>
                        <span style={{
                          ...s.statusPill,
                          backgroundColor: statusBg[status],
                          color: statusColor[status],
                          border: `1px solid ${statusBorder[status]}`,
                        }}>
                          {status === 'paid' ? '✓ Paid' : status === 'overdue' ? '⚠ Overdue' : '⏳ Pending'}
                        </span>
                      </td>

                   
                      {/* Action */}
                      <td style={s.td}>
  <div style={s.actionCell}>
    {currentPayment && currentPayment.status !== 'paid' ? (
      <button
        style={s.paidBtn}
        onClick={() => handleMarkPaid(currentPayment._id, tenant.user?.name)}
      >
        ✓ Paid
      </button>
    ) : status !== 'paid' ? (
      <button
        style={s.createBtn}
        onClick={() => {
          setForm({
            tenantId: tenant._id,
            amount: tenant.room?.rent || '',
            month: currentMonth,
            year: currentYear,
            method: 'cash'
          });
          setShowForm(true);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      >
        + Add
      </button>
    ) : (
      <span style={s.doneText}>✓</span>
    )}
    <button
      style={s.historyBtn}
      onClick={() => {
        setSelectedTenant(tenant);
        setActiveTab('history');
      }}
    >
      📋
    </button>
  </div>
</td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* ── HISTORY TAB ── */}
      {activeTab === 'history' && (
        <div>
          {/* Tenant selector */}
          <div style={s.historySelectorRow}>
            <select
              style={s.historySelect}
              value={selectedTenant?._id || ''}
              onChange={e => setSelectedTenant(tenants.find(t => t._id === e.target.value) || null)}
            >
              <option value="">Select tenant to view history...</option>
              {tenants.map(t => (
                <option key={t._id} value={t._id}>
                  {t.user?.name} — Room {t.room?.roomNumber}
                </option>
              ))}
            </select>
          </div>

          {!selectedTenant ? (
            <div style={s.empty}>
              <div style={s.emptyIcon}>📋</div>
              <div style={s.emptyTitle}>Select a tenant</div>
              <div style={s.emptyText}>Choose a tenant above to view their payment timeline</div>
            </div>
          ) : (
            <div style={s.historyWrap}>

              {/* Tenant Info Header */}
              <div style={s.historyHeader}>
                <div style={s.historyAvatar}>
                  {selectedTenant.user?.name?.charAt(0).toUpperCase()}
                </div>
                <div style={s.historyInfo}>
                  <div style={s.historyName}>{selectedTenant.user?.name}</div>
                  <div style={s.historyMeta}>
                    Room {selectedTenant.room?.roomNumber} · Bed {selectedTenant.bedNumber} · ₹{selectedTenant.room?.rent?.toLocaleString()}/month
                  </div>
                </div>
                <div style={s.historyStats}>
                  <div style={s.historyStat}>
                    <div style={{...s.historyStatVal, color: '#16a34a'}}>{tenantHistory.filter(p => p.status === 'paid').length}</div>
                    <div style={s.historyStatLbl}>Paid</div>
                  </div>
                  <div style={s.historyStat}>
                    <div style={{...s.historyStatVal, color: '#d97706'}}>{tenantHistory.filter(p => p.status === 'pending').length}</div>
                    <div style={s.historyStatLbl}>Pending</div>
                  </div>
                  <div style={s.historyStat}>
                    <div style={{...s.historyStatVal, color: '#dc2626'}}>{tenantHistory.filter(p => p.status === 'overdue').length}</div>
                    <div style={s.historyStatLbl}>Overdue</div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              {tenantHistory.length === 0 ? (
                <div style={s.empty}>
                  <div style={s.emptyIcon}>📭</div>
                  <div style={s.emptyTitle}>No payment records</div>
                  <div style={s.emptyText}>No payments found for this tenant</div>
                </div>
              ) : (
                <div style={s.timeline}>
                  {tenantHistory.map((p, i) => (
                    <div key={p._id} style={s.timelineItem}>
                      {/* Line */}
                      <div style={s.timelineLeft}>
                        <div style={{...s.timelineDot, backgroundColor: statusColor[p.status]}} />
                        {i < tenantHistory.length - 1 && <div style={s.timelineLine} />}
                      </div>

                      {/* Content */}
                      <div style={s.timelineContent}>
                        <div style={s.timelineTop}>
                          <div style={s.timelineMonth}>
                            {MONTHS[p.month - 1]} {p.year}
                          </div>
                          <span style={{
                            ...s.statusPill,
                            backgroundColor: statusBg[p.status],
                            color: statusColor[p.status],
                            border: `1px solid ${statusBorder[p.status]}`,
                          }}>
                            {p.status === 'paid' ? '✓ Paid' : p.status === 'overdue' ? '⚠ Overdue' : '⏳ Pending'}
                          </span>
                        </div>
                        <div style={s.timelineDetails}>
                          <span style={s.timelineAmount}>₹{p.amount?.toLocaleString()}</span>
                          {p.paidDate && (
                            <span style={s.timelinePaidDate}>
                              Paid on {new Date(p.paidDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          )}
                          {p.method && (
                            <span style={s.timelineMethod}>
                              {p.method.replace('_', ' ').toUpperCase()}
                            </span>
                          )}
                        </div>
                        {p.status !== 'paid' && (
                          <button
                            style={s.paidBtn}
                            onClick={() => handleMarkPaid(p._id, selectedTenant.user?.name)}
                          >
                            Mark as Paid
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Layout>
  );
};

const s = {
  summaryRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
  summaryCard: { padding: '18px 20px', borderRadius: '12px', border: '1px solid' },
  summaryTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' },
  summaryIcon: { fontSize: '20px' },
  summaryVal: { fontSize: '22px', fontWeight: '800', letterSpacing: '-0.5px', fontFamily: F },
  summaryLbl: { fontSize: '12px', color: '#6b7280', fontWeight: '500', fontFamily: F },

  addBtn: { padding: '9px 18px', backgroundColor: '#1e40af', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: F },
  formCard: { backgroundColor: 'white', borderRadius: '12px', padding: '24px', marginBottom: '24px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },
  formTitle: { fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '20px', fontFamily: F },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' },
  field: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: F },
  input: { padding: '10px 13px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', fontFamily: F, color: '#111827', outline: 'none', backgroundColor: '#fafafa' },
  select: { padding: '10px 13px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', fontFamily: F, color: '#111827', outline: 'none', backgroundColor: '#fafafa', cursor: 'pointer' },
  formActions: { display: 'flex', gap: '10px', justifyContent: 'flex-end' },
  cancelBtn: { padding: '9px 20px', backgroundColor: 'white', color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: F },
  submitBtn: { padding: '9px 20px', backgroundColor: '#1e40af', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: F },

  tabRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' },
  tabs: { display: 'flex', gap: '4px', backgroundColor: '#f3f4f6', padding: '4px', borderRadius: '10px' },
  tab: { padding: '8px 18px', border: 'none', borderRadius: '8px', backgroundColor: 'transparent', color: '#6b7280', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: F, transition: 'all 0.15s' },
  tabActive: { backgroundColor: 'white', color: '#111827', fontWeight: '700', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  filterGroup: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  filterBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: 'white', color: '#6b7280', fontSize: '12px', fontWeight: '500', cursor: 'pointer', fontFamily: F },
  filterBtnActive: { backgroundColor: '#1e40af', color: 'white', borderColor: '#1e40af', fontWeight: '600' },
  filterCount: { fontSize: '10px', fontWeight: '700', padding: '1px 6px', borderRadius: '10px' },

  loading: { textAlign: 'center', padding: '60px', color: '#6b7280', fontFamily: F },
  empty: { textAlign: 'center', padding: '60px' },
  emptyIcon: { fontSize: '40px', marginBottom: '12px' },
  emptyTitle: { fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '6px', fontFamily: F },
  emptyText: { fontSize: '13px', color: '#6b7280', fontFamily: F },

  tableWrap: { backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { backgroundColor: '#f9fafb' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#6b7280', letterSpacing: '0.5px', textTransform: 'uppercase', fontFamily: F, borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' },
  td: { padding: '14px 16px', fontSize: '13px', color: '#374151', fontFamily: F, verticalAlign: 'middle' },
  trEven: { backgroundColor: 'white', borderBottom: '1px solid #f9fafb' },
  trOdd: { backgroundColor: '#fafafa', borderBottom: '1px solid #f3f4f6' },

  tenantCell: { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar: { width: '34px', height: '34px', backgroundColor: '#1e40af', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '13px', fontWeight: '700', flexShrink: 0 },
  tenantName: { fontSize: '13px', fontWeight: '600', color: '#111827', fontFamily: F },
  tenantEmail: { fontSize: '11px', color: '#9ca3af', fontFamily: F },
  roomText: { fontSize: '13px', fontWeight: '600', color: '#1e40af', fontFamily: F },
  bedText: { fontSize: '11px', color: '#6b7280', fontFamily: F },
  rentText: { fontSize: '14px', fontWeight: '700', color: '#111827', fontFamily: F },
  perMonth: { fontSize: '11px', color: '#9ca3af', fontFamily: F },
  dueDate: { fontSize: '13px', fontWeight: '600', color: '#111827', fontFamily: F },
  dueYear: { fontSize: '11px', color: '#9ca3af', fontFamily: F },
  statusPill: { fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', fontFamily: F, whiteSpace: 'nowrap' },
  overdueCount: { display: 'flex', alignItems: 'baseline', gap: '2px' },
  overdueDays: { fontSize: '18px', fontWeight: '800', color: '#dc2626', fontFamily: F },
  overdueLbl: { fontSize: '11px', color: '#dc2626', fontFamily: F },
  naText: { fontSize: '13px', color: '#d1d5db', fontFamily: F },
  lastPaidDate: { fontSize: '13px', fontWeight: '600', color: '#111827', fontFamily: F },
  lastPaidMethod: { fontSize: '10px', color: '#9ca3af', fontFamily: F },
  actionCell: { display: 'flex', gap: '6px', alignItems: 'center' },
  paidBtn: { padding: '6px 12px', backgroundColor: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: F, whiteSpace: 'nowrap' },
  createBtn: { padding: '6px 12px', backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: F, whiteSpace: 'nowrap' },
  historyBtn: { padding: '6px 12px', backgroundColor: '#f9fafb', color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', fontFamily: F },
  doneText: { fontSize: '12px', color: '#16a34a', fontWeight: '600', fontFamily: F },

  historySelectorRow: { marginBottom: '20px' },
  historySelect: { padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '13px', fontFamily: F, color: '#111827', outline: 'none', backgroundColor: 'white', cursor: 'pointer', width: '100%', maxWidth: '400px' },
  historyWrap: { backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' },
  historyHeader: { display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 24px', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', flexWrap: 'wrap' },
  historyAvatar: { width: '48px', height: '48px', backgroundColor: '#1e40af', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '18px', fontWeight: '700', flexShrink: 0, fontFamily: F },
  historyInfo: { flex: 1 },
  historyName: { fontSize: '16px', fontWeight: '700', color: '#111827', fontFamily: F },
  historyMeta: { fontSize: '13px', color: '#6b7280', fontFamily: F, marginTop: '3px' },
  historyStats: { display: 'flex', gap: '20px' },
  historyStat: { textAlign: 'center' },
  historyStatVal: { fontSize: '22px', fontWeight: '800', fontFamily: F },
  historyStatLbl: { fontSize: '11px', color: '#9ca3af', fontFamily: F },

  timeline: { padding: '24px' },
  timelineItem: { display: 'flex', gap: '16px', marginBottom: '4px' },
  timelineLeft: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '20px', flexShrink: 0 },
  timelineDot: { width: '12px', height: '12px', borderRadius: '50%', flexShrink: 0, marginTop: '4px' },
  timelineLine: { width: '2px', flex: 1, backgroundColor: '#f3f4f6', margin: '4px 0' },
  timelineContent: { flex: 1, paddingBottom: '20px' },
  timelineTop: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' },
  timelineMonth: { fontSize: '14px', fontWeight: '700', color: '#111827', fontFamily: F },
  timelineDetails: { display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' },
  timelineAmount: { fontSize: '15px', fontWeight: '800', color: '#111827', fontFamily: F },
  timelinePaidDate: { fontSize: '12px', color: '#6b7280', fontFamily: F },
  timelineMethod: { fontSize: '11px', fontWeight: '600', backgroundColor: '#f3f4f6', color: '#374151', padding: '2px 8px', borderRadius: '6px', fontFamily: F },
};

export default Payments;