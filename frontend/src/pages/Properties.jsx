import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getProperties, createProperty, updateProperty, deleteProperty } from '../services/api';
import toast from 'react-hot-toast';

const F = "'Poppins', sans-serif";

const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', address: '', city: '', totalFloors: '', contactPhone: '', amenities: '' });

  const fetchProperties = async () => {
    try {
      const { data } = await getProperties();
      setProperties(data);
    } catch {
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchProperties(); }, []);

  const resetForm = () => {
    setForm({ name: '', address: '', city: '', totalFloors: '', contactPhone: '', amenities: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (p) => {
    setForm({ name: p.name, address: p.address, city: p.city, totalFloors: p.totalFloors, contactPhone: p.contactPhone || '', amenities: p.amenities.join(', ') });
    setEditingId(p._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, totalFloors: Number(form.totalFloors), amenities: form.amenities.split(',').map(a => a.trim()).filter(Boolean) };
      if (editingId) {
        await updateProperty(editingId, payload);
        toast.success('Property updated!');
      } else {
        await createProperty(payload);
        toast.success('Property added!');
      }
      resetForm();
      fetchProperties();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this property?')) return;
    try {
      await deleteProperty(id);
      toast.success('Property deleted');
      fetchProperties();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <Layout
      title="Properties"
      subtitle="Manage all your PG locations"
      action={
        <button style={showForm ? {...s.addBtn, backgroundColor: '#6b7280'} : s.addBtn} onClick={() => showForm ? resetForm() : setShowForm(true)}>
          {showForm ? 'Cancel' : '+ Add Property'}
        </button>
      }
    >
      {showForm && (
        <div style={s.formCard}>
          <h3 style={s.formTitle}>{editingId ? 'Edit Property' : 'New Property'}</h3>
          <div style={s.infoNote}>After adding a property, go to <strong>Rooms</strong> page to add rooms and beds.</div>
          <form onSubmit={handleSubmit}>
            <div className="form-grid-2" style={s.grid2}>
              {[
                { key: 'name',         label: 'Property Name',             placeholder: 'e.g. Sunshine PG' },
                { key: 'city',         label: 'City',                      placeholder: 'e.g. Mumbai' },
                { key: 'address',      label: 'Full Address',              placeholder: 'e.g. 12 MG Road, Andheri' },
                { key: 'totalFloors',  label: 'Total Beds',              placeholder: 'e.g. 3', type: 'number' },
                { key: 'contactPhone', label: 'Contact Phone',             placeholder: 'e.g. 9876543210' },
                { key: 'amenities',    label: 'Amenities (comma separated)', placeholder: 'e.g. WiFi, CCTV, Mess' },
              ].map(f => (
                <div key={f.key} style={s.field}>
                  <label style={s.label}>{f.label}</label>
                  <input style={s.input} type={f.type || 'text'} placeholder={f.placeholder} value={form[f.key]}
                    onChange={e => setForm({...form, [f.key]: e.target.value})}
                    onFocus={e => e.target.style.borderColor = '#2563eb'}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                    required={['name', 'city', 'address', 'totalFloors'].includes(f.key)} />
                </div>
              ))}
            </div>
            <div style={s.formActions}>
              <button type="button" onClick={resetForm} style={s.cancelBtn}>Cancel</button>
              <button type="submit" style={s.submitBtn}>{editingId ? 'Update Property' : 'Add Property'}</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={s.loading}>Loading properties...</div>
      ) : properties.length === 0 ? (
        <div style={s.empty}>
          <div style={s.emptyTitle}>No properties yet</div>
          <div style={s.emptyText}>Add your first PG property to get started</div>
        </div>
      ) : (
        <div className="props-grid" style={s.grid}>
          {properties.map(p => (
            <div className="anim-card" key={p._id} style={s.card}>

              <div style={s.cardHead}>
                <div style={s.cardHeadInfo}>
                  <h3 style={s.cardName}>{p.name}</h3>
                  <div style={s.cityBadge}>{p.city}</div>
                </div>
                <div style={s.cardActions}>
                  <button style={s.editBtn} onClick={() => handleEdit(p)}>Edit</button>
                  <button style={s.delBtn} onClick={() => handleDelete(p._id)}>Delete</button>
                </div>
              </div>

              <p style={s.address}>{p.address}</p>
              <div style={s.divider} />

              <div style={s.stats}>
                {[
                  { label: 'Rooms',    value: p.totalRooms,         color: '#2563eb', bg: '#eff6ff' },
                  { label: 'Tenants',  value: p.tenantCount,        color: '#7c3aed', bg: '#f5f3ff' },
                  { label: 'Occupied', value: `${p.occupancyRate}%`, color: p.occupancyRate > 80 ? '#dc2626' : '#059669', bg: p.occupancyRate > 80 ? '#fef2f2' : '#f0fdf4' },
                 { label: 'Total Beds', value: p.totalBeds, color: '#d97706', bg: '#fffbeb' },
                ].map(stat => (
                  <div key={stat.label} style={{...s.stat, backgroundColor: stat.bg}}>
                    <div style={{...s.statVal, color: stat.color}}>{stat.value}</div>
                    <div style={s.statLbl}>{stat.label}</div>
                  </div>
                ))}
              </div>

              <div style={s.bedStats}>
                {[
                  { color: '#16a34a', label: `${p.totalBeds - p.occupiedBeds} beds free` },
                  { color: '#ef4444', label: `${p.occupiedBeds} occupied` },
                  { color: '#6b7280', label: `${p.totalBeds} total` },
                ].map(b => (
                  <div key={b.label} style={s.bedStatItem}>
                    <div style={{width:'8px', height:'8px', borderRadius:'50%', backgroundColor: b.color, flexShrink: 0}} />
                    <span style={s.bedStatText}>{b.label}</span>
                  </div>
                ))}
              </div>

              <div style={s.barRow}>
                <span style={s.barLbl}>Occupancy</span>
                <span style={s.barLbl}>{p.occupiedBeds}/{p.totalBeds} beds</span>
              </div>
              <div style={s.barBg}>
                <div style={{...s.barFill, width: `${p.occupancyRate}%`, backgroundColor: p.occupancyRate > 80 ? '#ef4444' : p.occupancyRate > 50 ? '#f59e0b' : '#10b981'}} />
              </div>

              {p.amenities.length > 0 && (
                <div style={s.tags}>
                  {p.amenities.map(a => <span key={a} style={s.tag}>{a}</span>)}
                </div>
              )}

             <div style={s.cardFoot}>
  <span style={s.footItem}>{p.contactPhone || 'N/A'}</span>
  <span style={{...s.statusBadge, backgroundColor: p.isActive ? '#dcfce7' : '#fee2e2', color: p.isActive ? '#16a34a' : '#dc2626'}}>
    {p.isActive ? 'Active' : 'Inactive'}
  </span>
</div>

            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

const s = {
  addBtn: { padding: '9px 18px', backgroundColor: '#1e40af', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: F },
  formCard: { backgroundColor: 'white', borderRadius: '12px', padding: '24px', marginBottom: '24px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },
  formTitle: { fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '12px', fontFamily: F },
  infoNote: { fontSize: '13px', color: '#1e40af', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '10px 14px', marginBottom: '20px', fontFamily: F },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' },
  field: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '11px', fontWeight: '600', color: '#6b7280', letterSpacing: '0.5px', textTransform: 'uppercase', fontFamily: F },
  input: { padding: '10px 13px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', fontFamily: F, color: '#111827', outline: 'none', backgroundColor: '#fafafa', transition: 'border-color 0.15s' },
  formActions: { display: 'flex', gap: '10px', justifyContent: 'flex-end' },
  cancelBtn: { padding: '9px 20px', backgroundColor: 'white', color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: F },
  submitBtn: { padding: '9px 20px', backgroundColor: '#1e40af', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: F },
  loading: { textAlign: 'center', padding: '60px', color: '#6b7280', fontFamily: F },
  empty: { textAlign: 'center', padding: '80px 20px' },
  emptyTitle: { fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '8px', fontFamily: F },
  emptyText: { fontSize: '14px', color: '#6b7280', fontFamily: F },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' },
  card: { backgroundColor: 'white', borderRadius: '14px', padding: '22px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
  cardHead: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' },
  cardHeadInfo: { flex: 1 },
  cardName: { fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '4px', fontFamily: F },
  cityBadge: { fontSize: '12px', color: '#2563eb', fontWeight: '500', fontFamily: F },
  cardActions: { display: 'flex', gap: '6px', flexShrink: 0 },
  editBtn: { padding: '6px 14px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: '#1e40af', fontFamily: F },
  delBtn:  { padding: '6px 14px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: '#dc2626', fontFamily: F },
  address: { fontSize: '13px', color: '#6b7280', marginBottom: '14px', fontFamily: F },
  divider: { height: '1px', backgroundColor: '#f3f4f6', marginBottom: '14px' },
  stats: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '14px' },
  stat: { textAlign: 'center', padding: '10px 4px', borderRadius: '8px' },
  statVal: { fontSize: '20px', fontWeight: '800', fontFamily: F, letterSpacing: '-0.5px' },
  statLbl: { fontSize: '11px', color: '#9ca3af', fontFamily: F, marginTop: '2px' },
  bedStats: { display: 'flex', gap: '16px', marginBottom: '12px', flexWrap: 'wrap' },
  bedStatItem: { display: 'flex', alignItems: 'center', gap: '6px' },
  bedStatText: { fontSize: '12px', color: '#374151', fontFamily: F, fontWeight: '500' },
  barRow: { display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9ca3af', marginBottom: '6px', fontFamily: F },
  barLbl: { fontWeight: '500' },
  barBg: { height: '6px', backgroundColor: '#f3f4f6', borderRadius: '3px', overflow: 'hidden', marginBottom: '14px' },
  barFill: { height: '100%', borderRadius: '3px', transition: 'width 0.4s ease' },
  tags: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' },
  tag: { fontSize: '11px', fontWeight: '600', backgroundColor: '#eff6ff', color: '#1e40af', padding: '3px 10px', borderRadius: '20px', border: '1px solid #bfdbfe', fontFamily: F },
  cardFoot: { display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '12px', borderTop: '1px solid #f3f4f6' },
  footItem: { fontSize: '12px', color: '#6b7280', fontFamily: F, flex: 1 },
  statusBadge: { fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px', fontFamily: F },
};

export default Properties;