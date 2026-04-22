import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { FiUsers, FiList, FiSearch, FiEdit2, FiTrash2, FiUser } from 'react-icons/fi';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [view, setView] = useState('users'); // 'users' or 'tasks'

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const { data } = await api.get('/admin/tasks', {
        params: { 
          userId: selectedUser?.id, 
          search, 
          status: statusFilter, 
          page, 
          limit: 5 
        }
      });
      setTasks(data.tasks);
      setTotalPages(data.pages);
    } catch (error) {
      console.error('Error fetching tasks', error);
    }
  };

  useEffect(() => {
    if (view === 'users') fetchUsers();
    else fetchTasks();
  }, [view, selectedUser, search, statusFilter, page]);

  const handleDeleteTask = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/admin/tasks/${id}`);
        fetchTasks();
      } catch (error) {
        console.error('Error deleting task', error);
      }
    }
  };

  const handleUserClick = (u) => {
    setSelectedUser(u);
    setView('tasks');
    setPage(1);
  };

  return (
    <div className="container animate-fade-in" style={styles.wrapper}>
      <div style={styles.header}>
        <div>
          <h2>Admin Dashboard</h2>
          <p style={styles.subtitle}>System Overview & Management</p>
        </div>
        <div style={styles.tabs}>
          <button 
            className={`btn ${view === 'users' ? 'btn-primary' : ''}`}
            style={styles.tabBtn}
            onClick={() => { setView('users'); setSelectedUser(null); }}
          >
            <FiUsers /> Users
          </button>
          <button 
            className={`btn ${view === 'tasks' ? 'btn-primary' : ''}`}
            style={styles.tabBtn}
            onClick={() => { setView('tasks'); setSelectedUser(null); }}
          >
            <FiList /> All Tasks
          </button>
        </div>
      </div>

      {view === 'users' ? (
        <div className="glass-panel" style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Joined</th>
                <th>Tasks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={styles.tr}>
                  <td><div style={styles.userInfo}><FiUser style={{marginRight: '0.5rem'}}/> {u.name}</div></td>
                  <td>{u.email}</td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td><span className="badge badge-pending">{u.taskCount} tasks</span></td>
                  <td>
                    <button className="btn" style={styles.viewBtn} onClick={() => handleUserClick(u)}>
                      View Tasks
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          <div className="glass-panel controls-wrapper" style={styles.controls}>
            <div style={styles.searchWrapper}>
              <FiSearch style={styles.searchIcon} />
              <input
                type="text"
                className="form-input"
                placeholder="Search all tasks..."
                style={{ paddingLeft: '2.5rem' }}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <select
              className="form-input filter-select"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {selectedUser && (
            <div style={styles.userBanner}>
              Viewing tasks for: <strong>{selectedUser.name} ({selectedUser.email})</strong>
              <button style={styles.clearBtn} onClick={() => setSelectedUser(null)}>Clear Filter</button>
            </div>
          )}

          <div className="scroll-view">
            <div style={styles.grid}>
              {tasks.map(task => (
                <div key={task.id} className="glass-panel" style={styles.card}>
                  <div style={styles.cardHeader}>
                    <span className={`badge badge-${task.status}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                    <div style={styles.actions}>
                      <button style={{...styles.actionBtn, color: 'var(--danger)'}} onClick={() => handleDeleteTask(task.id)}>
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                  <h3 style={styles.cardTitle}>{task.title}</h3>
                  <p style={styles.userLabel}>Owner: {task.userName}</p>
                  {task.description && <p style={styles.cardDesc}>{task.description}</p>}
                  <p style={styles.date}>Created: {new Date(task.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
            
            {totalPages > 1 && (
              <div style={styles.pagination}>
                <button 
                  className="btn" 
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  Prev
                </button>
                <span style={styles.pageInfo}>Page {page} of {totalPages}</span>
                <button 
                  className="btn" 
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const styles = {
  wrapper: {
    paddingTop: '2rem',
    paddingBottom: '2rem',
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 72px)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    flexShrink: 0,
  },
  subtitle: {
    color: 'var(--text-muted)',
    marginTop: '0.25rem',
  },
  tabs: {
    display: 'flex',
    gap: '0.5rem',
  },
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  tableCard: {
    padding: '0',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  tr: {
    borderBottom: '1px solid var(--border)',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    padding: '1rem',
  },
  viewBtn: {
    fontSize: '0.8rem',
    padding: '0.4rem 0.8rem',
    background: 'var(--surface-hover)',
  },
  controls: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1rem',
    padding: '1rem',
    flexShrink: 0,
  },
  searchWrapper: {
    flex: 1,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: '1rem',
    color: 'var(--text-muted)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    padding: '1.5rem',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '1rem',
  },
  cardTitle: {
    fontSize: '1.1rem',
    marginBottom: '0.25rem',
  },
  userLabel: {
    fontSize: '0.8rem',
    color: 'var(--primary)',
    marginBottom: '0.75rem',
    fontWeight: '600',
  },
  cardDesc: {
    color: 'var(--text-muted)',
    fontSize: '0.875rem',
    marginBottom: '1rem',
  },
  date: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  userBanner: {
    background: 'rgba(99,102,241,0.1)',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius)',
    marginBottom: '1rem',
    fontSize: '0.9rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clearBtn: {
    fontSize: '0.75rem',
    color: 'var(--primary)',
    background: 'none',
    fontWeight: '600',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1rem',
    marginTop: '2rem',
    paddingBottom: '2rem',
  },
  pageInfo: {
    fontSize: '0.875rem',
    color: 'var(--text-muted)',
  },
};

export default AdminDashboard;
