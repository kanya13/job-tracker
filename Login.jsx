
import { useState } from 'react';
import './Login.css';

function Login({ onLogin }) {
  const [portal, setPortal] = useState(null);
  const [isRegister, setIsRegister] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const [isLoading, setIsLoading] = useState(false);

  function showMessage(text, type = 'info') {
    setMessage(text);
    setMessageType(type);
  }

  function selectPortal(selectedPortal) {
    setPortal(selectedPortal);
    setIsRegister(false);
    setMessage('');
    setForm({ name: '', email: '', password: '' });
  }

  function goBack() {
    setPortal(null);
    setIsRegister(false);
    setMessage('');
    setForm({ name: '', email: '', password: '' });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);

    try {
      const endpoint = isRegister
        ? 'http://localhost:5000/api/auth/register'
        : 'http://localhost:5000/api/auth/login';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(
          isRegister
            ? {
                name: form.name,
                email: form.email,
                password: form.password
              }
            : {
                email: form.email,
                password: form.password
              }
        )
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong.');
      }

      if (isRegister) {
        showMessage(
          'Registration successful! Please login with your account.',
          'success'
        );

        setIsRegister(false);
        setForm({
          name: '',
          email: form.email,
          password: ''
        });
        return;
      }

      if (!data.user) {
        throw new Error('User information was not received.');
      }

      const requiredRole = portal === 'admin' ? 'admin' : 'user';

      if (data.user.role !== requiredRole) {
        throw new Error(
          portal === 'admin'
            ? 'Access denied. This account is not an admin account.'
            : 'This is an admin account. Please use the Admin Portal.'
        );
      }

      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      onLogin(data.user);

    } catch (error) {
      showMessage(
        error.message || 'Unable to connect to server.',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  }

  if (!portal) {
    return (
      <div className="login-container">
        <div className="login-card portal-card">
          <h1>JobTrack.</h1>

          <p className="login-subtitle">
            Your career journey starts here.
          </p>

          <h2>Welcome to JobTrack</h2>

          <p className="login-description">
            Choose your portal to continue.
          </p>

          <div className="portal-options">
            <button
              type="button"
              className="portal-button user-portal"
              onClick={() => selectPortal('user')}
            >
              <span className="portal-icon">👤</span>
              <span>User Portal</span>
              <small>Login or create your account</small>
            </button>

            <button
              type="button"
              className="portal-button admin-portal"
              onClick={() => selectPortal('admin')}
            >
              <span className="portal-icon">🛡️</span>
              <span>Admin Portal</span>
              <small>Login as administrator</small>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">

        <button
          type="button"
          className="back-button"
          onClick={goBack}
        >
          ← Back to Portals
        </button>

        <h1>JobTrack.</h1>

        <p className="login-subtitle">
          {portal === 'admin'
            ? 'Administrator Access'
            : 'Your career journey starts here.'}
        </p>

        <h2>
          {isRegister
            ? 'Create User Account'
            : portal === 'admin'
              ? 'Admin Login'
              : 'User Login'}
        </h2>

        <p className="login-description">
          {isRegister
            ? 'Register to manage your job applications.'
            : portal === 'admin'
              ? 'Login to access the Admin Dashboard.'
              : 'Login to access your User Dashboard.'}
        </p>

        {message && (
          <div
            className={`notification notification-${messageType}`}
            role="status"
          >
            <span className="notification-icon">
              {messageType === 'success'
                ? '✓'
                : messageType === 'error'
                  ? '!'
                  : 'i'}
            </span>

            <span className="notification-message">
              {message}
            </span>

            <button
              type="button"
              className="notification-close"
              onClick={() => setMessage('')}
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <input
              type="text"
              placeholder="Full Name"
              value={form.name}
              onChange={e =>
                setForm({ ...form, name: e.target.value })
              }
              required
            />
          )}

          <input
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={e =>
              setForm({ ...form, email: e.target.value })
            }
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={e =>
              setForm({ ...form, password: e.target.value })
            }
            minLength="6"
            required
          />

          <button type="submit" disabled={isLoading}>
            {isLoading
              ? 'Please wait...'
              : isRegister
                ? 'Register'
                : 'Login'}
          </button>
        </form>

        {portal === 'user' && (
          <p className="register-text">
            {isRegister
              ? 'Already have an account?'
              : "Don't have an account?"}

            <span
              onClick={() => {
                setIsRegister(!isRegister);
                setMessage('');
                setForm({
                  name: '',
                  email: form.email,
                  password: ''
                });
              }}
            >
              {isRegister ? ' Login' : ' Register'}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

export default Login;
