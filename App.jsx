
import { useState } from 'react';
import './App.css';
import AdminDashboard from './AdminDashboard';
import Login from './Login';

// Reusable message displayed inside the current section (no browser pop-ups).
function InlineNotification({ message, type = 'success', onClose }) {
  if (!message) return null;

  return (
    <div className={`notification notification-${type}`} role="status">
      <span className="notification-icon">
        {type === 'success' ? '✓' : type === 'error' ? '!' : 'i'}
      </span>
      <span className="notification-message">{message}</span>
      <button
        type="button"
        className="notification-close"
        onClick={onClose}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
}

function App() {
  const [applications, setApplications] = useState([
    {
      id: 1,
      company: 'Google',
      role: 'Frontend Developer',
      date: '2026-11-15',
      status: 'Interview'
    },
    {
      id: 2,
      company: 'Microsoft',
      role: 'React Developer',
      date: '2026-11-14',
      status: 'Applied'
    },
    {
      id: 3,
      company: 'Amazon',
      role: 'Web Developer',
      date: '2026-11-13',
      status: 'Shortlisted'
    },
    {
      id: 4,
      company: 'Infosys',
      role: 'Software Developer',
      date: '2026-11-12',
      status: 'Rejected'
    }
  ]);

  const [dashboard, setDashboard] = useState('user');
  const [activePage, setActivePage] = useState('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Application states
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [applicationMessageType, setApplicationMessageType] = useState('success');
  const [deleteApplicationId, setDeleteApplicationId] = useState(null);

  const [newJob, setNewJob] = useState({
    company: '',
    role: '',
    date: '',
    status: 'Applied'
  });

  // Profile states
  const [profile, setProfile] = useState({
    name: 'User',
    email: '',
    phone: '',
    college: '',
    course: 'BCA - Computer Applications'
  });

  const [editProfile, setEditProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [savedProfile, setSavedProfile] = useState(null);

  // Interview states
  const [interviewsList, setInterviewsList] = useState([
    {
      id: 1,
      company: 'Google',
      role: 'Frontend Developer',
      date: '2026-11-25',
      time: '10:00',
      mode: 'Online',
      status: 'Scheduled'
    }
  ]);

  const [showInterviewForm, setShowInterviewForm] = useState(false);
  const [editInterviewId, setEditInterviewId] = useState(null);
  const [interviewSearch, setInterviewSearch] = useState('');
  const [interviewMessage, setInterviewMessage] = useState('');
  const [interviewMessageType, setInterviewMessageType] = useState('success');
  const [deleteInterviewId, setDeleteInterviewId] = useState(null);

  const [newInterview, setNewInterview] = useState({
    company: '',
    role: '',
    date: '',
    time: '',
    mode: 'Online',
    status: 'Scheduled'
  });

  // Application statistics
  const total = applications.length;

  const interviewCount = applications.filter(
    job => job.status === 'Interview'
  ).length;

  const shortlisted = applications.filter(
    job => job.status === 'Shortlisted'
  ).length;

  const rejected = applications.filter(
    job => job.status === 'Rejected'
  ).length;

  const appliedCount = applications.filter(
    job => job.status === 'Applied'
  ).length;

  const selectedCount = applications.filter(
    job => job.status === 'Selected'
  ).length;

  const successRate = total > 0
    ? Math.round((selectedCount / total) * 100)
    : 0;

  const scheduledInterviews = interviewsList.filter(
    item => item.status === 'Scheduled'
  ).length;

  // Search applications
  const filteredJobs = applications.filter(job =>
    `${job.company} ${job.role}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // Add or update application
  function handleAddJob(e) {
    e.preventDefault();

    const wasEditing = editId !== null;

    if (wasEditing) {
      setApplications(prev =>
        prev.map(job =>
          job.id === editId
            ? { ...newJob, id: editId }
            : job
        )
      );
    } else {
      setApplications(prev => [
        ...prev,
        { ...newJob, id: Date.now() }
      ]);
    }

    setNewJob({
      company: '',
      role: '',
      date: '',
      status: 'Applied'
    });

    setEditId(null);
    setShowForm(false);
    setDeleteApplicationId(null);
    setApplicationMessageType('success');
    setApplicationMessage(wasEditing
      ? 'Application updated successfully!'
      : 'Application added successfully!');
  }

  // Edit application
  function handleEdit(job) {
    setNewJob({
      company: job.company,
      role: job.role,
      date: job.date,
      status: job.status
    });

    setEditId(job.id);
    setShowForm(true);
    setApplicationMessage('');
  }

  // Confirm and delete application without a browser pop-up
  function handleDelete(id) {
    setApplications(prev => prev.filter(job => job.id !== id));
    setDeleteApplicationId(null);
    setApplicationMessageType('success');
    setApplicationMessage('Application deleted successfully!');
  }

  // Add or update interview
  function handleSaveInterview(e) {
    e.preventDefault();

    const wasEditing = editInterviewId !== null;

    if (wasEditing) {
      setInterviewsList(prev =>
        prev.map(item =>
          item.id === editInterviewId
            ? { ...newInterview, id: editInterviewId }
            : item
        )
      );
    } else {
      setInterviewsList(prev => [
        ...prev,
        { ...newInterview, id: Date.now() }
      ]);
    }

    setNewInterview({
      company: '',
      role: '',
      date: '',
      time: '',
      mode: 'Online',
      status: 'Scheduled'
    });

    setEditInterviewId(null);
    setShowInterviewForm(false);
    setDeleteInterviewId(null);
    setInterviewMessageType('success');
    setInterviewMessage(wasEditing
      ? 'Interview updated successfully!'
      : 'Interview scheduled successfully!');
  }

  // Edit interview
  function handleEditInterview(item) {
    setNewInterview({
      company: item.company,
      role: item.role,
      date: item.date,
      time: item.time,
      mode: item.mode,
      status: item.status
    });

    setEditInterviewId(item.id);
    setShowInterviewForm(true);
    setInterviewMessage('');
  }

  // Confirm and delete interview without a browser pop-up
  function handleDeleteInterview(id) {
    setInterviewsList(prev => prev.filter(item => item.id !== id));
    setDeleteInterviewId(null);
    setInterviewMessageType('success');
    setInterviewMessage('Interview deleted successfully!');
  }

  // Search interviews
  const filteredInterviews = interviewsList.filter(item =>
    `${item.company} ${item.role}`
      .toLowerCase()
      .includes(interviewSearch.toLowerCase())
  );

  // Login
  if (!isLoggedIn) {
    return (
      <Login
        onLogin={(user) => {
          const updatedProfile = {
            name: user.name || 'User',
            email: user.email || '',
            phone: '',
            college: '',
            course: 'BCA - Computer Applications'
          };

          setProfile(updatedProfile);
          setSavedProfile(updatedProfile);

          setDashboard(user.role === 'admin' ? 'admin' : 'user');
          setActivePage('dashboard');
          setIsLoggedIn(true);
        }}
      />
    );
  }

  // Admin Dashboard
  if (dashboard === 'admin') {
    return (
      <AdminDashboard
        onBack={() => setDashboard('user')}
        onLogout={() => {
          localStorage.removeItem('token');
          setIsLoggedIn(false);
          setDashboard('user');
          setActivePage('dashboard');
        }}
        applications={applications}
        setApplications={setApplications}
      />
    );
  }

  return (
    <div className="app-container">

      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="logo">JobTrack.</h2>

        <p className="menu-title">MENU</p>

        <nav>
          <a
            href="#dashboard"
            className={activePage === 'dashboard' ? 'active' : ''}
            onClick={() => setActivePage('dashboard')}
          >
            Dashboard
          </a>

          <a
            href="#applications"
            className={activePage === 'applications' ? 'active' : ''}
            onClick={() => setActivePage('applications')}
          >
            My Applications
          </a>

          <a
            href="#interviews"
            className={activePage === 'interviews' ? 'active' : ''}
            onClick={() => setActivePage('interviews')}
          >
            Interviews
          </a>

          <a
            href="#analytics"
            className={activePage === 'analytics' ? 'active' : ''}
            onClick={() => setActivePage('analytics')}
          >
            Analytics & Reports
          </a>

          <a
            href="#profile"
            className={activePage === 'profile' ? 'active' : ''}
            onClick={() => setActivePage('profile')}
          >
            My Profile
          </a>
        </nav>

        <button
          type="button"
          className="admin-switch"
          onClick={() => {
            localStorage.removeItem('token');
            setIsLoggedIn(false);
            setDashboard('user');
            setActivePage('dashboard');
            setEditProfile(false);
          }}
        >
          Logout
        </button>

        <div className="sidebar-bottom">
          <p>Job Application Tracker</p>
          <small>Manage your career journey.</small>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">

        {/* Dashboard Page */}
        {activePage === 'dashboard' && (
          <>
            <header className="header">
              <div>
                <p className="welcome">WELCOME BACK</p>
                <h1>Dashboard</h1>
                <p className="subtitle">
                  Track your job search journey in one place.
                </p>
              </div>

              <button
                type="button"
                className="add-button"
                onClick={() => {
                  setEditId(null);
                  setNewJob({
                    company: '',
                    role: '',
                    date: '',
                    status: 'Applied'
                  });
                  setShowForm(!showForm);
                }}
              >
                + Add Application
              </button>
            </header>

            <InlineNotification
              message={applicationMessage}
              type={applicationMessageType}
              onClose={() => setApplicationMessage('')}
            />

            {showForm && (
              <form className="job-form" onSubmit={handleAddJob}>
                <h2>
                  {editId !== null ? 'Edit Application' : 'Add New Application'}
                </h2>

                <input
                  type="text"
                  placeholder="Company name"
                  value={newJob.company}
                  onChange={e => setNewJob({ ...newJob, company: e.target.value })}
                  required
                />

                <input
                  type="text"
                  placeholder="Job role"
                  value={newJob.role}
                  onChange={e => setNewJob({ ...newJob, role: e.target.value })}
                  required
                />

                <input
                  type="date"
                  value={newJob.date}
                  onChange={e => setNewJob({ ...newJob, date: e.target.value })}
                  required
                />

                <select
                  value={newJob.status}
                  onChange={e => setNewJob({ ...newJob, status: e.target.value })}
                >
                  <option>Applied</option>
                  <option>Shortlisted</option>
                  <option>Interview</option>
                  <option>Rejected</option>
                  <option>Selected</option>
                </select>

                <button type="submit" className="add-button">
                  {editId !== null ? 'Update Application' : 'Save Application'}
                </button>
              </form>
            )}

            <section className="stats-grid">
              <div className="stat-card">
                <p>Total Applications</p>
                <h2>{total}</h2>
                <span>All job applications</span>
              </div>

              <div className="stat-card">
                <p>Interviews</p>
                <h2>{interviewCount}</h2>
                <span>Interview opportunities</span>
              </div>

              <div className="stat-card">
                <p>Shortlisted</p>
                <h2>{shortlisted}</h2>
                <span>Moving forward</span>
              </div>

              <div className="stat-card">
                <p>Rejected</p>
                <h2>{rejected}</h2>
                <span>Closed applications</span>
              </div>
            </section>

            <section className="applications-section interview-overview">
              <div className="interview-heading">
                <h2>Interview Overview</h2>
                <p>
                  You have {interviewsList.length} interview(s) recorded.
                </p>
              </div>

              <button
                type="button"
                className="add-button interview-manage-button"
                onClick={() => setActivePage('interviews')}
              >
                Manage Interviews →
              </button>
            </section>
          </>
        )}

        {/* Applications Page */}
        {activePage === 'applications' && (
          <section className="applications-section" id="applications">
            <header className="header">
              <div>
                <p className="welcome">JOB TRACKER</p>
                <h1>My Applications</h1>
                <p className="subtitle">
                  Manage all your job applications.
                </p>
              </div>

              <button
                type="button"
                className="add-button"
                onClick={() => {
                  setEditId(null);
                  setNewJob({
                    company: '',
                    role: '',
                    date: '',
                    status: 'Applied'
                  });
                  setShowForm(!showForm);
                }}
              >
                + Add Application
              </button>
            </header>

            <InlineNotification
              message={applicationMessage}
              type={applicationMessageType}
              onClose={() => setApplicationMessage('')}
            />

            {showForm && (
              <form className="job-form" onSubmit={handleAddJob}>
                <h2>
                  {editId !== null ? 'Edit Application' : 'Add New Application'}
                </h2>

                <input
                  type="text"
                  placeholder="Company name"
                  value={newJob.company}
                  onChange={e => setNewJob({ ...newJob, company: e.target.value })}
                  required
                />

                <input
                  type="text"
                  placeholder="Job role"
                  value={newJob.role}
                  onChange={e => setNewJob({ ...newJob, role: e.target.value })}
                  required
                />

                <input
                  type="date"
                  value={newJob.date}
                  onChange={e => setNewJob({ ...newJob, date: e.target.value })}
                  required
                />

                <select
                  value={newJob.status}
                  onChange={e => setNewJob({ ...newJob, status: e.target.value })}
                >
                  <option>Applied</option>
                  <option>Shortlisted</option>
                  <option>Interview</option>
                  <option>Rejected</option>
                  <option>Selected</option>
                </select>

                <button type="submit" className="add-button">
                  {editId !== null ? 'Update Application' : 'Save Application'}
                </button>
              </form>
            )}

            <input
              className="search-box"
              type="text"
              placeholder="Search company or role..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Job Role</th>
                    <th>Applied Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredJobs.map(job => (
                    <tr key={job.id}>
                      <td>{job.company}</td>
                      <td>{job.role}</td>
                      <td>{job.date}</td>
                      <td>{job.status}</td>
                      <td>
                        <button
                          type="button"
                          className="edit-button"
                          onClick={() => handleEdit(job)}
                        >
                          Edit
                        </button>

                        {deleteApplicationId === job.id ? (
                          <span className="inline-confirm">
                            <span>Delete this application?</span>
                            <button
                              type="button"
                              className="delete-button"
                              onClick={() => handleDelete(job.id)}
                            >
                              Yes, delete
                            </button>
                            <button
                              type="button"
                              className="edit-button"
                              onClick={() => setDeleteApplicationId(null)}
                            >
                              Cancel
                            </button>
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="delete-button"
                            onClick={() => setDeleteApplicationId(job.id)}
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}

                  {filteredJobs.length === 0 && (
                    <tr>
                      <td colSpan="5">No applications found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Interview Management */}
        {activePage === 'interviews' && (
          <section className="applications-section" id="interviews">
            <header className="header">
              <div>
                <p className="welcome">INTERVIEW TRACKER</p>
                <h1>Interview Management</h1>
                <p className="subtitle">
                  Schedule and manage your interviews.
                </p>
              </div>

              <button
                type="button"
                className="add-button"
                onClick={() => {
                  setEditInterviewId(null);
                  setNewInterview({
                    company: '',
                    role: '',
                    date: '',
                    time: '',
                    mode: 'Online',
                    status: 'Scheduled'
                  });
                  setShowInterviewForm(!showInterviewForm);
                }}
              >
                + Schedule Interview
              </button>
            </header>

            <InlineNotification
              message={interviewMessage}
              type={interviewMessageType}
              onClose={() => setInterviewMessage('')}
            />

            {showInterviewForm && (
              <form className="job-form" onSubmit={handleSaveInterview}>
                <h2>
                  {editInterviewId !== null
                    ? 'Edit Interview'
                    : 'Schedule New Interview'}
                </h2>

                <label>Company Name</label>
                <input
                  type="text"
                  placeholder="Enter company name"
                  value={newInterview.company}
                  onChange={e => setNewInterview({ ...newInterview, company: e.target.value })}
                  required
                />

                <label>Job Role</label>
                <input
                  type="text"
                  placeholder="Enter job role"
                  value={newInterview.role}
                  onChange={e => setNewInterview({ ...newInterview, role: e.target.value })}
                  required
                />

                <label>Interview Date</label>
                <input
                  type="date"
                  value={newInterview.date}
                  onChange={e => setNewInterview({ ...newInterview, date: e.target.value })}
                  required
                />

                <label>Interview Time</label>
                <input
                  type="time"
                  value={newInterview.time}
                  onChange={e => setNewInterview({ ...newInterview, time: e.target.value })}
                  required
                />

                <label>Interview Mode</label>
                <select
                  value={newInterview.mode}
                  onChange={e => setNewInterview({ ...newInterview, mode: e.target.value })}
                >
                  <option>Online</option>
                  <option>Offline</option>
                </select>

                <label>Interview Status</label>
                <select
                  value={newInterview.status}
                  onChange={e => setNewInterview({ ...newInterview, status: e.target.value })}
                >
                  <option>Scheduled</option>
                  <option>Completed</option>
                  <option>Cancelled</option>
                </select>

                <button type="submit" className="add-button">
                  {editInterviewId !== null ? 'Update Interview' : 'Save Interview'}
                </button>

                <button
                  type="button"
                  className="delete-button"
                  onClick={() => {
                    setShowInterviewForm(false);
                    setEditInterviewId(null);
                  }}
                >
                  Cancel
                </button>
              </form>
            )}

            <div className="section-header">
              <h2>My Interviews</h2>

              <input
                className="search-box"
                type="text"
                placeholder="Search company or role..."
                value={interviewSearch}
                onChange={e => setInterviewSearch(e.target.value)}
              />
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Job Role</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Mode</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredInterviews.map(item => (
                    <tr key={item.id}>
                      <td>{item.company}</td>
                      <td>{item.role}</td>
                      <td>{item.date}</td>
                      <td>{item.time}</td>
                      <td>{item.mode}</td>
                      <td>{item.status}</td>
                      <td>
                        <button
                          type="button"
                          className="edit-button"
                          onClick={() => handleEditInterview(item)}
                        >
                          Edit
                        </button>

                        {deleteInterviewId === item.id ? (
                          <span className="inline-confirm">
                            <span>Delete this interview?</span>
                            <button
                              type="button"
                              className="delete-button"
                              onClick={() => handleDeleteInterview(item.id)}
                            >
                              Yes, delete
                            </button>
                            <button
                              type="button"
                              className="edit-button"
                              onClick={() => setDeleteInterviewId(null)}
                            >
                              Cancel
                            </button>
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="delete-button"
                            onClick={() => setDeleteInterviewId(item.id)}
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}

                  {filteredInterviews.length === 0 && (
                    <tr>
                      <td colSpan="7">No interviews found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Analytics and Reports */}
        {activePage === 'analytics' && (
          <section className="applications-section">
            <header className="header">
              <div>
                <p className="welcome">PERFORMANCE OVERVIEW</p>
                <h1>Analytics & Reports</h1>
                <p className="subtitle">
                  Understand your job application progress.
                </p>
              </div>
            </header>

            <section className="stats-grid">
              <div className="stat-card">
                <p>Total Applications</p>
                <h2>{total}</h2>
                <span>All applications</span>
              </div>

              <div className="stat-card">
                <p>Scheduled Interviews</p>
                <h2>{scheduledInterviews}</h2>
                <span>Upcoming interviews</span>
              </div>

              <div className="stat-card">
                <p>Selected</p>
                <h2>{selectedCount}</h2>
                <span>Successful applications</span>
              </div>

              <div className="stat-card">
                <p>Success Rate</p>
                <h2>{successRate}%</h2>
                <span>Based on selected applications</span>
              </div>
            </section>

            <div className="applications-section">
              <h2>Application Status Report</h2>
              <p className="subtitle">
                Breakdown of your application statuses.
              </p>

              {[
                { name: 'Applied', count: appliedCount, color: '#3b82f6' },
                { name: 'Interview', count: interviewCount, color: '#8b5cf6' },
                { name: 'Shortlisted', count: shortlisted, color: '#f59e0b' },
                { name: 'Rejected', count: rejected, color: '#ef4444' },
                { name: 'Selected', count: selectedCount, color: '#16a34a' }
              ].map(item => (
                <div key={item.name} style={{ marginBottom: '22px' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px'
                    }}
                  >
                    <strong>{item.name}</strong>
                    <strong>{item.count}</strong>
                  </div>

                  <div
                    style={{
                      width: '100%',
                      height: '12px',
                      background: '#e5e7eb',
                      borderRadius: '10px',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        width: `${total > 0 ? (item.count / total) * 100 : 0}%`,
                        height: '100%',
                        background: item.color,
                        borderRadius: '10px',
                        transition: 'width 0.3s'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="applications-section">
              <h2>Interview Report</h2>

              <p>
                Total Interviews: <strong>{interviewsList.length}</strong>
              </p>

              <p>
                Scheduled: <strong>{scheduledInterviews}</strong>
              </p>

              <p>
                Completed:{' '}
                <strong>
                  {interviewsList.filter(item => item.status === 'Completed').length}
                </strong>
              </p>

              <p>
                Cancelled:{' '}
                <strong>
                  {interviewsList.filter(item => item.status === 'Cancelled').length}
                </strong>
              </p>
            </div>
          </section>
        )}

        {/* User Profile Page */}
        {activePage === 'profile' && (
          <section className="applications-section profile-section">
            <header className="header">
              <div>
                <p className="welcome">ACCOUNT INFORMATION</p>
                <h1>My Profile</h1>
                <p className="subtitle">
                  Manage your personal details.
                </p>
              </div>
            </header>

            <InlineNotification
              message={profileMessage}
              type="success"
              onClose={() => setProfileMessage('')}
            />

            <div className="profile-card">
              <div className="profile-avatar">
                {profile.name?.charAt(0).toUpperCase() || 'U'}
              </div>

              <h2>{profile.name}</h2>
              <p>{profile.email}</p>

              <hr />

              <form
                className="job-form profile-form"
                onSubmit={e => {
                  e.preventDefault();

                  setSavedProfile({ ...profile });
                  setEditProfile(false);
                  setProfileMessage('Profile updated successfully!');
                }}
              >
                <label>Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  disabled={!editProfile}
                  onChange={e =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                  required
                />

                <label>Email Address</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled={!editProfile}
                  onChange={e =>
                    setProfile({ ...profile, email: e.target.value })
                  }
                  required
                />

                <label>Phone Number</label>
                <input
                  type="tel"
                  placeholder="Enter phone number"
                  value={profile.phone}
                  disabled={!editProfile}
                  onChange={e =>
                    setProfile({ ...profile, phone: e.target.value })
                  }
                />

                <label>College Name</label>
                <input
                  type="text"
                  placeholder="Enter college name"
                  value={profile.college}
                  disabled={!editProfile}
                  onChange={e =>
                    setProfile({ ...profile, college: e.target.value })
                  }
                />

                <label>Course / Department</label>
                <input
                  type="text"
                  value={profile.course}
                  disabled={!editProfile}
                  onChange={e =>
                    setProfile({ ...profile, course: e.target.value })
                  }
                />

                {!editProfile ? (
                  <button
                    type="button"
                    className="add-button"
                    onClick={() => setEditProfile(true)}
                  >
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button type="submit" className="add-button">
                      Save Changes
                    </button>

                    <button
                      type="button"
                      className="delete-button"
                      onClick={() => {
                        if (savedProfile) {
                          setProfile({ ...savedProfile });
                        }
                        setEditProfile(false);
                        setProfileMessage('');
                      }}
                    >
                      Cancel
                    </button>
                  </>
                )}
              </form>
            </div>
          </section>
        )}

        <footer>
          © 2026 JobTrack. All rights reserved.
        </footer>

      </main>
    </div>
  );
}

export default App;
