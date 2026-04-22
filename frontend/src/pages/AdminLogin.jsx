import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FiUser, FiLock, FiShield } from 'react-icons/fi';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const userData = await login(email, password);
      if (userData.role !== 'admin') {
        setError('Access denied. This portal is for admins only.');
        return;
      }
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    }
  };

  return (
    <div style={styles.bg}>
      <div className="glass-panel animate-fade-in" style={styles.panel}>
        <div style={styles.header}>
          <div style={styles.iconWrapper}>
            <FiShield size={32} color="var(--primary)" />
          </div>
          <h2 style={styles.title}>Admin Portal</h2>
          <p style={styles.subtitle}>Restricted access — Admins only</p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <div style={styles.inputIconWrapper}>
              <FiUser style={styles.icon} />
              <input
                id="admin-email"
                type="email"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@gmail.com"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={styles.inputIconWrapper}>
              <FiLock style={styles.icon} />
              <input
                id="admin-password"
                type="password"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button id="admin-login-btn" type="submit" className="btn btn-primary" style={styles.submitBtn}>
            Sign In as Admin
          </button>
        </form>

        <p style={styles.footer}>
          Regular user? <Link to="/login">User Login</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  bg: {
    minHeight: 'calc(100vh - 72px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    background: 'radial-gradient(circle at top, rgba(99,102,241,0.15) 0%, transparent 60%)',
  },
  panel: {
    width: '100%',
    maxWidth: '420px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  iconWrapper: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: 'rgba(99,102,241,0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1rem',
    border: '1px solid rgba(99,102,241,0.3)',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '700',
  },
  subtitle: {
    color: 'var(--text-muted)',
    marginTop: '0.4rem',
    fontSize: '0.875rem',
  },
  error: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    color: 'var(--danger)',
    padding: '0.75rem',
    borderRadius: 'var(--radius)',
    marginBottom: '1.5rem',
    fontSize: '0.875rem',
    textAlign: 'center',
  },
  inputIconWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    position: 'absolute',
    left: '1rem',
    color: 'var(--text-muted)',
  },
  submitBtn: {
    width: '100%',
    marginTop: '1rem',
  },
  footer: {
    marginTop: '1.5rem',
    textAlign: 'center',
    fontSize: '0.875rem',
    color: 'var(--text-muted)',
  },
};

export default AdminLogin;
