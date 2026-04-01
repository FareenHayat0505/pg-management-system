import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getPaymentSummary, getMaintenanceSummary, getRooms, getTenants, getPayments } from '../services/api'; 


const F = "'Poppins', sans-serif";

const Dashboard = () => {
  const [paySum,   setPaySum]   = useState(null);
  const [maintSum, setMaintSum] = useState(null);
  const [rooms,    setRooms]    = useState([]);
  const [tenants,  setTenants]  = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading,  setLoading]  = useState(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
  try {
    const [m, r, t, pay] = await Promise.all([
      getMaintenanceSummary(), getRooms(), getTenants(), getPayments()
    ]);
    setMaintSum(m.data);
    setRooms(r.data);
    setTenants(t.data);
    setPayments(pay.data);
    // Get summary after payments are auto-marked
    const p = await getPaymentSummary();
    setPaySum(p.data);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
}; 
useEffect(() => {
  if (payments.length > 0) {
    const overdue = payments.filter(p => p.status === 'overdue');
    if (overdue.length > 0) {
      toast.error(`${overdue.length} payment(s) are overdue!`, { duration: 5000 });
    }
  }
}, [payments]);

  const totalBeds     = rooms.reduce((a, r) => a + (r.capacity || 0), 0);
  const occupiedBeds  = rooms.reduce((a, r) => a + (r.occupied  || 0), 0);
  const availableBeds = totalBeds - occupiedBeds;
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  const overduePayments = payments.filter(p => p.status === 'overdue');
  const pendingPayments = payments.filter(p => p.status === 'pending');
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  if (loading) return (
    <Layout title="Dashboard">
      <div style={s.skeletonGrid}>
        {[1,2,3,4].map(i => (
          <div key={i} className="skeleton" style={{ height: '100px', borderRadius: '12px' }} />
        ))}
      </div>
    </Layout>
  );

  return (
    <Layout title="Dashboard" subtitle={today}>

      {/* KPI Cards */}
      <div className="kpi-row" style={s.kpiRow}>
        {[
          { label: 'Total Tenants',  value: tenants.length,                                        sub: `${availableBeds} beds available`,              color: '#1e40af', bg: '#f8faff', border: '#e0e8ff' },
          { label: 'Rent Collected', value: `₹${(paySum?.totalCollected||0).toLocaleString()}`,    sub: `${paySum?.paid||0} payments received`,         color: '#16a34a', bg: '#f6fef9', border: '#d1fae5' },
          { label: 'Pending Dues',   value: `₹${((paySum?.totalPending||0)+(paySum?.totalOverdue||0)).toLocaleString()}`, sub: `${paySum?.pending||0} pending · ${paySum?.overdue||0} overdue`, color: '#dc2626', bg: '#fff8f8', border: '#fee2e2' },
          { label: 'Maintenance',    value: maintSum?.open||0,                                     sub: `${maintSum?.inProgress||0} in progress`,      color: '#d97706', bg: '#fffdf5', border: '#fef3c7' },
        ].map(c => (
          <div key={c.label} className="kpi-card" style={{...s.kpiCard, backgroundColor: c.bg, borderColor: c.border}}>
            <div style={{...s.kpiValue, color: c.color}}>{c.value}</div>
            <div style={s.kpiLabel}>{c.label}</div>
            <div style={s.kpiSub}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Rent Reminders */}
      {(overduePayments.length > 0 || pendingPayments.length > 0) && (
        <div style={s.reminderBox}>
          <div style={s.reminderHead}>
            Rent Reminders — {overduePayments.length} overdue · {pendingPayments.length} pending
          </div>
          <div style={s.reminderList}>
            {overduePayments.map(p => (
              <div key={p._id} style={{...s.reminderItem, borderLeftColor: '#dc2626'}}>
                <div style={{...s.reminderAvatar, backgroundColor: '#dc2626'}}>
                  {p.tenant?.user?.name?.charAt(0).toUpperCase()}
                </div>
                <div style={s.reminderInfo}>
                  <div style={s.reminderName}>{p.tenant?.user?.name}</div>
                  <div style={s.reminderDetail}>Room {p.tenant?.room?.roomNumber} · {MONTHS[p.month-1]} {p.year}</div>
                </div>
                <div style={s.reminderAmt}>₹{p.amount?.toLocaleString()}</div>
                <span style={s.overdueBadge}>Overdue</span>
              </div>
            ))}
            {pendingPayments.slice(0, 2).map(p => (
              <div key={p._id} style={{...s.reminderItem, borderLeftColor: '#f59e0b'}}>
                <div style={{...s.reminderAvatar, backgroundColor: '#f59e0b'}}>
                  {p.tenant?.user?.name?.charAt(0).toUpperCase()}
                </div>
                <div style={s.reminderInfo}>
                  <div style={s.reminderName}>{p.tenant?.user?.name}</div>
                  <div style={s.reminderDetail}>Room {p.tenant?.room?.roomNumber} · {MONTHS[p.month-1]} {p.year}</div>
                </div>
                <div style={s.reminderAmt}>₹{p.amount?.toLocaleString()}</div>
                <span style={s.pendingBadge}>Pending</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="dash-row2" style={s.mainGrid}>

        {/* Room Occupancy */}
        <div style={s.card}>
          <div style={s.cardHead}>
            <div style={s.cardTitle}>Room Occupancy</div>
            <div style={{...s.badge, backgroundColor: '#f0f7ff', color: '#1e40af'}}>{occupancyRate}% full</div>
          </div>
          <div style={s.bigStat}>
            <span style={s.bigNum}>{occupiedBeds}</span>
            <span style={s.bigDen}>/ {totalBeds} beds</span>
          </div>
          <div style={s.progressBar}>
            <div style={{...s.progressFill, width: `${occupancyRate}%`,
              backgroundColor: occupancyRate > 85 ? '#dc2626' : occupancyRate > 60 ? '#f59e0b' : '#2563eb'
            }} />
          </div>
          <div style={s.progressLabels}>
            <span style={{color: '#dc2626', fontSize: '12px'}}>{occupiedBeds} occupied</span>
            <span style={{color: '#16a34a', fontSize: '12px'}}>{availableBeds} available</span>
          </div>
          <div style={s.divider} />
          {rooms.map(r => {
            const pct = r.capacity > 0 ? Math.round((r.occupied / r.capacity) * 100) : 0;
            return (
              <div key={r._id} style={s.roomRow}>
                <div style={s.roomLabel}>Room {r.roomNumber}</div>
                <div style={s.roomBarWrap}>
                  <div style={{...s.roomBarFill, width: `${pct}%`, backgroundColor: pct === 100 ? '#dc2626' : '#2563eb'}} />
                </div>
                <div style={s.roomStat}>{r.occupied}/{r.capacity}</div>
              </div>
            );
          })}
        </div>

        {/* Payment Summary */}
        <div style={s.card}>
          <div style={s.cardHead}>
            <div style={s.cardTitle}>Payment Summary</div>
            <div style={{...s.badge, backgroundColor: '#f6fef9', color: '#16a34a'}}>This month</div>
          </div>
          <div style={s.payGrid}>
            {[
              { label: 'Collected', value: `₹${(paySum?.totalCollected||0).toLocaleString()}`, color: '#16a34a', bg: '#f6fef9', count: `${paySum?.paid||0} payments` },
              { label: 'Pending',   value: `₹${(paySum?.totalPending||0).toLocaleString()}`,   color: '#d97706', bg: '#fffdf5', count: `${paySum?.pending||0} tenants` },
              { label: 'Overdue',   value: `₹${(paySum?.totalOverdue||0).toLocaleString()}`,   color: '#dc2626', bg: '#fff8f8', count: `${paySum?.overdue||0} tenants` },
            ].map(p => (
              <div key={p.label} style={{...s.payCard, backgroundColor: p.bg}}>
                <div style={{fontSize:'20px', fontWeight:'800', color: p.color, fontFamily: F}}>{p.value}</div>
                <div style={{fontSize:'12px', fontWeight:'600', color: p.color, fontFamily: F, marginTop: '2px'}}>{p.label}</div>
                <div style={{fontSize:'11px', color:'#9ca3af', fontFamily: F, marginTop: '4px'}}>{p.count}</div>
              </div>
            ))}
          </div>
          <div style={s.divider} />
          <div style={s.cardSubTitle}>Maintenance Status</div>
          <div style={s.maintGrid}>
            {[
              { label: 'Open',        value: maintSum?.open||0,       color: '#2563eb' },
              { label: 'In Progress', value: maintSum?.inProgress||0,  color: '#d97706' },
              { label: 'Resolved',    value: maintSum?.resolved||0,    color: '#16a34a' },
              { label: 'Closed',      value: maintSum?.closed||0,      color: '#6b7280' },
            ].map(m => (
              <div key={m.label} style={s.maintItem}>
                <div style={{fontSize:'22px', fontWeight:'800', color: m.color, fontFamily: F}}>{m.value}</div>
                <div style={{fontSize:'11px', color:'#6b7280', fontFamily: F}}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Tenants */}
        <div style={s.card}>
          <div style={s.cardHead}>
            <div style={s.cardTitle}>Recent Tenants</div>
            <div style={{...s.badge, backgroundColor: '#f3f4f6', color: '#6b7280'}}>{tenants.length} total</div>
          </div>
          <div style={s.tenantList}>
            {tenants.length === 0 ? (
              <div style={{textAlign:'center', padding:'40px', color:'#9ca3af', fontSize:'13px', fontFamily: F}}>No tenants yet</div>
            ) : (
              tenants.map(t => (
                <div key={t._id} style={s.tenantRow}>
                  <div style={s.tenantAvatar}>{t.user?.name?.charAt(0).toUpperCase()}</div>
                  <div style={s.tenantInfo}>
                    <div style={s.tenantName}>{t.user?.name}</div>
                    <div style={s.tenantMeta}>Room {t.room?.roomNumber} · Bed {t.bedNumber}</div>
                  </div>
                  <div style={s.tenantRent}>₹{t.room?.rent?.toLocaleString()}</div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </Layout>
  );
};

const s = {
  skeletonGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', padding: '28px 32px' },
  kpiRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' },
  kpiCard: { padding: '20px', borderRadius: '12px', border: '1px solid' },
  kpiValue: { fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px', fontFamily: F, marginBottom: '6px' },
  kpiLabel: { fontSize: '13px', fontWeight: '600', color: '#111827', fontFamily: F, marginBottom: '3px' },
  kpiSub: { fontSize: '12px', color: '#6b7280', fontFamily: F },

  reminderBox: { backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '20px', overflow: 'hidden' },
  reminderHead: { padding: '12px 20px', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', fontSize: '13px', fontWeight: '700', color: '#374151', fontFamily: F },
  reminderList: { display: 'flex', flexDirection: 'column' },
  reminderItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', borderBottom: '1px solid #f9fafb', borderLeft: '3px solid' },
  reminderAvatar: { width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '13px', fontWeight: '700', flexShrink: 0, fontFamily: F },
  reminderInfo: { flex: 1 },
  reminderName: { fontSize: '13px', fontWeight: '600', color: '#111827', fontFamily: F },
  reminderDetail: { fontSize: '11px', color: '#6b7280', fontFamily: F },
  reminderAmt: { fontSize: '13px', fontWeight: '700', color: '#111827', fontFamily: F },
  overdueBadge: { fontSize: '11px', fontWeight: '600', backgroundColor: '#fef2f2', color: '#dc2626', padding: '2px 8px', borderRadius: '6px', fontFamily: F },
  pendingBadge: { fontSize: '11px', fontWeight: '600', backgroundColor: '#fffbeb', color: '#d97706', padding: '2px 8px', borderRadius: '6px', fontFamily: F },

  mainGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' },
  card: { backgroundColor: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' },
  cardHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' },
  cardTitle: { fontSize: '14px', fontWeight: '700', color: '#111827', fontFamily: F },
  cardSubTitle: { fontSize: '12px', fontWeight: '700', color: '#6b7280', fontFamily: F, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  badge: { fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px', fontFamily: F },
  divider: { height: '1px', backgroundColor: '#f3f4f6', margin: '14px 0' },

  bigStat: { display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '10px' },
  bigNum: { fontSize: '32px', fontWeight: '800', color: '#111827', letterSpacing: '-1px', fontFamily: F },
  bigDen: { fontSize: '14px', color: '#9ca3af', fontFamily: F },
  progressBar: { height: '6px', backgroundColor: '#f3f4f6', borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' },
  progressFill: { height: '100%', borderRadius: '3px', transition: 'width 0.4s' },
  progressLabels: { display: 'flex', justifyContent: 'space-between', marginBottom: '14px' },

  roomRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' },
  roomLabel: { fontSize: '12px', fontWeight: '500', color: '#374151', fontFamily: F, width: '64px', flexShrink: 0 },
  roomBarWrap: { flex: 1, height: '6px', backgroundColor: '#f3f4f6', borderRadius: '3px', overflow: 'hidden' },
  roomBarFill: { height: '100%', borderRadius: '3px', transition: 'width 0.3s' },
  roomStat: { fontSize: '11px', color: '#6b7280', fontFamily: F, width: '28px', textAlign: 'right', flexShrink: 0 },

  payGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '14px' },
  payCard: { padding: '12px', borderRadius: '8px', textAlign: 'center' },

  maintGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' },
  maintItem: { textAlign: 'center', padding: '10px 4px', backgroundColor: '#f9fafb', borderRadius: '8px' },

  tenantList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  tenantRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  tenantAvatar: { width: '34px', height: '34px', backgroundColor: '#1e40af', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '13px', fontWeight: '700', flexShrink: 0, fontFamily: F },
  tenantInfo: { flex: 1 },
  tenantName: { fontSize: '13px', fontWeight: '600', color: '#111827', fontFamily: F },
  tenantMeta: { fontSize: '11px', color: '#9ca3af', fontFamily: F },
  tenantRent: { fontSize: '13px', fontWeight: '700', color: '#16a34a', fontFamily: F },
};

export default Dashboard;