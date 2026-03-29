import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Sidebar = ({ onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const adminLinks = [
    { path: '/',            label: 'Dashboard',   icon: '▣' },
    { path: '/properties',  label: 'Properties',  icon: '⊞' },
    { path: '/rooms',       label: 'Rooms',       icon: '⊡' },
    { path: '/tenants',     label: 'Tenants',     icon: '◉' },
    { path: '/payments',    label: 'Payments',    icon: '◈' },
    { path: '/maintenance', label: 'Maintenance', icon: '◌' },
    { path: '/notices',     label: 'Notices',     icon: '◎' },
  ];

  const tenantLinks = [
    { path: '/maintenance', label: 'Maintenance', icon: '◌' },
    { path: '/notices',     label: 'Notices',     icon: '◎' },
  ];

  const links = user?.role === 'admin' ? adminLinks : tenantLinks;

  const handleLogout = () => {
    logout();
    toast.success('Signed out');
    navigate('/login');
  };

  return (
    <aside style={s.aside}>

      {/* Brand */}
<div style={s.brand}>
  <div style={s.brandLeft}>
    <div style={s.brandBox}>PG</div>
    <div>
      <div style={s.brandName}>PG Stay</div>
      <div style={s.brandSub}>Management</div>
    </div>
  </div>
  {onClose && (
    <button
      onClick={onClose}
      style={s.closeBtn}
      className="sidebar-close"
    >✕</button>
  )}
</div>

      {/* Nav links */}
      <div style={s.navWrap}>
        <div style={s.navSection}>Navigation</div>
        {links.map(link => {
          const active = location.pathname === link.path;
          return (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              style={active ? {...s.navBtn, ...s.navBtnActive} : s.navBtn}
            >
              {active && <div style={s.activeAccent} />}
              <span style={active ? {...s.navIcon, color: '#2563eb'} : s.navIcon}>
                {link.icon}
              </span>
              <span style={s.navLbl}>{link.label}</span>
              {active && (
                <span style={s.activePill}>Active</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom */}
      <div style={s.bottom}>
        {/* Role badge */}
        <div style={user?.role === 'admin' ? s.roleBadgeAdmin : s.roleBadgeTenant}>
          {user?.role === 'admin' ? '● Admin Access' : '● Tenant Access'}
        </div>

        {/* User card */}
        <div style={s.userCard}>
          <div style={user?.role === 'admin' ? s.avatar : s.avatarTenant}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={s.userInfo}>
            <div style={s.userName}>{user?.name}</div>
            <div style={s.userEmail}>{user?.email}</div>
          </div>
        </div>

        <button onClick={handleLogout} style={s.logoutBtn}>
          ← Sign out
        </button>
      </div>
    </aside>
  );
};

const s = {
  aside: {
    width: '248px',
    height: '100vh',
    position: 'sticky',
    top: 0,
    backgroundColor: '#ffffff',
    borderRight: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 18px',
    borderBottom: '1px solid #f3f4f6',
  },
  brandLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  brandBox: {
    width: '34px',
    height: '34px',
    backgroundColor: '#1e40af',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '11px',
    fontWeight: '800',
    letterSpacing: '0.5px',
    flexShrink: 0,
  },
  brandName: {
    fontSize: '14px',
    fontWeight: '800',
    color: '#111827',
    letterSpacing: '-0.2px',
  },
  brandSub: {
    fontSize: '11px',
    color: '#9ca3af',
  },
  navWrap: {
    flex: 1,
    padding: '16px 12px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  navSection: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#d1d5db',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    padding: '4px 10px 10px',
  },
  navBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: 'transparent',
    color: '#6b7280',
    fontSize: '13.5px',
    fontWeight: '500',
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
    position: 'relative',
    transition: 'all 0.1s',
  },
  navBtnActive: {
    backgroundColor: '#eff6ff',
    color: '#1e40af',
    fontWeight: '700',
  },
  activeAccent: {
    position: 'absolute',
    left: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    width: '3px',
    height: '20px',
    backgroundColor: '#2563eb',
    borderRadius: '0 2px 2px 0',
  },
  navIcon: {
    fontSize: '15px',
    width: '20px',
    textAlign: 'center',
    color: '#d1d5db',
    flexShrink: 0,
  },
  navLbl: { flex: 1 },
  activePill: {
    fontSize: '10px',
    fontWeight: '700',
    backgroundColor: '#bfdbfe',
    color: '#1e40af',
    padding: '2px 7px',
    borderRadius: '10px',
  },
  bottom: {
    padding: '16px',
    borderTop: '1px solid #f3f4f6',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  roleBadgeAdmin: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#1e40af',
    backgroundColor: '#eff6ff',
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid #bfdbfe',
  },
  roleBadgeTenant: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#dc2626',
    backgroundColor: '#fef2f2',
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid #fecaca',
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #f3f4f6',
  },
  avatar: {
    width: '32px',
    height: '32px',
    backgroundColor: '#1e40af',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '13px',
    fontWeight: '700',
    flexShrink: 0,
  },
  avatarTenant: {
    width: '32px',
    height: '32px',
    backgroundColor: '#dc2626',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '13px',
    fontWeight: '700',
    flexShrink: 0,
  },
  userInfo: { flex: 1, overflow: 'hidden' },
  userName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#111827',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userEmail: {
    fontSize: '11px',
    color: '#9ca3af',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  logoutBtn: {
    width: '100%',
    padding: '9px',
    backgroundColor: 'white',
    color: '#ef4444',
    border: '1.5px solid #fecaca',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  }, 
  closeBtn: { display: 'none', border: 'none', backgroundColor: 'transparent', fontSize: '18px', color: '#6b7280', cursor: 'pointer', padding: '4px' },
};

export default Sidebar;