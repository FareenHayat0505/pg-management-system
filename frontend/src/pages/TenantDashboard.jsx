import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getMyProfile, getMyPayments } from '../services/api';
import { useAuth } from '../context/AuthContext';

const F = 'Inter, sans-serif';

const TenantDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [p, pay] = await Promise.all([getMyProfile(), getMyPayments()]);
      setProfile(p.data);
      setPayments(pay.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  const paid    = payments.filter(p => p.status === 'paid');
  const pending = payments.filter(p => p.status === 'pending');
  const overdue = payments.filter(p => p.status === 'overdue');

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const statusColor = { paid: '#16a34a', pending: '#d97706', overdue: '#dc2626' };
  const statusBg    = { paid: '#f0fdf4', pending: '#fffbeb', overdue: '#fef2f2' };

  if (loading) return (
    <Layout title="My Dashboard">
      <div style={{ textAlign: 'center', padding: '80px', color: '#6b7280', fontFamily: F }}>
        Loading...
      </div>
    </Layout>
  );

  return (
    <Layout title={`Welcome, ${user?.name?.split(' ')[0]} 👋`} subtitle={today}>

      {/* ── KPI Cards ── */}
     <div className="kpi-row" style={s.kpiRow}>
        <div style={{...s.kpiCard, backgroundColor: '#eff6ff', borderColor: '#bfdbfe'}}>
          <div style={s.kpiIcon}>🏠</div>
          <div style={{...s.kpiValue, color: '#1e40af'}}>
            Room {profile?.room?.roomNumber || '—'}
          </div>
          <div style={s.kpiLabel}>My Room</div>
          <div style={s.kpiSub}>
            Bed {profile?.bedNumber} · {profile?.room?.type} · Floor {profile?.room?.floor}
          </div>
        </div>

        <div style={{...s.kpiCard, backgroundColor: '#f0fdf4', borderColor: '#bbf7d0'}}>
          <div style={s.kpiIcon}>💳</div>
          <div style={{...s.kpiValue, color: '#16a34a'}}>
            ₹{profile?.room?.rent?.toLocaleString() || '—'}
          </div>
          <div style={s.kpiLabel}>Monthly Rent</div>
          <div style={s.kpiSub}>{paid.length} payments made</div>
        </div>

        <div style={{...s.kpiCard, backgroundColor: '#fffbeb', borderColor: '#fde68a'}}>
          <div style={s.kpiIcon}>⏳</div>
          <div style={{...s.kpiValue, color: '#d97706'}}>
            {pending.length + overdue.length}
          </div>
          <div style={s.kpiLabel}>Pending Dues</div>
          <div style={s.kpiSub}>
            {overdue.length > 0 ? `${overdue.length} overdue!` : 'All clear'}
          </div>
        </div>

        <div style={{...s.kpiCard, backgroundColor: '#f5f3ff', borderColor: '#ddd6fe'}}>
          <div style={s.kpiIcon}>📅</div>
          <div style={{...s.kpiValue, color: '#7c3aed'}}>
            {profile?.joinDate
              ? new Date(profile.joinDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
              : '—'}
          </div>
          <div style={s.kpiLabel}>Member Since</div>
          <div style={s.kpiSub}>
            {profile?.joinDate
              ? `${Math.floor((new Date() - new Date(profile.joinDate)) / (1000*60*60*24))} days`
              : ''}
          </div>
        </div>
      </div>

      {/* ── Row 2 ── */}
      <div style={s.row2}>

        {/* My Room Details */}
        <div style={s.card}>
          <div style={s.cardHead}>
            <div style={s.cardTitle}>My Room Details</div>
            <div style={{...s.badge, backgroundColor: '#eff6ff', color: '#1e40af'}}>
              {profile?.room?.type}
            </div>
          </div>

          <div style={s.roomVisual}>
            <div style={s.roomNum}>
              {profile?.room?.roomNumber}
            </div>
            <div style={s.roomNumLabel}>Room Number</div>
          </div>

          <div style={s.detailGrid}>
            {[
              { label: 'Floor',    value: `Floor ${profile?.room?.floor}` },
              { label: 'My Bed',   value: `Bed ${profile?.bedNumber}` },
              { label: 'Capacity', value: `${profile?.room?.capacity} beds` },
              { label: 'Rent',     value: `₹${profile?.room?.rent?.toLocaleString()}/mo` },
            ].map(d => (
              <div key={d.label} style={s.detailItem}>
                <div style={s.detailLabel}>{d.label}</div>
                <div style={s.detailValue}>{d.value}</div>
              </div>
            ))}
          </div>

          {/* Amenities */}
          {profile?.room?.amenities?.length > 0 && (
            <>
              <div style={s.sectionLabel}>Amenities</div>
              <div style={s.tags}>
                {profile.room.amenities.map(a => (
                  <span key={a} style={s.tag}>{a}</span>
                ))}
              </div>
            </>
          )}

          {/* Emergency Contact */}
          {profile?.emergencyContact?.name && (
            <>
              <div style={{...s.sectionLabel, marginTop: '14px'}}>Emergency Contact</div>
              <div style={s.emergCard}>
                <div style={s.emergName}>{profile.emergencyContact.name}</div>
                <div style={s.emergDetail}>
                  {profile.emergencyContact.relation} · 📞 {profile.emergencyContact.phone}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Payment History */}
        <div style={{...s.card, flex: 2}}>
          <div style={s.cardHead}>
            <div style={s.cardTitle}>Payment History</div>
            <div style={s.paymentSummaryRow}>
              <span style={{...s.miniPill, backgroundColor: '#f0fdf4', color: '#16a34a'}}>
                ✓ {paid.length} paid
              </span>
              {pending.length > 0 && (
                <span style={{...s.miniPill, backgroundColor: '#fffbeb', color: '#d97706'}}>
                  ⏳ {pending.length} pending
                </span>
              )}
              {overdue.length > 0 && (
                <span style={{...s.miniPill, backgroundColor: '#fef2f2', color: '#dc2626'}}>
                  ⚠ {overdue.length} overdue
                </span>
              )}
            </div>
          </div>

          {payments.length === 0 ? (
            <div style={s.empty}>
              <div style={s.emptyIcon}>💳</div>
              <div style={s.emptyTitle}>No payment records yet</div>
              <div style={s.emptyText}>Your payment history will appear here</div>
            </div>
          ) : (
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr style={s.thead}>
                    {['Month', 'Amount', 'Method', 'Status', 'Paid On'].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p, i) => (
                    <tr key={p._id} style={i % 2 === 0 ? s.trEven : s.trOdd}>
                      <td style={s.td}>
                        <div style={s.monthText}>{MONTHS[p.month - 1]} {p.year}</div>
                      </td>
                      <td style={s.td}>
                        <div style={s.amountText}>₹{p.amount?.toLocaleString()}</div>
                      </td>
                      <td style={s.td}>
                        <span style={s.methodBadge}>
                          {p.method?.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td style={s.td}>
                        <span style={{
                          ...s.statusPill,
                          backgroundColor: statusBg[p.status],
                          color: statusColor[p.status],
                        }}>
                          {p.status}
                        </span>
                      </td>
                      <td style={s.td}>
                        <div style={s.dateText}>
                          {p.paidDate
                            ? new Date(p.paidDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                            : '—'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
};

const s = {
  kpiRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' },
  kpiCard: { padding: '20px', borderRadius: '12px', border: '1px solid' },
  kpiIcon: { fontSize: '22px', marginBottom: '10px' },
  kpiValue: { fontSize: '22px', fontWeight: '800', letterSpacing: '-0.5px', fontFamily: F, marginBottom: '4px' },
  kpiLabel: { fontSize: '13px', fontWeight: '600', color: '#111827', fontFamily: F, marginBottom: '3px' },
  kpiSub: { fontSize: '12px', color: '#6b7280', fontFamily: F },

  row2: { display: 'flex', gap: '16px', alignItems: 'flex-start' },
  card: { backgroundColor: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', flex: 1 },
  cardHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' },
  cardTitle: { fontSize: '14px', fontWeight: '700', color: '#111827', fontFamily: F },
  badge: { fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', fontFamily: F, textTransform: 'capitalize' },

  roomVisual: { textAlign: 'center', padding: '20px 0 16px', borderBottom: '1px solid #f3f4f6', marginBottom: '16px' },
  roomNum: { fontSize: '52px', fontWeight: '800', color: '#1e40af', letterSpacing: '-2px', fontFamily: F },
  roomNumLabel: { fontSize: '12px', color: '#9ca3af', fontFamily: F, marginTop: '4px' },

  detailGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' },
  detailItem: { backgroundColor: '#f9fafb', borderRadius: '8px', padding: '10px 12px', border: '1px solid #f3f4f6' },
  detailLabel: { fontSize: '10px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: F, marginBottom: '4px' },
  detailValue: { fontSize: '13px', fontWeight: '700', color: '#111827', fontFamily: F },

  sectionLabel: { fontSize: '10px', fontWeight: '700', color: '#9ca3af', letterSpacing: '0.8px', textTransform: 'uppercase', fontFamily: F, marginBottom: '8px' },
  tags: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  tag: { fontSize: '11px', fontWeight: '600', backgroundColor: '#eff6ff', color: '#1e40af', padding: '3px 10px', borderRadius: '20px', border: '1px solid #bfdbfe', fontFamily: F },

  emergCard: { backgroundColor: '#fef2f2', borderRadius: '8px', padding: '12px', border: '1px solid #fecaca' },
  emergName: { fontSize: '13px', fontWeight: '700', color: '#111827', fontFamily: F, marginBottom: '3px' },
  emergDetail: { fontSize: '12px', color: '#6b7280', fontFamily: F },

  paymentSummaryRow: { display: 'flex', gap: '6px' },
  miniPill: { fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px', fontFamily: F },

  empty: { textAlign: 'center', padding: '40px' },
  emptyIcon: { fontSize: '36px', marginBottom: '10px' },
  emptyTitle: { fontSize: '14px', fontWeight: '700', color: '#111827', fontFamily: F, marginBottom: '4px' },
  emptyText: { fontSize: '13px', color: '#6b7280', fontFamily: F },

  tableWrap: { borderRadius: '10px', border: '1px solid #e5e7eb', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { backgroundColor: '#f9fafb' },
  th: { padding: '11px 14px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#6b7280', letterSpacing: '0.5px', textTransform: 'uppercase', fontFamily: F, borderBottom: '1px solid #e5e7eb' },
  td: { padding: '12px 14px', fontSize: '13px', color: '#374151', fontFamily: F, verticalAlign: 'middle' },
  trEven: { backgroundColor: 'white', borderBottom: '1px solid #f9fafb' },
  trOdd: { backgroundColor: '#fafafa', borderBottom: '1px solid #f3f4f6' },
  monthText: { fontSize: '13px', fontWeight: '600', color: '#111827', fontFamily: F },
  amountText: { fontSize: '14px', fontWeight: '700', color: '#111827', fontFamily: F },
  methodBadge: { fontSize: '11px', fontWeight: '600', backgroundColor: '#f3f4f6', color: '#374151', padding: '3px 8px', borderRadius: '6px', fontFamily: F },
  statusPill: { fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', textTransform: 'capitalize', fontFamily: F },
  dateText: { fontSize: '12px', color: '#6b7280', fontFamily: F },
};

export default TenantDashboard;