// AdminLogin.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Admin login failed');

      console.log('Admin login successful:', data);
      localStorage.setItem('adminUsername', data.admin.username);
      alert('Admin login successful!');
      setFormData({ username: '', password: '' });
      navigate('/admin-dashboard');
    } catch (err) {
      console.error('Admin login error:', err);
      setErrors({ submit: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToLogin = () => navigate('/');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '80px', minHeight: '100vh', backgroundColor: '#fefefe', textAlign: 'center' }}>
      <div style={{ width: '80%', maxWidth: '400px' }}>
        <h1 style={{ fontSize: '2.5rem' }}>Admin Login</h1>
        <p style={{ fontSize: '1.2rem' }}>Enter your admin credentials to access the dashboard</p>

        {errors.submit && <div style={{ color: 'red', marginBottom: '1rem' }}>{errors.submit}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter admin username"
              disabled={isSubmitting}
              style={{ padding: '0.5em', fontSize: '1em' }}
            />
            {errors.username && <div style={{ color: 'red', fontSize: '0.9rem' }}>{errors.username}</div>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              disabled={isSubmitting}
              style={{ padding: '0.5em', fontSize: '1em' }}
            />
            {errors.password && <div style={{ color: 'red', fontSize: '0.9rem' }}>{errors.password}</div>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{ padding: '0.6em 1.2em', fontSize: '1em', backgroundColor: '#646cff', color: '#fff', border: 'none', cursor: 'pointer', width: '100%' }}
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>

          <button
            type="button"
            onClick={handleBackToLogin}
            disabled={isSubmitting}
            style={{ padding: '0.6em 1.2em', fontSize: '1em', backgroundColor: '#ff0000', color: '#fff', border: 'none', cursor: 'pointer', width: '100%' }}
          >
            Back to User Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
