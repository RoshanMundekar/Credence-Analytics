import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FiCheckSquare, FiLogOut } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.navbar}>
      <div className="container" style={styles.container}>
        <Link to={user?.role === 'admin' ? "/admin/dashboard" : "/"} style={styles.brand}>
          <FiCheckSquare size={24} color="var(--primary)" />
          <span style={styles.brandText}>TaskMaster</span>
          {user?.role === 'admin' && <span className="badge badge-pending" style={{marginLeft: '0.5rem'}}>ADMIN</span>}
        </Link>
        <div>
          {user ? (
            <div style={styles.userSection}>
              <span style={styles.userName}>Hello, {user.name}</span>
              <button onClick={handleLogout} className="btn" style={styles.logoutBtn}>
                <FiLogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div style={styles.authLinks}>
              <Link to="/admin/login" style={{...styles.link, fontSize: '0.8rem', color: 'var(--text-muted)'}}>Admin Portal</Link>
              <Link to="/login" style={styles.link}>Login</Link>
              <Link to="/register" className="btn btn-primary">Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    backgroundColor: 'var(--surface)',
    borderBottom: '1px solid var(--border)',
    padding: '1rem 0',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  brandText: {
    fontSize: '1.25rem',
    fontWeight: '700',
    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  userName: {
    color: 'var(--text-muted)',
    fontWeight: '500',
  },
  logoutBtn: {
    backgroundColor: 'transparent',
    color: 'var(--text-main)',
    border: '1px solid var(--border)',
    display: 'flex',
    gap: '0.5rem',
  },
  authLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  link: {
    fontWeight: '500',
  },
};

export default Navbar;
