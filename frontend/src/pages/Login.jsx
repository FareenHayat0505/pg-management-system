import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Login = () => {
  const [tab, setTab]           = useState('admin');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const switchTab = (role) => {
    setTab(role);
    setEmail('');
    setPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(user.role === 'admin' ? '/' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>

      {/* ── LEFT PANEL (desktop only) ── */}
      <div className="login-left" style={s.left}>
        <div style={s.topBar}>
          <div style={s.logo}>
            <div style={s.logoBox}>PG</div>
            <span style={s.logoText}>Stay</span>
          </div>
          <div style={s.topBadge}>Management System</div>
        </div>

        <div style={s.hero}>
          <div style={s.heroTag}>🏠 PG Management</div>
          <h1 style={s.heroTitle}>
            Run your PG<br />
            <span style={s.heroRed}>smarter,</span><br />
            not harder.
          </h1>
          <p style={s.heroSub}>
            Everything you need to manage rooms, tenants,
            payments and maintenance — in one professional platform.
          </p>
          <div style={s.featureGrid}>
            {[
              { icon: '🏢', title: 'Multi-Property', desc: 'Manage multiple PG locations' },
              { icon: '💳', title: 'Payments',       desc: 'Track rent & due dates' },
              { icon: '🔧', title: 'Maintenance',    desc: 'Real-time chat support' },
              { icon: '📢', title: 'Notices',        desc: 'Broadcast to all tenants' },
            ].map(f => (
              <div key={f.title} style={s.featureCard}>
                <div style={s.featureIcon}>{f.icon}</div>
                <div style={s.featureTitle}>{f.title}</div>
                <div style={s.featureDesc}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={s.leftBottom}>
          <div style={s.strip}>
            {['Rooms', 'Tenants', 'Payments', 'Maintenance', 'Notices', 'Reports'].map(t => (
              <span key={t} style={s.stripItem}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="login-right" style={s.right}>

        {/* Mobile blue header */}
        <div className="login-mobile-header" style={s.mobileHeader}>
          <div style={s.mobileLogoRow}>
            <div style={s.mobileLogoBox}>PG</div>
            <span style={s.mobileLogoText}>PG Stay</span>
          </div>
          <div style={s.mobileTagline}>Smart PG Management</div>
          <div style={s.mobilePills}>
            {['Rooms', 'Payments', 'Maintenance', 'Notices'].map(t => (
              <span key={t} style={s.mobilePill}>{t}</span>
            ))}
          </div>
        </div>

        {/* Form area */}
        <div style={s.formArea}>
          <div style={s.formWrap}>

            {/* Logo */}
            <div style={s.formHeader}>
              <div style={s.formLogo}>
                <div style={s.formLogoBox}>PG</div>
                <div>
                  <div style={s.formLogoName}>PG Stay</div>
                  <div style={s.formLogoSub}>Management Portal</div>
                </div>
              </div>
            </div>

            <h2 style={s.formTitle}>Welcome back</h2>
            <p style={s.formSub}>Sign in to continue to your dashboard</p>

            {/* Role Switcher */}
            <div style={s.roleSwitcher}>
              <button
                style={tab === 'admin' ? {...s.roleBtn, ...s.roleBtnActive} : s.roleBtn}
                onClick={() => switchTab('admin')}
              >
                <span>👤</span> Admin
              </button>
              <button
                style={tab === 'tenant' ? {...s.roleBtn, ...s.roleBtnActiveTenant} : s.roleBtn}
                onClick={() => switchTab('tenant')}
              >
                <span>🏠</span> Tenant
              </button>
            </div>

            <div style={tab === 'admin' ? s.roleIndicatorAdmin : s.roleIndicatorTenant}>
              {tab === 'admin' ? '🔵 Signing in as Administrator' : '🔴 Signing in as Tenant'}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={s.form}>
              <div style={s.fieldGroup}>
                <label style={s.label}>Email Address</label>
                <div style={s.inputWrap}>
                  <span style={s.inputIcon}>✉</span>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={s.input}
                    placeholder="Enter your email"
                    onFocus={e => e.target.parentElement.style.borderColor = '#2563eb'}
                    onBlur={e => e.target.parentElement.style.borderColor = '#e5e7eb'}
                    required
                  />
                </div>
              </div>

              <div style={s.fieldGroup}>
                <label style={s.label}>Password</label>
                <div style={s.inputWrap}>
                  <span style={s.inputIcon}>🔒</span>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={s.input}
                    placeholder="Enter your password"
                    onFocus={e => e.target.parentElement.style.borderColor = '#2563eb'}
                    onBlur={e => e.target.parentElement.style.borderColor = '#e5e7eb'}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                style={tab === 'admin'
                  ? {...s.submitBtn, opacity: loading ? 0.75 : 1}
                  : {...s.submitBtn, ...s.submitBtnTenant, opacity: loading ? 0.75 : 1}}
                disabled={loading}
              >
                {loading ? 'Signing in...' : `Sign in →`}
              </button>
            </form>

            {/* Info note */}
            <div style={s.infoNote}>
              <div style={s.infoNoteTitle}>ℹ️ How to login</div>
              <div style={s.infoNoteText}>
                <strong>Admin:</strong> Use your admin credentials to manage the PG.
              </div>
              <div style={s.infoNoteText}>
                <strong>Tenant:</strong> Use the email and password set by your admin.
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

const s = {
  page: { display: 'flex', minHeight: '100vh', fontFamily: "'Poppins', sans-serif" },

  // LEFT
  left: { flex: 1, backgroundColor: '#1e40af', backgroundImage: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 40%, #2563eb 100%)', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  topBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 36px' },
  logo: { display: 'flex', alignItems: 'center', gap: '10px' },
  logoBox: { width: '36px', height: '36px', backgroundColor: '#ef4444', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: '800' },
  logoText: { color: 'white', fontSize: '18px', fontWeight: '800' },
  topBadge: { fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.6)', letterSpacing: '1px', textTransform: 'uppercase' },
  hero: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 36px 36px' },
  heroTag: { display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)', fontSize: '12px', fontWeight: '600', padding: '6px 14px', borderRadius: '20px', marginBottom: '24px', width: 'fit-content', border: '1px solid rgba(255,255,255,0.15)' },
  heroTitle: { fontSize: '52px', fontWeight: '800', color: 'white', lineHeight: 1.1, letterSpacing: '-1.5px', marginBottom: '20px' },
  heroRed: { color: '#fca5a5' },
  heroSub: { fontSize: '15px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.75, marginBottom: '36px', maxWidth: '380px' },
  featureGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', maxWidth: '420px' },
  featureCard: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.1)' },
  featureIcon: { fontSize: '20px', marginBottom: '8px' },
  featureTitle: { fontSize: '13px', fontWeight: '700', color: 'white', marginBottom: '4px' },
  featureDesc: { fontSize: '12px', color: 'rgba(255,255,255,0.55)' },
  leftBottom: { borderTop: '1px solid rgba(255,255,255,0.1)' },
  strip: { display: 'flex', overflowX: 'auto' },
  stripItem: { flex: 1, textAlign: 'center', padding: '14px 8px', fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.4)', borderRight: '1px solid rgba(255,255,255,0.08)', whiteSpace: 'nowrap' },

  // RIGHT
  right: { width: '480px', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', flexShrink: 0, overflowY: 'auto' },
  mobileHeader: { display: 'none' },
  formArea: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' },
  formWrap: { width: '100%', maxWidth: '380px' },
  formHeader: { marginBottom: '28px' },
  formLogo: { display: 'flex', alignItems: 'center', gap: '12px' },
  formLogoBox: { width: '40px', height: '40px', backgroundColor: '#1e40af', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '13px', fontWeight: '800' },
  formLogoName: { fontSize: '16px', fontWeight: '800', color: '#111827' },
  formLogoSub: { fontSize: '12px', color: '#9ca3af' },
  formTitle: { fontSize: '26px', fontWeight: '800', color: '#111827', letterSpacing: '-0.5px', marginBottom: '6px' },
  formSub: { fontSize: '14px', color: '#6b7280', marginBottom: '24px' },

  roleSwitcher: { display: 'flex', gap: '8px', marginBottom: '12px' },
  roleBtn: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', border: '1.5px solid #e5e7eb', borderRadius: '10px', backgroundColor: 'white', color: '#6b7280', fontSize: '13px', fontWeight: '500', cursor: 'pointer' },
  roleBtnActive: { borderColor: '#2563eb', backgroundColor: '#eff6ff', color: '#1e40af', fontWeight: '700' },
  roleBtnActiveTenant: { borderColor: '#ef4444', backgroundColor: '#fef2f2', color: '#dc2626', fontWeight: '700' },
  roleIndicatorAdmin: { fontSize: '12px', fontWeight: '500', color: '#1e40af', backgroundColor: '#eff6ff', padding: '8px 14px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #bfdbfe' },
  roleIndicatorTenant: { fontSize: '12px', fontWeight: '500', color: '#dc2626', backgroundColor: '#fef2f2', padding: '8px 14px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #fecaca' },

  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#374151' },
  inputWrap: { display: 'flex', alignItems: 'center', border: '1.5px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#fafafa', transition: 'border-color 0.15s' },
  inputIcon: { padding: '0 12px', fontSize: '14px', color: '#9ca3af' },
  input: { flex: 1, padding: '11px 12px 11px 0', border: 'none', outline: 'none', fontSize: '14px', color: '#111827', backgroundColor: 'transparent' },
  submitBtn: { padding: '13px', backgroundColor: '#1e40af', backgroundImage: 'linear-gradient(135deg, #1e3a8a, #2563eb)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', marginTop: '4px' },
  submitBtnTenant: { backgroundImage: 'linear-gradient(135deg, #b91c1c, #ef4444)' },

  infoNote: { marginTop: '24px', padding: '14px 16px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e5e7eb' },
  infoNoteTitle: { fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '8px' },
  infoNoteText: { fontSize: '12px', color: '#6b7280', marginBottom: '4px' },

  // Mobile header
  mobileLogoRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' },
  mobileLogoBox: { width: '40px', height: '40px', backgroundColor: '#ef4444', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '13px', fontWeight: '800' },
  mobileLogoText: { color: 'white', fontSize: '22px', fontWeight: '800' },
  mobileTagline: { color: 'rgba(255,255,255,0.7)', fontSize: '13px', marginBottom: '16px' },
  mobilePills: { display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' },
  mobilePill: { backgroundColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)', fontSize: '11px', fontWeight: '600', padding: '4px 12px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.2)' },
};

export default Login;