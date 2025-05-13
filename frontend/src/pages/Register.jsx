// Register.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
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
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = { username: formData.username, password: formData.password };
      console.log('sending payload:', JSON.stringify(payload));
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      console.log('⮕ raw response text:', data);
      
      if (!response.ok) throw new Error(data.error || 'Registration failed');

      alert('Account created successfully!');
      setFormData({ username: '', password: '', confirmPassword: '' });
      navigate('/');
    } catch (err) {
      console.error('Registration error:', err);
      setErrors({ submit: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginClick = () => navigate('/login');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '80px', minHeight: '100vh', backgroundColor: '#fefefe', textAlign: 'center' }}>
      <div style={{ width: '80%', maxWidth: '400px' }}>
        <h1 style={{ fontSize: '2.5rem' }}>Create an Account</h1>
        <p style={{ fontSize: '1.2rem' }}>Fill in your details to get started</p>

        {errors.submit && <div style={{ color: 'red', marginBottom: '1rem' }}>{errors.submit}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
            <label htmlFor="username">Username</label>
            <input id="username" name="username" type="text" value={formData.username} onChange={handleChange} placeholder="Choose a username" disabled={isSubmitting} style={{ padding: '0.5em', fontSize: '1em' }} />
            {errors.username && <div style={{ color: 'red', fontSize: '0.9rem' }}>{errors.username}</div>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="••••••••" disabled={isSubmitting} style={{ padding: '0.5em', fontSize: '1em' }} />
            {errors.password && <div style={{ color: 'red', fontSize: '0.9rem' }}>{errors.password}</div>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" disabled={isSubmitting} style={{ padding: '0.5em', fontSize: '1em' }} />
            {errors.confirmPassword && <div style={{ color: 'red', fontSize: '0.9rem' }}>{errors.confirmPassword}</div>}
          </div>

          <button type="submit" disabled={isSubmitting} style={{ padding: '0.6em 1.2em', fontSize: '1em', backgroundColor: '#646cff', color: '#fff', border: 'none', cursor: 'pointer', marginTop: '1rem', width: '100%' }}>
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <p style={{ fontSize: '1rem' }}>Already have an account?</p>
          <button onClick={handleLoginClick} style={{ padding: '0.6em 1.2em', fontSize: '1em', backgroundColor: '#646cff', color: '#fff', border: 'none', cursor: 'pointer', width: '100%' }}>
            Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default Register;
