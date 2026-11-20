
import { useEffect, useState } from 'react';
import './AdminDashboard.css';

function AdminDashboard({ onBack, onLogout, applications = [] }) {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState('');

  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [showEditForm, setShowEditForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');

  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  function showMessage(text, type = 'success') {
    setMessage(text);
    setMessageType(type);
  }

  function clearMessage() {
    setMessage('');
  }

  // FETCH USERS FROM MONGODB
  async function fetchUsers() {
    try {
      setLoadingUsers(true);

      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Please log in again.');
      }

      const response = await fetch(
        'http://localhost:5000/api/admin/users',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to load users.');
      }

      setUsers(
        data.map(user => ({
          ...user,
          id: user._id,
          applications: 0
        }))
      );

    } catch (error) {
      showMessage(error.message, 'error');
    } finally {
      setLoadingUsers(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  // SEARCH USERS
  const filteredUsers = users.filter(user =>
    `${user.name} ${user.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // ADD USER TO MONGODB
  async function addUser(e) {
    e.preventDefault();

    if (!newName.trim() || !newEmail.trim() || !newPassword.trim()) {
      showMessage('Please fill in all fields.', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showMessage('Password must contain at least 6 characters.', 'error');
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem('token');

      const response = await fetch(
        'http://localhost:5000/api/admin/users',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            name: newName.trim(),
            email: newEmail.trim().toLowerCase(),
            password: newPassword
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to add user.');
      }

      const addedUser = {
        ...data.user,
        id: data.user._id,
        applications: 0
      };

      setUsers(previousUsers => [addedUser, ...previousUsers]);

      setNewName('');
      setNewEmail('');
      setNewPassword('');
      setShowAddForm(false);

      showMessage(data.message || 'New user added successfully.');

    } catch (error) {
      showMessage(error.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  // OPEN EDIT FORM
  function handleEdit(user) {
    clearMessage();
    setConfirmDeleteId(null);
    setEditId(user.id);
    setEditName(user.name);
    setEditEmail(user.email);
    setShowEditForm(true);
    setShowAddForm(false);
  }

  // UPDATE USER IN MONGODB
  async function updateUser(e) {
    e.preventDefault();

    if (!editName.trim() || !editEmail.trim()) {
      showMessage('Please enter both name and email.', 'error');
      return;
    }

    const email = editEmail.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showMessage('Please enter a valid email address.', 'error');
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem('token');

      const response = await fetch(
        `http://localhost:5000/api/admin/users/${editId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            name: editName.trim(),
            email
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to update user.');
      }

      const updatedUser = {
        ...data.user,
        id: data.user._id,
        applications: 0
      };

      setUsers(previousUsers =>
        previousUsers.map(user =>
          user.id === editId ? updatedUser : user
        )
      );

      if (selectedUser?.id === editId) {
        setSelectedUser(updatedUser);
      }

      setShowEditForm(false);
      setEditId(null);
      setEditName('');
      setEditEmail('');

      showMessage(data.message || 'User updated successfully.');

    } catch (error) {
      showMessage(error.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  // DELETE USER FROM MONGODB
  async function deleteUser(id) {
    try {
      setSaving(true);

      const token = localStorage.getItem('token');

      const response = await fetch(
        `http://localhost:5000/api/admin/users/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to delete user.');
      }

      setUsers(previousUsers =>
        previousUsers.filter(user => user.id !== id)
      );

      if (selectedUser?.id === id) {
        setSelectedUser(null);
      }

      setConfirmDeleteId(null);
      showMessage(data.message || 'User deleted successfully.');

    } catch (error) {
      showMessage(error.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  // VIEW USER
  function handleView(user) {
    clearMessage();
    setSelectedUser(user);
    setConfirmDeleteId(null);
  }

  const applicationStatuses = [
    'Applied',
    'Interview',
    'Selected',
    'Rejected'
  ];

  return (
    <div className="admin-layout">

      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <h2>JobTrack.</h2>
        <p className="admin-label">ADMIN PANEL</p>

        <nav>
          <a className="admin-active" href="#overview">Overview</a>
          <a href="#users">User Management</a>
          <a href="#all-applications">Applications</a>
          <a href="#analytics">Analytics</a>
        </nav>

        <button
          className="back-button"
          type="button"
          onClick={onBack}
        >
          ← User Dashboard
        </button>
      </aside>

      {/* MAIN DASHBOARD */}
      <main className="admin-main">

        {/* HEADER */}
        <header className="admin-header" id="overview">
          <div>
            <p className="admin-welcome">ADMINISTRATION</p>
            <h1>Admin Dashboard</h1>
            <p>Manage users and monitor job applications.</p>
          </div>

          <div className="admin-header-actions">
            <span className="admin-badge">Administrator</span>

            <button
              type="button"
              className="admin-logout-button"
              onClick={onLogout}
            >
              Logout
            </button>
          </div>
        </header>

        {/* STATISTICS */}
        <section className="admin-stats">
          <div className="admin-card">
            <p>Total Users</p>
            <h2>{users.length}</h2>
          </div>

          <div className="admin-card">
            <p>Total Applications</p>
            <h2>{applications.length}</h2>
          </div>

          <div className="admin-card">
            <p>Active Users</p>
            <h2>{users.length}</h2>
          </div>

          <div className="admin-card">
            <p>Average Applications</p>
            <h2>
              {users.length
                ? (applications.length / users.length).toFixed(1)
                : '0'}
            </h2>
          </div>
        </section>

        {/* USER MANAGEMENT */}
        <section className="users-section" id="users">

          <div className="users-heading">
            <div>
              <h2>User Management</h2>
              <p>Manage registered users stored in MongoDB.</p>
            </div>

            <div className="user-actions">
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />

              <button
                type="button"
                onClick={() => {
                  clearMessage();
                  setShowAddForm(true);
                  setShowEditForm(false);
                  setConfirmDeleteId(null);
                }}
              >
                + Add User
              </button>
            </div>
          </div>

          {/* INLINE NOTIFICATION */}
          {message && (
            <div
              className={`notification notification-${messageType}`}
              role="status"
            >
              <span className="notification-icon">
                {messageType === 'success' ? '✓' : '!'}
              </span>

              <span className="notification-message">
                {message}
              </span>

              <button
                type="button"
                className="notification-close"
                onClick={clearMessage}
                aria-label="Close notification"
              >
                ×
              </button>
            </div>
          )}

          {/* ADD USER FORM */}
          {showAddForm && (
            <form className="add-user-form" onSubmit={addUser}>
              <h3>Add New User</h3>

              <input
                type="text"
                placeholder="Enter user name"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                required
              />

              <input
                type="email"
                placeholder="Enter email address"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                required
              />

              <input
                type="password"
                placeholder="Create password (minimum 6 characters)"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                minLength={6}
                required
              />

              <button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save User'}
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  setShowAddForm(false);
                  setNewName('');
                  setNewEmail('');
                  setNewPassword('');
                  clearMessage();
                }}
              >
                Cancel
              </button>
            </form>
          )}

          {/* EDIT USER FORM */}
          {showEditForm && (
            <form className="edit-user-form" onSubmit={updateUser}>
              <h3>Edit User</h3>

              <input
                type="text"
                placeholder="Enter user name"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                required
              />

              <input
                type="email"
                placeholder="Enter email address"
                value={editEmail}
                onChange={e => setEditEmail(e.target.value)}
                required
              />

              <button type="submit" disabled={saving}>
                {saving ? 'Updating...' : 'Update User'}
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  setShowEditForm(false);
                  setEditId(null);
                  clearMessage();
                }}
              >
                Cancel
              </button>
            </form>
          )}

          {/* DELETE CONFIRMATION */}
          {confirmDeleteId !== null && (
            <div className="view-user-details">
              <h3>Confirm Delete</h3>
              <p>Are you sure you want to permanently delete this user?</p>

              <button
                type="button"
                className="admin-delete"
                disabled={saving}
                onClick={() => deleteUser(confirmDeleteId)}
              >
                {saving ? 'Deleting...' : 'Yes, Delete'}
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() => setConfirmDeleteId(null)}
              >
                Cancel
              </button>
            </div>
          )}

          {/* VIEW USER DETAILS */}
          {selectedUser && (
            <div className="view-user-details">
              <h3>User Details</h3>

              <p><strong>User ID:</strong> {selectedUser.id}</p>
              <p><strong>Name:</strong> {selectedUser.name}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p>
                <strong>Total Applications:</strong>{' '}
                {selectedUser.applications}
              </p>

              <button
                type="button"
                onClick={() => setSelectedUser(null)}
              >
                Close Details
              </button>
            </div>
          )}

          {/* USERS TABLE */}
          <div className="admin-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Applications</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {loadingUsers ? (
                  <tr>
                    <td colSpan="5">Loading registered users...</td>
                  </tr>
                ) : (
                  <>
                    {filteredUsers.map(user => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.applications}</td>
                        <td>
                          <div className="user-action-buttons">
                            <button
                              type="button"
                              className="view-user-button"
                              onClick={() => handleView(user)}
                            >
                              View
                            </button>

                            <button
                              type="button"
                              className="edit-user-button"
                              onClick={() => handleEdit(user)}
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="admin-delete"
                              onClick={() => {
                                clearMessage();
                                setConfirmDeleteId(user.id);
                                setShowAddForm(false);
                                setShowEditForm(false);
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan="5">No users found.</td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* APPLICATIONS MANAGEMENT */}
        <section className="users-section" id="all-applications">
          <div className="users-heading">
            <div>
              <h2>Applications Management</h2>
              <p>View job applications submitted through JobTrack.</p>
            </div>

            <div className="admin-badge">
              Total Applications: {applications.length}
            </div>
          </div>

          <div className="admin-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Company</th>
                  <th>Job Role</th>
                  <th>Applied Date</th>
                  <th>Status</th>
                  <th>Submitted By</th>
                </tr>
              </thead>

              <tbody>
                {applications.length > 0 ? (
                  applications.map((application, index) => (
                    <tr key={application.id || index}>
                      <td>{index + 1}</td>
                      <td>{application.company || 'N/A'}</td>
                      <td>{application.role || 'N/A'}</td>
                      <td>{application.date || 'N/A'}</td>
                      <td>{application.status || 'N/A'}</td>
                      <td>
                        {application.userName ||
                          application.user?.name ||
                          application.userEmail ||
                          application.email ||
                          'Not available'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">No applications available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* ANALYTICS */}
        <section className="users-section" id="analytics">
          <div className="users-heading">
            <div>
              <h2>Analytics & Reports</h2>
              <p>Overview of users and job application activity.</p>
            </div>
          </div>

          <div className="admin-stats">
            <div className="admin-card">
              <p>Total Users</p>
              <h2>{users.length}</h2>
            </div>

            <div className="admin-card">
              <p>Total Applications</p>
              <h2>{applications.length}</h2>
            </div>

            <div className="admin-card">
              <p>Average Applications</p>
              <h2>
                {users.length
                  ? (applications.length / users.length).toFixed(1)
                  : '0'}
              </h2>
            </div>
          </div>

          <div className="admin-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Application Status</th>
                  <th>Number of Applications</th>
                </tr>
              </thead>

              <tbody>
                {applicationStatuses.map(status => (
                  <tr key={status}>
                    <td>{status}</td>
                    <td>
                      {applications.filter(application =>
                        (application.status || '').toLowerCase() ===
                        status.toLowerCase()
                      ).length}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="admin-footer">
          JobTrack Admin Panel © 2026
        </footer>

      </main>
    </div>
  );
}

export default AdminDashboard;
