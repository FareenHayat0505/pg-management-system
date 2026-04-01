import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getTenants, addTenant, checkoutTenant, getAvailableRooms } from '../services/api';
import toast from 'react-hot-toast';

const F = 'Inter, sans-serif';

const Tenants = () => {
  const [tenants, setTenants] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    phone: '', roomId: '', bedNumber: 'A',
    emergencyName: '', emergencyPhone: '', emergencyRelation: ''
  });

  const fetchData = async () => {
    try {
      const [t, r] = await Promise.all([getTenants(), getAvailableRooms()]);
      setTenants(t.data);
      setRooms(r.data);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
    setForm({
      name: '', email: '', password: '',
      phone: '', roomId: '', bedNumber: 'A',
      emergencyName: '', emergencyPhone: '', emergencyRelation: ''
    });
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addTenant({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        roomId: form.roomId,
        bedNumber: form.bedNumber,
        emergencyContact: {
          name: form.emergencyName,
          phone: form.emergencyPhone,
          relation: form.emergencyRelation
        }
      });
      toast.success('Tenant added successfully!');
      resetForm();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add tenant');
    }
  };

  const handleCheckout = async (id, name) => {
    if (!window.confirm(`Checkout ${name}? This will free up their bed.`)) return;
    try {
      await checkoutTenant(id);
      toast.success(`${name} checked out successfully`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to checkout');
    }
  };

  const filtered = tenants.filter(t =>
    t.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
    t.room?.roomNumber?.includes(search)
  );

  return (
    <Layout
      title="Tenants"
      subtitle={`${tenants.length} active tenants`}
      action={
        <button
          style={showForm ? {...s.addBtn, backgroundColor: '#6b7280'} : s.addBtn}
          onClick={() => showForm ? resetForm() : setShowForm(true)}
        >
          {showForm ? '✕ Cancel' : '+ Add Tenant'}
        </button>
      }
    >

      {/* Add Tenant Form */}
      {showForm && (
        <div style={s.formCard}>
          <h3 style={s.formTitle}>+ New Tenant</h3>
          <form onSubmit={handleSubmit}>

            {/* Section 1 - Personal Info */}
            <div style={s.sectionLabel}>Personal Information</div>
            <div style={s.formGrid}>
              <div style={s.field}>
                <label style={s.label}>Full Name</label>
                <input style={s.input} placeholder="Aryan Mehta"
                  value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  required />
              </div>
              <div style={s.field}>
                <label style={s.label}>Email</label>
                <input style={s.input} type="email" placeholder="aryan@mail.com"
                  value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  required />
              </div>
              <div style={s.field}>
                <label style={s.label}>Password</label>
                <input style={s.input} type="password" placeholder="Set login password"
                  value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                  required />
              </div>
              <div style={s.field}>
                <label style={s.label}>Phone</label>
                <input style={s.input} placeholder="9876543210"
                  value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                  required />
              </div>
            </div>

            {/* Section 2 - Room */}
            <div style={s.sectionLabel}>Room Assignment</div>
            <div style={s.formGrid}>
              <div style={s.field}>
                <label style={s.label}>Room</label>
                <select style={s.select}
                  value={form.roomId}
                  onChange={e => setForm({...form, roomId: e.target.value})}
                  required
                >
                  <option value="">Select available room...</option>
                  {rooms.map(r => (
                    <option key={r._id} value={r._id}>
                      Room {r.roomNumber} — {r.type} — ₹{r.rent}/mo
                      ({r.capacity - r.occupied} beds free)
                    </option>
                  ))}
                </select>
              </div>
              <div style={s.field}>
                <label style={s.label}>Bed Number</label>
                <select style={s.select}
                  value={form.bedNumber}
                  onChange={e => setForm({...form, bedNumber: e.target.value})}
                >
                  {['A', 'B', 'C'].map(b => (
                    <option key={b} value={b}>Bed {b}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Section 3 - Emergency */}
            <div style={s.sectionLabel}>Emergency Contact</div>
            <div className="form-grid-2" style={s.formGrid}>

              <div style={s.field}>
                <label style={s.label}>Contact Name</label>
                <input style={s.input} placeholder="Raj Mehta"
                  value={form.emergencyName}
                  onChange={e => setForm({...form, emergencyName: e.target.value})} />
              </div>
              <div style={s.field}>
                <label style={s.label}>Contact Phone</label>
                <input style={s.input} placeholder="9876500000"
                  value={form.emergencyPhone}
                  onChange={e => setForm({...form, emergencyPhone: e.target.value})} />
              </div>
              <div style={s.field}>
                <label style={s.label}>Relation</label>
                <input style={s.input} placeholder="Father"
                  value={form.emergencyRelation}
                  onChange={e => setForm({...form, emergencyRelation: e.target.value})} />
              </div>
            </div>

            <div style={s.formActions}>
              <button type="button" onClick={resetForm} style={s.cancelBtn}>Cancel</button>
              <button type="submit" style={s.submitBtn}>Add Tenant →</button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div style={s.searchRow}>
        <input
          style={s.searchInput}
          placeholder="🔍  Search by name, email or room..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div style={s.countBadge}>{filtered.length} tenants</div>
      </div>

      {/* Tenants Table */}
      {loading ? (
        <div style={s.loading}>Loading tenants...</div>
      ) : filtered.length === 0 ? (
        <div style={s.empty}>
          <div style={s.emptyIcon}>👥</div>
          <div style={s.emptyTitle}>No tenants found</div>
          <div style={s.emptyText}>Add your first tenant to get started</div>
        </div>
      ) : (
         <div className="table-wrap" style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr style={s.thead}>
                {['Tenant', 'Contact', 'Room & Bed', 'Joined', 'Emergency', 'Action'].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => (
                <tr key={t._id} style={i % 2 === 0 ? s.trEven : s.trOdd}>

                  {/* Tenant */}
                  <td style={s.td}>
                    <div style={s.tenantCell}>
                      <div style={s.avatar}>
                        {t.user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={s.tenantName}>{t.user?.name}</div>
                        <div style={s.tenantEmail}>{t.user?.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td style={s.td}>
                    <div style={s.phone}> {t.user?.phone || 'N/A'}</div>
                  </td>

                  {/* Room & Bed */}
                  <td style={s.td}>
                    <div style={s.roomBadge}>
                       Room {t.room?.roomNumber}
                    </div>
                    <div style={s.bedBadge}>
                      Bed {t.bedNumber}
                    </div>
                    <div style={s.rentBadge}>
                      ₹{t.room?.rent?.toLocaleString()}/mo
                    </div>
                  </td>

                  {/* Joined */}
                  <td style={s.td}>
                    <div style={s.dateText}>
                      {new Date(t.joinDate).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </div>
                  </td>

                  {/* Emergency */}
                  <td style={s.td}>
                    {t.emergencyContact?.name ? (
                      <div>
                        <div style={s.emergName}>{t.emergencyContact.name}</div>
                        <div style={s.emergDetail}>
                          {t.emergencyContact.relation} · {t.emergencyContact.phone}
                        </div>
                      </div>
                    ) : (
                      <span style={s.naText}>N/A</span>
                    )}
                  </td>

                  {/* Action */}
                  <td style={s.td}>
                    <button
                      style={s.checkoutBtn}
                      onClick={() => handleCheckout(t._id, t.user?.name)}
                    >
                      Checkout
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
};

const s = {
  addBtn: {
    padding: '9px 18px',
    backgroundColor: '#1e40af',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: F,
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  },
  formTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '20px',
    fontFamily: F,
  },
  sectionLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#2563eb',
    letterSpacing: '0.8px',
    textTransform: 'uppercase',
    marginBottom: '12px',
    marginTop: '4px',
    fontFamily: F,
    borderLeft: '3px solid #2563eb',
    paddingLeft: '10px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '14px',
    marginBottom: '20px',
  },
  field: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontFamily: F,
  },
  input: {
    padding: '10px 13px',
    border: '1.5px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '13px',
    fontFamily: F,
    color: '#111827',
    outline: 'none',
    backgroundColor: '#fafafa',
  },
  select: {
    padding: '10px 13px',
    border: '1.5px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '13px',
    fontFamily: F,
    color: '#111827',
    outline: 'none',
    backgroundColor: '#fafafa',
    cursor: 'pointer',
  },
  formActions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
    marginTop: '8px',
  },
  cancelBtn: {
    padding: '9px 20px',
    backgroundColor: 'white',
    color: '#6b7280',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: F,
  },
  submitBtn: {
    padding: '9px 20px',
    backgroundColor: '#1e40af',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: F,
  },
  searchRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
  },
  searchInput: {
    flex: 1,
    padding: '10px 16px',
    border: '1.5px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '13px',
    fontFamily: F,
    outline: 'none',
    backgroundColor: 'white',
    color: '#111827',
  },
  countBadge: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#6b7280',
    fontFamily: F,
    whiteSpace: 'nowrap',
  },
  loading: {
    textAlign: 'center',
    padding: '60px',
    color: '#6b7280',
    fontFamily: F,
  },
  empty: {
    textAlign: 'center',
    padding: '60px',
  },
  emptyIcon: { fontSize: '40px', marginBottom: '12px' },
  emptyTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '6px',
    fontFamily: F,
  },
  emptyText: {
    fontSize: '13px',
    color: '#6b7280',
    fontFamily: F,
  },
  tableWrap: {
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  thead: {
    backgroundColor: '#f9fafb',
  },
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: '700',
    color: '#6b7280',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    fontFamily: F,
    borderBottom: '1px solid #e5e7eb',
  },
  td: {
    padding: '14px 16px',
    fontSize: '13px',
    color: '#374151',
    fontFamily: F,
    verticalAlign: 'middle',
  },
  trEven: { backgroundColor: 'white', borderBottom: '1px solid #f9fafb' },
  trOdd: { backgroundColor: '#fafafa', borderBottom: '1px solid #f3f4f6' },
  tenantCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  avatar: {
    width: '34px',
    height: '34px',
    backgroundColor: '#1e40af',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '13px',
    fontWeight: '700',
    flexShrink: 0,
    fontFamily: F,
  },
  tenantName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#111827',
    fontFamily: F,
  },
  tenantEmail: {
    fontSize: '12px',
    color: '#9ca3af',
    fontFamily: F,
  },
  phone: {
    fontSize: '13px',
    color: '#374151',
    fontFamily: F,
  },
  roomBadge: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: '3px',
    fontFamily: F,
  },
  bedBadge: {
    fontSize: '12px',
    color: '#374151',
    marginBottom: '3px',
    fontFamily: F,
  },
  rentBadge: {
    fontSize: '11px',
    color: '#059669',
    fontWeight: '600',
    fontFamily: F,
  },
  dateText: {
    fontSize: '13px',
    color: '#374151',
    fontFamily: F,
  },
  emergName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#111827',
    fontFamily: F,
  },
  emergDetail: {
    fontSize: '11px',
    color: '#9ca3af',
    fontFamily: F,
  },
  naText: {
    fontSize: '12px',
    color: '#d1d5db',
    fontFamily: F,
  },
  checkoutBtn: {
    padding: '6px 14px',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: F,
  },
};

export default Tenants;