import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('pending');
  const [dueDate, setDueDate] = useState('');

  const fetchTasks = async () => {
    try {
      const { data } = await api.get('/tasks', {
        params: { status: statusFilter, search, page, limit: 5 },
      });
      setTasks(data.tasks);
      setTotalPages(data.pages);
    } catch (error) {
      console.error('Error fetching tasks', error);
    }
  };

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, search]);

  useEffect(() => {
    fetchTasks();
  }, [statusFilter, search, page]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { title, description, status, dueDate: dueDate || null };

    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}`, payload);
      } else {
        await api.post('/tasks', payload);
      }
      setShowModal(false);
      resetForm();
      fetchTasks();
    } catch (error) {
      console.error('Error saving task', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/tasks/${id}`);
        fetchTasks();
      } catch (error) {
        console.error('Error deleting task', error);
      }
    }
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setStatus(task.status);
    setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setStatus('pending');
    setDueDate('');
  };

  return (
    <div className="container animate-fade-in" style={styles.wrapper}>
      <div style={styles.header}>
        <div>
          <h2>My Tasks</h2>
          <p style={styles.subtitle}>Manage your daily goals</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
          <FiPlus /> <span style={{ marginLeft: '0.5rem' }}>New Task</span>
        </button>
      </div>

      <div className="glass-panel controls-wrapper" style={styles.controls}>
        <div style={styles.searchWrapper}>
          <FiSearch style={styles.searchIcon} />
          <input
            type="text"
            className="form-input"
            placeholder="Search tasks..."
            style={{ paddingLeft: '2.5rem' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="form-input filter-select"
          style={styles.filter}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="scroll-view">
        <div style={styles.grid}>
          {tasks.map(task => (
            <div key={task.id} className="glass-panel" style={styles.card}>
              <div style={styles.cardHeader}>
                <span className={`badge badge-${task.status}`}>
                  {task.status.replace('_', ' ')}
                </span>
                <div style={styles.actions}>
                  <button style={styles.actionBtn} onClick={() => openEditModal(task)}>
                    <FiEdit2 />
                  </button>
                  <button style={{ ...styles.actionBtn, color: 'var(--danger)' }} onClick={() => handleDelete(task.id)}>
                    <FiTrash2 />
                  </button>
                </div>
              </div>
              <h3 style={styles.cardTitle}>{task.title}</h3>
              {task.description && <p style={styles.cardDesc}>{task.description}</p>}
              {task.dueDate && (
                <p style={styles.date}>Due: {new Date(task.dueDate).toLocaleDateString()}</p>
              )}
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div style={styles.pagination}>
            <button
              className="btn"
              style={styles.pageBtn}
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span style={styles.pageInfo}>Page {page} of {totalPages}</span>
            <button
              className="btn"
              style={styles.pageBtn}
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div style={styles.modalOverlay}>
          <div className="glass-panel animate-fade-in" style={styles.modal}>
            <h3 style={{ marginBottom: '1.5rem' }}>{editingTask ? 'Edit Task' : 'Create Task'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-input" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
              <div style={styles.modalActions}>
                <button type="button" className="btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Task</button>
              </div>
            </form>
          </div>
        </div>
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
    height: 'calc(100vh - 72px)', /* Assuming Navbar is 72px tall */
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
  controls: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.5rem',
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
  filter: {
    width: '200px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
  },
  actions: {
    display: 'flex',
    gap: '0.5rem',
  },
  actionBtn: {
    background: 'none',
    color: 'var(--text-muted)',
    padding: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.2s',
  },
  cardTitle: {
    fontSize: '1.25rem',
    marginBottom: '0.5rem',
  },
  cardDesc: {
    color: 'var(--text-muted)',
    fontSize: '0.875rem',
    marginBottom: '1rem',
    flex: 1,
  },
  date: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginTop: 'auto',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem',
  },
  modal: {
    width: '100%',
    maxWidth: '500px',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
    marginTop: '2rem',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1.5rem',
    marginTop: '2rem',
    padding: '1rem 0',
  },
  pageBtn: {
    backgroundColor: 'var(--surface-hover)',
    color: 'var(--text-main)',
    padding: '0.5rem 1rem',
  },
  pageInfo: {
    fontSize: '0.875rem',
    color: 'var(--text-muted)',
    fontWeight: '500',
  },
};

export default Dashboard;
