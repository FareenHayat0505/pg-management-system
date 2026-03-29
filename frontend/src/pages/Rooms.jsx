import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import {
  getBedSummary, getProperties, getRooms,
  addRoom, updateRoom, deleteRoom, addTenant, getAvailableRooms
} from '../services/api';
import toast from 'react-hot-toast';

const F = "'Poppins', sans-serif";

const Rooms = () => {
  const [summary, setSummary]       = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [filterProperty, setFilterProperty] = useState('all');
  const [filterStatus, setFilterStatus]     = useState('all');

  // Tenant modal
  const [tenantModal, setTenantModal] = useState(null); // { room, bed }
  const [tenantForm, setTenantForm]   = useState({
    name: '', email: '', password: '', phone: '',
    emergencyName: '', emergencyPhone: '', emergencyRelation: ''
  });

  const [form, setForm] = useState({
    property: '', roomNumber: '', floor: '1',
    type: 'double', rent: '8500', amenities: ''
  });

  const ROOM_TYPES = ['single', 'double', 'triple'];
  const RENT_MAP   = { single: 12000, double: 8500, triple: 7000 };
  const CAP_MAP    = { single: 1, double: 2, triple: 3 };
  const typeColor  = { single: '#7c3aed', double: '#2563eb', triple: '#059669' };
  const typeBg     = { single: '#f5f3ff', double: '#eff6ff', triple: '#f0fdf4' };

  const fetchData = async () => {
    try {
      const [s, p] = await Promise.all([getBedSummary(), getProperties()]);
      setSummary(s.data);
      setProperties(p.data);
    } catch {
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
    setForm({ property: '', roomNumber: '', floor: '1', type: 'double', rent: '8500', amenities: '' });
    setEditingRoom(null);
    setShowForm(false);
  };

  const handleEdit = (room) => {
    setForm({
      property: room.property?._id || '',
      roomNumber: room.roomNumber,
      floor: room.floor,
      type: room.type,
      rent: room.rent,
      amenities: room.amenities.join(', ')
    });
    setEditingRoom(room._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        floor: Number(form.floor),
        rent: Number(form.rent),
        capacity: CAP_MAP[form.type],
        amenities: form.amenities.split(',').map(a => a.trim()).filter(Boolean)
      };
      if (editingRoom) {
        await updateRoom(editingRoom, payload);
        toast.success('Room updated!');
      } else {
        await addRoom(payload);
        toast.success('Room added!');
      }
      resetForm();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save room');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this room?')) return;
    try {
      await deleteRoom(id);
      toast.success('Room deleted');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot delete — room may have tenants');
    }
  };

  // Open tenant modal when clicking a free bed
  const handleBedClick = (room, bed) => {
    if (bed.isOccupied) {
      toast.error('This bed is already occupied!');
      return;
    }
    setTenantModal({ room, bed });
    setTenantForm({ name: '', email: '', password: '', phone: '', emergencyName: '', emergencyPhone: '', emergencyRelation: '' });
  };

  const handleAddTenant = async (e) => {
    e.preventDefault();
    try {
      await addTenant({
        name: tenantForm.name,
        email: tenantForm.email,
        password: tenantForm.password,
        phone: tenantForm.phone,
        roomId: tenantModal.room._id,
        bedNumber: tenantModal.bed.bedLabel,
        emergencyContact: {
          name: tenantForm.emergencyName,
          phone: tenantForm.emergencyPhone,
          relation: tenantForm.emergencyRelation
        }
      });
      toast.success(`Tenant added to Bed ${tenantModal.bed.bedLabel}!`);
      setTenantModal(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add tenant');
    }
  };

  const filteredRooms = summary?.rooms?.filter(r => {
    const propMatch = filterProperty === 'all' || r.property?._id === filterProperty;
    const statusMatch = filterStatus === 'all' || r.status === filterStatus;
    return propMatch && statusMatch;
  }) || [];

  return (
    <Layout
      title="Rooms"
      subtitle="Click a free bed to assign a tenant"
      action={
        <button
          style={showForm ? {...s.addBtn, backgroundColor: '#6b7280'} : s.addBtn}
          onClick={() => showForm ? resetForm() : setShowForm(true)}
        >
          {showForm ? '✕ Cancel' : '+ Add Room'}
        </button>
      }
    >

      {/* Summary Cards */}
      {summary && (
        <div className="summary-row" style={s.summaryRow}>
          {[
            { label: 'Total Beds',     value: summary.totalBeds,     color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
            { label: 'Occupied Beds',  value: summary.occupiedBeds,  color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
            { label: 'Available Beds', value: summary.availableBeds, color: '#059669', bg: '#f0fdf4', border: '#bbf7d0' },
            { label: 'Occupancy Rate', value: `${summary.occupancyRate}%`, color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
          ].map(c => (
            <div key={c.label} style={{...s.summaryCard, backgroundColor: c.bg, border: `1px solid ${c.border}`}}>
              <div style={{...s.summaryVal, color: c.color}}>{c.value}</div>
              <div style={s.summaryLbl}>{c.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div style={s.formCard}>
          <h3 style={s.formTitle}>{editingRoom ? '✏️ Edit Room' : '+ New Room'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid-2" style={s.formGrid}>
              <div style={s.field}>
                <label style={s.label}>Property</label>
                <select style={s.select} value={form.property}
                  onChange={e => setForm({...form, property: e.target.value})} required>
                  <option value="">Select property...</option>
                  {properties.map(p => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div style={s.field}>
                <label style={s.label}>Room Number</label>
                <input style={s.input} placeholder="101"
                  value={form.roomNumber} onChange={e => setForm({...form, roomNumber: e.target.value})} required />
              </div>
              <div style={s.field}>
                <label style={s.label}>Floor</label>
                <input style={s.input} type="number" min="1"
                  value={form.floor} onChange={e => setForm({...form, floor: e.target.value})} required />
              </div>
              <div style={s.field}>
                <label style={s.label}>Room Type</label>
                <div style={s.typeRow}>
                  {ROOM_TYPES.map(t => (
                    <button key={t} type="button"
                      style={form.type === t
                        ? {...s.typeBtn, backgroundColor: typeColor[t], color: 'white', borderColor: typeColor[t]}
                        : s.typeBtn}
                      onClick={() => setForm({...form, type: t, rent: RENT_MAP[t]})}>
                      <div style={{fontSize:'13px', fontWeight:'700'}}>{CAP_MAP[t]} {CAP_MAP[t]===1?'Bed':'Beds'}</div>
                      <div style={{fontSize:'11px', opacity:0.8}}>{t}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div style={s.field}>
                <label style={s.label}>Rent per Bed (₹/month)</label>
                <input style={s.input} type="number"
                  value={form.rent} onChange={e => setForm({...form, rent: e.target.value})} required />
              </div>
              <div style={s.field}>
                <label style={s.label}>Amenities (comma separated)</label>
                <input style={s.input} placeholder="AC, WiFi, Geyser"
                  value={form.amenities} onChange={e => setForm({...form, amenities: e.target.value})} />
              </div>
            </div>
            <div style={s.formActions}>
              <button type="button" onClick={resetForm} style={s.cancelBtn}>Cancel</button>
              <button type="submit" style={s.submitBtn}>
                {editingRoom ? 'Update Room →' : 'Add Room →'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div style={s.filterRow}>
        <div style={s.filterGroup}>
          <select style={s.filterSelect} value={filterProperty}
            onChange={e => setFilterProperty(e.target.value)}>
            <option value="all">All Properties</option>
            {properties.map(p => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
          <select style={s.filterSelect} value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="full">Full</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
        <div style={s.roomCount}>{filteredRooms.length} rooms</div>
      </div>

      {/* Rooms Grid */}
      {loading ? (
        <div style={s.loading}>Loading rooms...</div>
      ) : filteredRooms.length === 0 ? (
        <div style={s.empty}>
          <div style={s.emptyIcon}>🚪</div>
          <div style={s.emptyTitle}>No rooms found</div>
          <div style={s.emptyText}>Add a room or change the filter</div>
        </div>
      ) : (
        <div className="rooms-grid" style={s.grid}>
          {filteredRooms.map(room => (
            <div key={room._id} style={s.card}>

              {/* Card Header */}
              <div style={s.cardHead}>
                <div style={{...s.roomBadge, backgroundColor: typeBg[room.type], color: typeColor[room.type]}}>
                  Room {room.roomNumber}
                </div>
                <div style={s.cardActions}>
                  <button style={s.editBtn} onClick={() => handleEdit(room)} title="Edit">✏️</button>
                  <button style={s.delBtn}  onClick={() => handleDelete(room._id)} title="Delete">🗑</button>
                </div>
              </div>

              {/* Property & Meta */}
              <div style={s.propName}>🏢 {room.property?.name || 'Unknown'}</div>
              <div style={s.metaRow}>
                <span style={{...s.typePill, backgroundColor: typeBg[room.type], color: typeColor[room.type]}}>
                  {room.type}
                </span>
                <span style={s.metaItem}>Floor {room.floor}</span>
                <span style={s.metaItem}>₹{room.rent?.toLocaleString()}/mo</span>
              </div>

              {/* Beds — Clickable */}
              <div style={s.bedsSection}>
                <div style={s.bedsSectionTitle}>
                  Beds — <span style={{color: '#2563eb'}}>click free bed to assign tenant</span>
                </div>
                <div style={s.bedsRow}>
                  {room.beds.map(bed => (
                    <div
                      key={bed.bedLabel}
                      onClick={() => handleBedClick(room, bed)}
                      style={{
                        ...s.bed,
                        backgroundColor: bed.isOccupied ? '#fee2e2' : '#f0fdf4',
                        borderColor:     bed.isOccupied ? '#fca5a5' : '#86efac',
                        color:           bed.isOccupied ? '#dc2626' : '#16a34a',
                        cursor:          bed.isOccupied ? 'not-allowed' : 'pointer',
                        transform:       'scale(1)',
                        transition:      'all 0.15s',
                      }}
                      onMouseEnter={e => { if (!bed.isOccupied) e.currentTarget.style.transform = 'scale(1.04)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                      title={bed.isOccupied ? 'Occupied' : 'Click to assign tenant'}
                    >
                      <div style={s.bedIcon}>🛏</div>
                      <div style={s.bedLabel}>Bed {bed.bedLabel}</div>
                      <div style={s.bedStatus}>
                        {bed.isOccupied ? '● Occupied' : '+ Assign'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div style={s.availRow}>
                <span style={s.availText}>{room.availableBeds} of {room.totalBeds} beds free</span>
                <span style={{
                  ...s.statusPill,
                  backgroundColor: room.status === 'available' ? '#dcfce7' : room.status === 'full' ? '#fee2e2' : '#fef9c3',
                  color: room.status === 'available' ? '#16a34a' : room.status === 'full' ? '#dc2626' : '#ca8a04',
                }}>
                  {room.status}
                </span>
              </div>
              <div style={s.barBg}>
                <div style={{
                  ...s.barFill,
                  width: `${(room.occupiedBeds / room.totalBeds) * 100}%`,
                  backgroundColor: room.status === 'full' ? '#ef4444' : '#2563eb'
                }} />
              </div>

              {/* Amenities */}
              {room.amenities.length > 0 && (
                <div style={s.tags}>
                  {room.amenities.map(a => (
                    <span key={a} style={s.tag}>{a}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Tenant Modal ── */}
      {tenantModal && (
        <div style={s.modalOverlay} onClick={() => setTenantModal(null)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>

            {/* Modal Header */}
            <div style={s.modalHead}>
              <div>
                <div style={s.modalTitle}>Assign Tenant</div>
                <div style={s.modalSub}>
                  Room {tenantModal.room.roomNumber} · Bed {tenantModal.bed.bedLabel} · ₹{tenantModal.room.rent?.toLocaleString()}/mo
                </div>
              </div>
              <button style={s.modalClose} onClick={() => setTenantModal(null)}>✕</button>
            </div>

            <form onSubmit={handleAddTenant} style={s.modalForm}>

              <div style={s.modalSection}>Personal Info</div>
              <div style={s.modalGrid}>
                <div style={s.field}>
                  <label style={s.label}>Full Name</label>
                  <input style={s.input} placeholder="Aryan Mehta"
                    value={tenantForm.name}
                    onChange={e => setTenantForm({...tenantForm, name: e.target.value})} required />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Email</label>
                  <input style={s.input} type="email" placeholder="aryan@mail.com"
                    value={tenantForm.email}
                    onChange={e => setTenantForm({...tenantForm, email: e.target.value})} required />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Password</label>
                  <input style={s.input} type="password" placeholder="Set login password"
                    value={tenantForm.password}
                    onChange={e => setTenantForm({...tenantForm, password: e.target.value})} required />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Phone</label>
                  <input style={s.input} placeholder="9876543210"
                    value={tenantForm.phone}
                    onChange={e => setTenantForm({...tenantForm, phone: e.target.value})} required />
                </div>
              </div>

              <div style={s.modalSection}>Emergency Contact</div>
              <div style={s.modalGrid}>
                <div style={s.field}>
                  <label style={s.label}>Contact Name</label>
                  <input style={s.input} placeholder="Raj Mehta"
                    value={tenantForm.emergencyName}
                    onChange={e => setTenantForm({...tenantForm, emergencyName: e.target.value})} />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Phone</label>
                  <input style={s.input} placeholder="9876500000"
                    value={tenantForm.emergencyPhone}
                    onChange={e => setTenantForm({...tenantForm, emergencyPhone: e.target.value})} />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Relation</label>
                  <input style={s.input} placeholder="Father"
                    value={tenantForm.emergencyRelation}
                    onChange={e => setTenantForm({...tenantForm, emergencyRelation: e.target.value})} />
                </div>
              </div>

              <div style={s.modalActions}>
                <button type="button" onClick={() => setTenantModal(null)} style={s.cancelBtn}>Cancel</button>
                <button type="submit" style={s.submitBtn}>Assign Tenant →</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </Layout>
  );
};

const s = {
  summaryRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
  summaryCard: { padding: '20px', borderRadius: '12px', textAlign: 'center' },
  summaryVal: { fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px', fontFamily: F },
  summaryLbl: { fontSize: '12px', color: '#6b7280', marginTop: '4px', fontWeight: '500', fontFamily: F },

  addBtn: { padding: '9px 18px', backgroundColor: '#1e40af', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: F },

  formCard: { backgroundColor: 'white', borderRadius: '12px', padding: '24px', marginBottom: '24px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },
  formTitle: { fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '20px', fontFamily: F },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '11px', fontWeight: '600', color: '#6b7280', letterSpacing: '0.5px', textTransform: 'uppercase', fontFamily: F },
  input: { padding: '10px 13px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', fontFamily: F, color: '#111827', outline: 'none', backgroundColor: '#fafafa' },
  select: { padding: '10px 13px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', fontFamily: F, color: '#111827', outline: 'none', backgroundColor: '#fafafa', cursor: 'pointer' },
  typeRow: { display: 'flex', gap: '8px' },
  typeBtn: { flex: 1, padding: '10px 8px', border: '1.5px solid #e5e7eb', borderRadius: '8px', backgroundColor: 'white', cursor: 'pointer', fontFamily: F, transition: 'all 0.15s', textAlign: 'center' },
  formActions: { display: 'flex', gap: '10px', justifyContent: 'flex-end' },
  cancelBtn: { padding: '9px 20px', backgroundColor: 'white', color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: F },
  submitBtn: { padding: '9px 20px', backgroundColor: '#1e40af', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: F },

  filterRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' },
  filterGroup: { display: 'flex', gap: '10px' },
  filterSelect: { padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', fontFamily: F, color: '#374151', outline: 'none', backgroundColor: 'white', cursor: 'pointer' },
  roomCount: { fontSize: '13px', color: '#6b7280', fontWeight: '500', fontFamily: F },

  loading: { textAlign: 'center', padding: '60px', color: '#6b7280', fontFamily: F },
  empty: { textAlign: 'center', padding: '60px' },
  emptyIcon: { fontSize: '40px', marginBottom: '12px' },
  emptyTitle: { fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '6px', fontFamily: F },
  emptyText: { fontSize: '13px', color: '#6b7280', fontFamily: F },

  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' },
  card: { backgroundColor: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' },
  cardHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' },
  roomBadge: { fontSize: '14px', fontWeight: '700', padding: '4px 12px', borderRadius: '8px', fontFamily: F },
  cardActions: { display: 'flex', gap: '6px' },
  editBtn: { width: '30px', height: '30px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  delBtn:  { width: '30px', height: '30px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  propName: { fontSize: '12px', color: '#6b7280', marginBottom: '10px', fontFamily: F },
  metaRow: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' },
  typePill: { fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', textTransform: 'capitalize', fontFamily: F },
  metaItem: { fontSize: '12px', color: '#6b7280', fontFamily: F },

  bedsSection: { marginBottom: '14px' },
  bedsSectionTitle: { fontSize: '11px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', fontFamily: F },
  bedsRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  bed: { flex: 1, minWidth: '80px', padding: '12px 8px', borderRadius: '10px', border: '2px solid', textAlign: 'center', userSelect: 'none' },
  bedIcon: { fontSize: '20px', marginBottom: '4px' },
  bedLabel: { fontSize: '12px', fontWeight: '700', fontFamily: F },
  bedStatus: { fontSize: '10px', fontWeight: '600', marginTop: '3px', fontFamily: F },

  availRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' },
  availText: { fontSize: '12px', color: '#6b7280', fontFamily: F },
  statusPill: { fontSize: '11px', fontWeight: '600', padding: '2px 10px', borderRadius: '20px', fontFamily: F },
  barBg: { height: '5px', backgroundColor: '#f3f4f6', borderRadius: '3px', overflow: 'hidden', marginBottom: '12px' },
  barFill: { height: '100%', borderRadius: '3px', transition: 'width 0.3s' },
  tags: { display: 'flex', flexWrap: 'wrap', gap: '5px' },
  tag: { fontSize: '10px', fontWeight: '600', backgroundColor: '#f3f4f6', color: '#6b7280', padding: '2px 8px', borderRadius: '20px', fontFamily: F },

  // Modal
  modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  modal: { backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
  modalHead: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #e5e7eb' },
  modalTitle: { fontSize: '17px', fontWeight: '700', color: '#111827', fontFamily: F },
  modalSub: { fontSize: '13px', color: '#6b7280', marginTop: '3px', fontFamily: F },
  modalClose: { border: 'none', backgroundColor: '#f3f4f6', borderRadius: '8px', width: '32px', height: '32px', fontSize: '16px', cursor: 'pointer', color: '#6b7280', flexShrink: 0 },
  modalForm: { padding: '20px 24px' },
  modalSection: { fontSize: '11px', fontWeight: '700', color: '#2563eb', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '12px', marginTop: '4px', fontFamily: F, borderLeft: '3px solid #2563eb', paddingLeft: '10px' },
  modalGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' },
  modalActions: { display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid #f3f4f6', paddingTop: '16px' },
};

export default Rooms;