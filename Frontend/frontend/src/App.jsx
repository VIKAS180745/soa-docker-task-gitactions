
import { useEffect, useState } from 'react';
import './App.css';

const API = 'http://localhost:8001/recyclingcenter';

const emptyForm = {
  centerName: '',
  materialType: '',
  dailyCapacityKg: '',
  open: true,
};

function App() {
  const [centers, setCenters] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [searchId, setSearchId] = useState('');
  const [filterOpen, setFilterOpen] = useState('all');
  const [editId, setEditId] = useState(null);

  async function request(path, options = {}) {
    const response = await fetch(`${API}${path}`, options);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Recycling center not found.');
      }
      throw new Error(`Request failed (${response.status}).`);
    }

    const type = response.headers.get('content-type') || '';
    return type.includes('application/json')
      ? response.json()
      : response.text();
  }

  async function loadCenters() {
    setLoading(true);
    setError('');

    try {
      const data = await request('/DisplayAll');
      setCenters(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Unable to load centers. Check backend and CORS.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCenters();
  }, []);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  function clearMessages() {
    setMessage('');
    setError('');
  }

  function resetForm() {
    setForm({ ...emptyForm });
    setEditId(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    clearMessages();

    const capacity = Number(form.dailyCapacityKg);

    if (!form.centerName.trim() || !form.materialType.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (
      form.dailyCapacityKg === '' ||
      !Number.isFinite(capacity) ||
      capacity <= 0
    ) {
      setError('Daily capacity must be greater than zero.');
      return;
    }

    setSaving(true);

    try {
      const body = {
        centerName: form.centerName.trim(),
        materialType: form.materialType.trim(),
        dailyCapacityKg: capacity,
        open: form.open,
      };

      if (editId !== null) {
        await request(`/Update/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        setMessage(`Recycling center ${editId} updated successfully!`);
      } else {
        await request('/Add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        setMessage('Recycling center added successfully!');
      }

      resetForm();
      await loadCenters();
    } catch (err) {
      setError(err.message || 'Operation failed.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSearchById(event) {
    event.preventDefault();
    clearMessages();

    if (!searchId || Number(searchId) <= 0) {
      setError('Enter a valid recycling center ID.');
      return;
    }

    setLoading(true);

    try {
      const center = await request(`/DisplayById/${searchId}`);
      setCenters([center]);
      setMessage(`Showing recycling center ID ${searchId}.`);
    } catch (err) {
      setError(err.message || 'Could not find the center.');
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusFilter(value) {
    setFilterOpen(value);
    clearMessages();
    setLoading(true);

    try {
      const path =
        value === 'all'
          ? '/DisplayAll'
          : `/DisplayByStatus?open=${value}`;

      const data = await request(path);
      setCenters(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Unable to filter centers.');
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(center) {
    clearMessages();
    setEditId(center.id);
    setForm({
      centerName: center.centerName ?? '',
      materialType: center.materialType ?? '',
      dailyCapacityKg: String(center.dailyCapacityKg ?? ''),
      open: Boolean(center.open),
    });

    document.getElementById('add')?.scrollIntoView({
      behavior: 'smooth',
    });
  }

  async function handleDelete(id) {
    if (!window.confirm(`Delete recycling center ${id}?`)) return;

    clearMessages();

    try {
      await request(`/Delete/${id}`, { method: 'DELETE' });
      setMessage('Recycling center deleted successfully!');
      await loadCenters();
    } catch (err) {
      setError(err.message || 'Could not delete the center.');
    }
  }

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark app-navbar">
        <div className="container">
          <a className="navbar-brand fw-bold" href="#home">♻ EcoCenter</a>
          <div className="navbar-nav ms-auto flex-row gap-3">
            <a className="nav-link" href="#add">Add Center</a>
            <a className="nav-link" href="#centers">View Centers</a>
          </div>
        </div>
      </nav>

      <header className="hero" id="home">
        <div className="container">
          <span className="hero-tag">SUSTAINABLE FUTURE</span>
          <h1>Recycling Center Management</h1>
          <p>Manage recycling centers and support a cleaner, greener world.</p>
          <a href="#centers" className="btn btn-light mt-2">
            Explore Centers ↓
          </a>
        </div>
      </header>

      <main className="container py-5">
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <section id="add" className="content-card mb-5">
          <div className="section-heading">
            <span>01 / REGISTER</span>
            <h2>{editId !== null ? `Update Center #${editId}` : 'Add Recycling Center'}</h2>
            <p>ID is generated by the backend and is never entered manually.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label" htmlFor="centerName">Center Name *</label>
                <input
                  id="centerName"
                  name="centerName"
                  className="form-control"
                  value={form.centerName}
                  onChange={handleChange}
                  maxLength={100}
                  required
                  placeholder="Green Recycling Center"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label" htmlFor="materialType">Material Type *</label>
                <input
                  id="materialType"
                  name="materialType"
                  className="form-control"
                  value={form.materialType}
                  onChange={handleChange}
                  maxLength={100}
                  required
                  placeholder="Plastic, Paper, Metal..."
                />
              </div>

              <div className="col-md-6">
                <label className="form-label" htmlFor="dailyCapacityKg">
                  Daily Capacity (kg) *
                </label>
                <input
                  id="dailyCapacityKg"
                  name="dailyCapacityKg"
                  type="number"
                  className="form-control"
                  value={form.dailyCapacityKg}
                  onChange={handleChange}
                  min="0.01"
                  step="any"
                  required
                  placeholder="250"
                />
              </div>

              <div className="col-md-6 d-flex align-items-center">
                <div className="form-check form-switch mt-4">
                  <input
                    id="open"
                    name="open"
                    type="checkbox"
                    className="form-check-input"
                    checked={form.open}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="open">
                    Center is currently open
                  </label>
                </div>
              </div>
            </div>

            <button className="btn btn-success mt-4 me-2" disabled={saving}>
              {saving
                ? 'Saving...'
                : editId !== null
                  ? 'Save Changes'
                  : '+ Add Center'}
            </button>

            {editId !== null && (
              <button
                type="button"
                className="btn btn-outline-secondary mt-4"
                onClick={resetForm}
              >
                Cancel Edit
              </button>
            )}
          </form>
        </section>

        <section id="centers" className="content-card">
          <div className="section-heading">
            <span>02 / DIRECTORY</span>
            <h2>Recycling Centers</h2>
            <p>Search by ID or filter centers by open status.</p>
          </div>

          <form className="row g-2 mb-3" onSubmit={handleSearchById}>
            <div className="col-sm-8">
              <input
                type="number"
                min="1"
                className="form-control"
                placeholder="Enter center ID"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
              />
            </div>
            <div className="col-sm-4 d-flex gap-2">
              <button className="btn btn-success" type="submit">Find by ID</button>
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={() => {
                  setSearchId('');
                  setFilterOpen('all');
                  clearMessages();
                  loadCenters();
                }}
              >
                All
              </button>
            </div>
          </form>

          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
            <span className="badge text-bg-success fs-6">
              {centers.length} {centers.length === 1 ? 'Center' : 'Centers'}
            </span>

            <div className="d-flex flex-wrap gap-2">
              <select
                className="form-select"
                aria-label="Filter by open status"
                value={filterOpen}
                onChange={(e) => handleStatusFilter(e.target.value)}
              >
                <option value="all">All statuses</option>
                <option value="true">Open only</option>
                <option value="false">Closed only</option>
              </select>

              <button
                className="btn btn-outline-success"
                type="button"
                onClick={loadCenters}
                disabled={loading}
              >
                ↻ Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-success" role="status" />
              <p className="mt-2">Loading centers...</p>
            </div>
          ) : centers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">♻</div>
              <h5>No recycling centers found</h5>
              <p>Try another ID or status filter, or add a center.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Center Name</th>
                    <th>Material</th>
                    <th>Capacity (kg/day)</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {centers.map((center) => (
                    <tr key={center.id}>
                      <td>{center.id}</td>
                      <td className="fw-semibold">{center.centerName}</td>
                      <td>{center.materialType}</td>
                      <td>{center.dailyCapacityKg}</td>
                      <td>
                        <span className={`status-pill ${center.open ? 'is-open' : 'is-closed'}`}>
                          {center.open ? 'Open' : 'Closed'}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex flex-wrap gap-2">
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => handleEdit(center)}
                          >
                            Update
                          </button>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDelete(center.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      <footer className="app-footer">
        <div className="container">
          ♻ EcoCenter · Recycling Center Management
          <p className="mb-0 mt-1">Building a sustainable tomorrow, one center at a time.</p>
        </div>
      </footer>
    </>
  );
}

export default App;
