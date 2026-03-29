import { useState } from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children, title, subtitle, action }) => {
  const [open, setOpen] = useState(false);

  return (
    <div style={s.root}>

      {/* Overlay */}
      {open && (
        <div
          className="overlay"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar — NO inline position styles, let CSS handle it */}
      <div className={`sidebar-wrap ${open ? 'open' : ''}`}>
        <Sidebar onClose={() => setOpen(false)} />
      </div>

      {/* Main */}
      <div style={s.main}>
        <header className="page-header" style={s.header}>
          <div style={s.headerLeft}>
            <button
              className="hamburger-btn"
              onClick={() => setOpen(true)}
            >
              <span style={s.hLine} />
              <span style={s.hLine} />
              <span style={s.hLine} />
            </button>
            <div style={{ minWidth: 0 }}>
              <h1 style={s.title}>{title}</h1>
              {subtitle && <p style={s.subtitle}>{subtitle}</p>}
            </div>
          </div>
          {action && <div style={s.actionWrap}>{action}</div>}
        </header>
        <main className="page-content" style={s.content}>
          {children}
        </main>
      </div>
    </div>
  );
};

const s = {
  root: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    fontFamily: 'Inter, sans-serif',
    position: 'relative',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    position: 'sticky',
    top: 0,
    zIndex: 10,
    gap: '12px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
    minWidth: 0,
  },
  hLine: {
    display: 'block',
    width: '20px',
    height: '2px',
    backgroundColor: '#374151',
    borderRadius: '1px',
  },
  title: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#111827',
    letterSpacing: '-0.3px',
    fontFamily: 'Inter, sans-serif',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  subtitle: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '2px',
    fontFamily: 'Inter, sans-serif',
  },
  actionWrap: { flexShrink: 0 },
  content: {
    flex: 1,
    padding: '24px',
    overflowY: 'auto',
    overflowX: 'hidden',
  },
};

export default Layout;