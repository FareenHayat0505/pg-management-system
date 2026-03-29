import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Login = () => {
  const [tab, setTab] = useState('admin');
  const [email, setEmail] = useState('admin@pgstay.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const switchTab = (role) => {
    setTab(role);
    setEmail(role === 'admin' ? 'admin@pgstay.com' : 'aryan@mail.com');
    setPassword(role === 'admin' ? 'admin123' : 'tenant123');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(user.role === 'admin' ? '/' : '/maintenance');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>

      {/* ── LEFT PANEL ── */}
      <div style={s.left}>

        {/* Top nav bar */}
        <div style={s.topBar}>
          <div style={s.logo}>
            <div style={s.logoBox}>PG</div>
            <span style={s.logoText}>Stay</span>
          </div>
          <div style={s.topBadge}>Management System</div>
        </div>

        {/* Hero content */}
        <div style={s.hero}>
          <div style={s.heroTag}>🏠 PG Management</div>
          <h1 style={s.heroTitle}>
            Run your PG<br />
            <span style={s.heroRed}>smarter,</span><br />
            not harder.
          </h1>
          <p style={s.heroSub}>
            Everything you need to manage rooms,
            tenants, payments and maintenance —
            in one professional platform.
          </p>

          {/* Feature cards */}
          <div style={s.featureGrid}>
            {[
              { icon: '🏢', title: 'Multi-Property', desc: 'Manage multiple PG locations' },
              { icon: '💳', title: 'Payments', desc: 'Track rent & due dates' },
              { icon: '🔧', title: 'Maintenance', desc: 'Real-time chat support' },
              { icon: '📢', title: 'Notices', desc: 'Broadcast to all tenants' },
            ].map(f => (
              <div key={f.title} style={s.featureCard}>
                <div style={s.featureIcon}>{f.icon}</div>
                <div style={s.featureTitle}>{f.title}</div>
                <div style={s.featureDesc}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom strip */}
        <div style={s.leftBottom}>
          <div style={s.strip}>
            {['Rooms', 'Tenants', 'Payments', 'Maintenance', 'Notices', 'Reports'].map(t => (
              <span key={t} style={s.stripItem}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={s.right}>
        <div style={s.formWrap}>

          {/* Header */}
          <div style={s.formHeader}>
            <div style={s.formLogo}>
              <div style={s.formLogoBox}>PG</div>
              <div>
                <div style={s.formLogoName}>PG Stay</div>
                <div style={s.formLogoSub}>Admin Portal</div>
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
              <span style={s.roleBtnIcon}>👤</span>
              Admin
            </button>
            <button
              style={tab === 'tenant' ? {...s.roleBtn, ...s.roleBtnActiveTenant} : s.roleBtn}
              onClick={() => switchTab('tenant')}
            >
              <span style={s.roleBtnIcon}>🏠</span>
              Tenant
            </button>
          </div>

          {/* Active role indicator */}
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
                  placeholder="you@example.com"
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
                  placeholder="••••••••"
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
              {loading ? 'Signing in...' : `Sign in as ${tab === 'admin' ? 'Admin' : 'Tenant'} →`}
            </button>
          </form>

          {/* Credentials hint */}
          <div style={s.credHint}>
            <div style={s.credHintTitle}>Pre-filled credentials</div>
            <div style={s.credRow}>
              <span style={s.credBadgeBlue}>Admin</span>
              <code style={s.credCode}>admin@pgstay.com / admin123</code>
            </div>
            <div style={s.credRow}>
              <span style={s.credBadgeRed}>Tenant</span>
              <code style={s.credCode}>aryan@mail.com / tenant123</code>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const s = {
  page: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: 'Inter, sans-serif',
  },

  // ── LEFT ──
  left: {
    flex: 1,
    backgroundColor: '#1e40af',
    backgroundImage: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 40%, #2563eb 100%)',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '24px 36px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logoBox: {
    width: '36px',
    height: '36px',
    backgroundColor: '#ef4444',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '12px',
    fontWeight: '800',
    letterSpacing: '0.5px',
  },
  logoText: {
    color: 'white',
    fontSize: '18px',
    fontWeight: '800',
    letterSpacing: '-0.3px',
  },
  topBadge: {
    fontSize: '11px',
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: '1px',
    textTransform: 'uppercase',
  },
  hero: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '0 36px 36px',
  },
  heroTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.85)',
    fontSize: '12px',
    fontWeight: '600',
    padding: '6px 14px',
    borderRadius: '20px',
    marginBottom: '24px',
    width: 'fit-content',
    border: '1px solid rgba(255,255,255,0.15)',
  },
  heroTitle: {
    fontSize: '52px',
    fontWeight: '800',
    color: 'white',
    lineHeight: 1.1,
    letterSpacing: '-1.5px',
    marginBottom: '20px',
  },
  heroRed: {
    color: '#fca5a5',
  },
  heroSub: {
    fontSize: '15px',
    color: 'rgba(255,255,255,0.65)',
    lineHeight: 1.75,
    marginBottom: '36px',
    maxWidth: '380px',
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    maxWidth: '420px',
  },
  featureCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: '12px',
    padding: '16px',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  featureIcon: {
    fontSize: '20px',
    marginBottom: '8px',
  },
  featureTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'white',
    marginBottom: '4px',
  },
  featureDesc: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.55)',
  },
  leftBottom: {
    borderTop: '1px solid rgba(255,255,255,0.1)',
  },
  strip: {
    display: 'flex',
    gap: '0',
    overflowX: 'auto',
  },
  stripItem: {
    flex: 1,
    textAlign: 'center',
    padding: '14px 8px',
    fontSize: '11px',
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: '0.5px',
    borderRight: '1px solid rgba(255,255,255,0.08)',
    whiteSpace: 'nowrap',
  },

  // ── RIGHT ──
  right: {
    width: '480px',
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    flexShrink: 0,
  },
  formWrap: {
    width: '100%',
    maxWidth: '380px',
  },
  formHeader: {
    marginBottom: '32px',
  },
  formLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  formLogoBox: {
    width: '40px',
    height: '40px',
    backgroundColor: '#1e40af',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '13px',
    fontWeight: '800',
  },
  formLogoName: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#111827',
    letterSpacing: '-0.2px',
  },
  formLogoSub: {
    fontSize: '12px',
    color: '#9ca3af',
  },
  formTitle: {
    fontSize: '26px',
    fontWeight: '800',
    color: '#111827',
    letterSpacing: '-0.5px',
    marginBottom: '6px',
  },
  formSub: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '28px',
  },
  roleSwitcher: {
    display: 'flex',
    gap: '8px',
    marginBottom: '12px',
  },
  roleBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '10px',
    border: '1.5px solid #e5e7eb',
    borderRadius: '10px',
    backgroundColor: 'white',
    color: '#6b7280',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  roleBtnActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
    color: '#1e40af',
    fontWeight: '700',
  },
  roleBtnActiveTenant: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    fontWeight: '700',
  },
  roleBtnIcon: { fontSize: '15px' },
  roleIndicatorAdmin: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#1e40af',
    backgroundColor: '#eff6ff',
    padding: '8px 14px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #bfdbfe',
  },
  roleIndicatorTenant: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#dc2626',
    backgroundColor: '#fef2f2',
    padding: '8px 14px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #fecaca',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
  },
  inputWrap: {
    display: 'flex',
    alignItems: 'center',
    border: '1.5px solid #e5e7eb',
    borderRadius: '10px',
    overflow: 'hidden',
    backgroundColor: '#fafafa',
    transition: 'border-color 0.15s',
  },
  inputIcon: {
    padding: '0 12px',
    fontSize: '14px',
    color: '#9ca3af',
  },
  input: {
    flex: 1,
    padding: '11px 12px 11px 0',
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    color: '#111827',
    backgroundColor: 'transparent',
  },
  submitBtn: {
    padding: '13px',
    backgroundColor: '#1e40af',
    backgroundImage: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '4px',
    transition: 'opacity 0.15s',
    letterSpacing: '0.2px',
  },
  submitBtnTenant: {
    backgroundImage: 'linear-gradient(135deg, #b91c1c, #ef4444)',
  },
  credHint: {
    marginTop: '28px',
    padding: '16px',
    backgroundColor: '#f9fafb',
    borderRadius: '10px',
    border: '1px solid #f1f5f9',
  },
  credHintTitle: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#9ca3af',
    letterSpacing: '0.8px',
    textTransform: 'uppercase',
    marginBottom: '12px',
  },
  credRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '8px',
  },
  credBadgeBlue: {
    fontSize: '10px',
    fontWeight: '700',
    backgroundColor: '#eff6ff',
    color: '#1e40af',
    padding: '3px 8px',
    borderRadius: '5px',
    minWidth: '48px',
    textAlign: 'center',
  },
  credBadgeRed: {
    fontSize: '10px',
    fontWeight: '700',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    padding: '3px 8px',
    borderRadius: '5px',
    minWidth: '48px',
    textAlign: 'center',
  },
  credCode: {
    fontSize: '12px',
    color: '#374151',
    fontFamily: 'monospace',
  },
};

export default Login;