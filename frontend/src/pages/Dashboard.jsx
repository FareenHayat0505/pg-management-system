import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getPaymentSummary, getMaintenanceSummary, getRooms, getTenants, getPayments } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const F = "'Poppins', sans-serif";

const Dashboard = () => {
  const [paySum,    setPaySum]    = useState(null);
  const [maintSum,  setMaintSum]  = useState(null);
  const [rooms,     setRooms]     = useState([]);
  const [tenants,   setTenants]   = useState([]);
  const [payments,  setPayments]  = useState([]);
  const [loading,   setLoading]   = useState(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [p, m, r, t, pay] = await Promise.all([
        getPaymentSummary(), getMaintenanceSummary(),
        getRooms(), getTenants(), getPayments()
      ]);
      setPaySum(p.data);
      setMaintSum(m.data);
      setRooms(r.data);
      setTenants(t.data);
      setPayments(pay.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalBeds     = rooms.reduce((a, r) => a + (r.capacity || 0), 0);
  const occupiedBeds  = rooms.reduce((a, r) => a + (r.occupied  || 0), 0);
  const availableBeds = totalBeds - occupiedBeds;
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  // Rent due reminders — tenants with pending/overdue payments
  const overduePayments = payments.filter(p => p.status === 'overdue');
  const pendingPayments = payments.filter(p => p.status === 'pending');

  // Late fee calculation — 2% per month overdue
  const LATE_FEE_RATE = 0.02;
  const overdueWithFee = overduePayments.map(p => {
    const dueDate = new Date(p.year, p.month - 1, 1);
    const monthsLate = Math.max(1, Math.floor((new Date() - dueDate) / (1000 * 60 * 60 * 24 * 30)));
    const lateFee = Math.round(p.amount * LATE_FEE_RATE * monthsLate);
    return { ...p, lateFee, monthsLate, totalDue: p.amount + lateFee };
  });

  // Chart data — occupancy per room
  const occupancyChartData = rooms.map(r => ({
    name: `R${r.roomNumber}`,
    occupied: r.occupied || 0,
    available: (r.capacity || 0) - (r.occupied || 0),
    total: r.capacity || 0,
  }));

  // Payment pie chart
  const paymentPieData = [
    { name: 'Paid',    value: paySum?.paid    || 0, color: '#16a34a' },
    { name: 'Pending', value: paySum?.pending  || 0, color: '#f59e0b' },
    { name: 'Overdue', value: paySum?.overdue  || 0, color: '#ef4444' },
  ].filter(d => d.value > 0);

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  if (loading) return (
    <Layout title="Dashboard">
      <div style={{ padding: '40px' }}>
        <div style={s.skeletonGrid}>
          {[1,2,3,4].map(i => (
            <div key={i} className="skeleton" style={{ height: '100px', borderRadius: '12px' }} />
          ))}
        </div>
      </div>
    </Layout>
  );

  return (
    <Layout title="Dashboard" subtitle={today}>

      {/* ── KPI Cards ── */}
      <div className="kpi-row" style={s.kpiRow}>
        {[
          { label: 'Total Tenants',  value: tenants.length,   sub: `${availableBeds} beds available`,   color: '#1e40af', bg: '#eff6ff', border: '#bfdbfe', icon: '👥' },
          { label: 'Rent Collected', value: `₹${(paySum?.totalCollected||0).toLocaleString()}`, sub: `${paySum?.paid||0} payments`, color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', icon: '💰' },
          { label: 'Pending Dues',   value: `₹${(paySum?.totalPending||0).toLocaleString()}`,  sub: `${paySum?.pending||0} pending · ${paySum?.overdue||0} overdue`, color: '#dc2626', bg: '#fef2f2', border: '#fecaca', icon: '⏳' },
          { label: 'Maintenance',    value: maintSum?.open||0, sub: `${maintSum?.inProgress||0} in progress`, color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: '🔧' },
        ].map(c => (
          <div key={c.label} className="kpi-card" style={{...s.kpiCard, backgroundColor: c.bg, borderColor: c.border}}>
            <div style={s.kpiTop}>
              <div style={s.kpiIcon}>{c.icon}</div>
              <div style={{...s.kpiValue, color: c.color}}>{c.value}</div>
            </div>
            <div style={s.kpiLabel}>{c.label}</div>
            <div style={s.kpiSub}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Rent Due Reminders ── */}
      {(overdueWithFee.length > 0 || pendingPayments.length > 0) && (
        <div style={s.reminderBox}>
          <div style={s.reminderHead}>
            <div style={s.reminderTitle}>
              <span className="urgent-pulse" style={s.reminderDot}>🔴</span>
              Rent Reminders — {overdueWithFee.length} overdue · {pendingPayments.length} pending
            </div>
          </div>
          <div style={s.reminderList}>
            {overdueWithFee.map(p => (
              <div key={p._id} style={s.reminderItem}>
                <div style={s.reminderAvatar}>
                  {p.tenant?.user?.name?.charAt(0).toUpperCase()}
                </div>
                <div style={s.reminderInfo}>
                  <div style={s.reminderName}>{p.tenant?.user?.name}</div>
                  <div style={s.reminderDetail}>
                    Room {p.tenant?.room?.roomNumber} · {MONTHS[p.month-1]} {p.year} · {p.monthsLate} month{p.monthsLate>1?'s':''} late
                  </div>
                </div>
                <div style={s.reminderRight}>
                  <div style={s.reminderRent}>₹{p.amount?.toLocaleString()}</div>
                  <div style={s.reminderFee}>+₹{p.lateFee} late fee</div>
                  <div style={s.reminderTotal}>Total: ₹{p.totalDue?.toLocaleString()}</div>
                </div>
                <span style={s.overdueBadge}>OVERDUE</span>
              </div>
            ))}
            {pendingPayments.slice(0, 3).map(p => (
              <div key={p._id} style={{...s.reminderItem, borderLeftColor: '#f59e0b'}}>
                <div style={{...s.reminderAvatar, backgroundColor: '#f59e0b'}}>
                  {p.tenant?.user?.name?.charAt(0).toUpperCase()}
                </div>
                <div style={s.reminderInfo}>
                  <div style={s.reminderName}>{p.tenant?.user?.name}</div>
                  <div style={s.reminderDetail}>
                    Room {p.tenant?.room?.roomNumber} · {MONTHS[p.month-1]} {p.year}
                  </div>
                </div>
                <div style={s.reminderRight}>
                  <div style={s.reminderRent}>₹{p.amount?.toLocaleString()}</div>
                </div>
                <span style={s.pendingBadge}>PENDING</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Charts Row ── */}
      <div className="dash-row2" style={s.chartsRow}>

        {/* Occupancy Bar Chart */}
        <div style={s.chartCard}>
          <div style={s.cardHead}>
            <div style={s.cardTitle}>Room Occupancy</div>
            <div style={{...s.badge, backgroundColor: '#eff6ff', color: '#1e40af'}}>
              {occupancyRate}% full
            </div>
          </div>
          <div style={s.bigStat}>
            <span style={s.bigNum}>{occupiedBeds}</span>
            <span style={s.bigDen}>/ {totalBeds} beds</span>
          </div>
          <div style={s.bigBar}>
            <div style={{
              ...s.bigBarFill,
              width: `${occupancyRate}%`,
              backgroundColor: occupancyRate > 85 ? '#ef4444' : occupancyRate > 60 ? '#f59e0b' : '#2563eb'
            }} />
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={occupancyChartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: F }} />
              <YAxis tick={{ fontSize: 11, fontFamily: F }} />
              <Tooltip
                contentStyle={{ fontFamily: F, fontSize: '12px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
              />
              <Bar dataKey="occupied"  fill="#2563eb" radius={[4,4,0,0]} name="Occupied" />
              <Bar dataKey="available" fill="#bfdbfe" radius={[4,4,0,0]} name="Available" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Pie Chart */}
        <div style={s.chartCard}>
          <div style={s.cardHead}>
            <div style={s.cardTitle}>Payment Status</div>
            <div style={{...s.badge, backgroundColor: '#f0fdf4', color: '#16a34a'}}>This month</div>
          </div>
          <div style={s.payStats}>
            {[
              { label: 'Collected', value: `₹${(paySum?.totalCollected||0).toLocaleString()}`, color: '#16a34a', bg: '#f0fdf4' },
              { label: 'Pending',   value: `₹${(paySum?.totalPending||0).toLocaleString()}`,   color: '#d97706', bg: '#fffbeb' },
              { label: 'Overdue',   value: `₹${(paySum?.totalOverdue||0).toLocaleString()}`,   color: '#dc2626', bg: '#fef2f2' },
            ].map(p => (
              <div key={p.label} style={{...s.payCard, backgroundColor: p.bg}}>
                <div style={{fontSize:'18px', fontWeight:'800', color: p.color, fontFamily: F}}>{p.value}</div>
                <div style={{fontSize:'11px', color: p.color, fontWeight:'600', fontFamily: F}}>{p.label}</div>
              </div>
            ))}
          </div>
          {paymentPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={paymentPieData}
                  cx="50%" cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {paymentPieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontFamily: F, fontSize: '12px', borderRadius: '8px' }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontFamily: F, fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af', fontSize: '13px', fontFamily: F }}>
              No payment data yet
            </div>
          )}
        </div>

        {/* Maintenance + Recent Tenants */}
        <div style={s.chartCard}>
          <div style={s.cardHead}>
            <div style={s.cardTitle}>Maintenance</div>
            <div style={{...s.badge, backgroundColor: '#fffbeb', color: '#d97706'}}>
              {(maintSum?.open||0) + (maintSum?.inProgress||0)} active
            </div>
          </div>
          <div style={s.maintStats}>
            {[
              { label: 'Open',        value: maintSum?.open||0,       color: '#2563eb', bg: '#eff6ff' },
              { label: 'In Progress', value: maintSum?.inProgress||0,  color: '#d97706', bg: '#fffbeb' },
              { label: 'Resolved',    value: maintSum?.resolved||0,    color: '#16a34a', bg: '#f0fdf4' },
              { label: 'Closed',      value: maintSum?.closed||0,      color: '#6b7280', bg: '#f3f4f6' },
            ].map(m => (
              <div key={m.label} style={{...s.maintCard, backgroundColor: m.bg}}>
                <div style={{fontSize:'24px', fontWeight:'800', color: m.color, fontFamily: F}}>{m.value}</div>
                <div style={{fontSize:'11px', color: m.color, fontWeight:'600', fontFamily: F}}>{m.label}</div>
              </div>
            ))}
          </div>

          <div style={s.cardSection}>
            <div style={s.sectionLabel}>Recent Tenants</div>
            <div style={s.tenantList}>
              {tenants.slice(0, 4).map(t => (
                <div key={t._id} style={s.tenantRow}>
                  <div style={s.tenantAvatar}>
                    {t.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div style={s.tenantInfo}>
                    <div style={s.tenantName}>{t.user?.name}</div>
                    <div style={s.tenantRoom}>Room {t.room?.roomNumber} · Bed {t.bedNumber}</div>
                  </div>
                  <div style={s.tenantRent}>₹{t.room?.rent?.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const s = {
  skeletonGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px' },
  kpiRow:  { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' },
  kpiCard: { padding: '20px', borderRadius: '14px', border: '1px solid', cursor: 'default' },
  kpiTop:  { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' },
  kpiIcon:  { fontSize: '22px' },
  kpiValue: { fontSize: '26px', fontWeight: '800', letterSpacing: '-0.5px', fontFamily: F },
  kpiLabel: { fontSize: '13px', fontWeight: '600', color: '#111827', fontFamily: F, marginBottom: '4px' },
  kpiSub:   { fontSize: '12px', color: '#6b7280', fontFamily: F },

  reminderBox: { backgroundColor: 'white', borderRadius: '14px', border: '1px solid #fecaca', marginBottom: '20px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(239,68,68,0.08)' },
  reminderHead: { padding: '14px 20px', backgroundColor: '#fef2f2', borderBottom: '1px solid #fecaca' },
  reminderTitle: { fontSize: '13px', fontWeight: '700', color: '#dc2626', fontFamily: F, display: 'flex', alignItems: 'center', gap: '8px' },
  reminderDot: { fontSize: '12px' },
  reminderList: { display: 'flex', flexDirection: 'column' },
  reminderItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px', borderBottom: '1px solid #f9fafb', borderLeft: '4px solid #ef4444' },
  reminderAvatar: { width: '36px', height: '36px', backgroundColor: '#dc2626', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '14px', fontWeight: '700', flexShrink: 0, fontFamily: F },
  reminderInfo: { flex: 1 },
  reminderName: { fontSize: '13px', fontWeight: '700', color: '#111827', fontFamily: F },
  reminderDetail: { fontSize: '11px', color: '#6b7280', fontFamily: F, marginTop: '2px' },
  reminderRight: { textAlign: 'right' },
  reminderRent: { fontSize: '13px', fontWeight: '700', color: '#111827', fontFamily: F },
  reminderFee: { fontSize: '11px', color: '#dc2626', fontWeight: '600', fontFamily: F },
  reminderTotal: { fontSize: '12px', fontWeight: '800', color: '#dc2626', fontFamily: F },
  overdueBadge: { fontSize: '10px', fontWeight: '800', backgroundColor: '#fef2f2', color: '#dc2626', padding: '3px 8px', borderRadius: '6px', border: '1px solid #fecaca', fontFamily: F, flexShrink: 0 },
  pendingBadge: { fontSize: '10px', fontWeight: '800', backgroundColor: '#fffbeb', color: '#d97706', padding: '3px 8px', borderRadius: '6px', border: '1px solid #fde68a', fontFamily: F, flexShrink: 0 },

  chartsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' },
  chartCard: { backgroundColor: 'white', borderRadius: '14px', padding: '20px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' },
  cardHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' },
  cardTitle: { fontSize: '14px', fontWeight: '700', color: '#111827', fontFamily: F },
  badge: { fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', fontFamily: F },

  bigStat: { display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '10px' },
  bigNum:  { fontSize: '32px', fontWeight: '800', color: '#111827', letterSpacing: '-1px', fontFamily: F },
  bigDen:  { fontSize: '14px', color: '#9ca3af', fontFamily: F },
  bigBar:  { height: '6px', backgroundColor: '#f3f4f6', borderRadius: '3px', overflow: 'hidden', marginBottom: '14px' },
  bigBarFill: { height: '100%', borderRadius: '3px', transition: 'width 0.5s ease' },

  payStats: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '14px' },
  payCard:  { padding: '10px', borderRadius: '10px', textAlign: 'center' },

  maintStats: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '14px' },
  maintCard:  { padding: '12px', borderRadius: '10px', textAlign: 'center' },

  cardSection:  { borderTop: '1px solid #f3f4f6', paddingTop: '14px' },
  sectionLabel: { fontSize: '10px', fontWeight: '700', color: '#9ca3af', letterSpacing: '0.8px', textTransform: 'uppercase', fontFamily: F, marginBottom: '10px' },

  tenantList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  tenantRow:  { display: 'flex', alignItems: 'center', gap: '10px' },
  tenantAvatar: { width: '32px', height: '32px', backgroundColor: '#1e40af', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: '700', flexShrink: 0, fontFamily: F },
  tenantInfo: { flex: 1 },
  tenantName: { fontSize: '13px', fontWeight: '600', color: '#111827', fontFamily: F },
  tenantRoom: { fontSize: '11px', color: '#9ca3af', fontFamily: F },
  tenantRent: { fontSize: '13px', fontWeight: '700', color: '#16a34a', fontFamily: F },
};

export default Dashboard;
