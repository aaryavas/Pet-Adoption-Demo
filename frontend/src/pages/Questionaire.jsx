import { useState, useEffect } from "react";

function Questionnaire() {
  const [formData, setFormData] = useState({
    username: '',
    type: '',
    size: '',
    energy_level: '',
    maintenance_level: '',
    budget: ''
  });
  
  // Get the logged-in username from localStorage
  useEffect(() => {
    const loggedInUsername = localStorage.getItem('username');
    if (loggedInUsername) {
      setFormData(prevData => ({
        ...prevData,
        username: loggedInUsername
      }));
    }
  }, []);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionResponse, setSubmissionResponse] = useState(null);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  }

  const validateForm = () => {
    let newErrors = {};
    let isValid = true;

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
      isValid = false;
    }

    if (!formData.type) {
      newErrors.type = 'Type is required';
      isValid = false;
    }

    if (!formData.size) {
      newErrors.size = 'Size is required';
      isValid = false;
    }

    if (!formData.maintenance_level) {
      newErrors.energy_level = 'Energy level is required';
      isValid = false;
    }

    if (!formData.maintenance_level) {
      newErrors.maintenance_level = 'Maintenance level is required';
      isValid = false;
    }

    if (!formData.budget) {
      newErrors.budget = 'Budget amount is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    
    if (validateForm()) {
      try {
        // Map the form data to match the backend's expected format
        const backendData = {
          username: formData.username,
          answers: {
            living_space: formData.size, // Using size as living_space
            activity_level: formData.energy_level, // Using energy_level as activity_level
            maintenance_level: formData.maintenance_level, // Using maintenance_level as time_commitment
            budget: formData.budget,
            pet_type: formData.type
          }
        };

        // Console log the data being sent
        console.log('Original form data:', formData);
        console.log('Data being sent to backend:', backendData);
        console.log('JSON string being sent:', JSON.stringify(backendData));

        // Send the data to the backend
        console.log('Sending request to:', '/api/questionnaire');
        
        const response = await fetch('http://localhost:5000/api/questionnaire', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(backendData),
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries([...response.headers]));
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (response.ok) {
          console.log("Form submitted successfully:", data);
          setSubmissionResponse(data);
          setIsSubmitting(false);
          setIsSubmitted(true);
        } else {
          console.error("Error submitting form:", data);
          setErrors({ ...errors, submit: data.error || 'Failed to submit questionnaire' });
          setIsSubmitting(false);
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        console.error("Error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
        setErrors({ ...errors, submit: 'Network error. Please try again.' });
        setIsSubmitting(false);
      }
    } else {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#fefefe', // Same background as other pages
        textAlign: 'center',
        paddingTop: '80px',
      }}>
        <h1 style={{ fontSize: '2.5rem' }}>
          Thank You!
        </h1>
        <p style={{ fontSize: '1.2rem', maxWidth: '600px' }}>
          {submissionResponse?.message || "We've received your information and will help find the perfect pet match for you."}
        </p>
        {submissionResponse?.status && (
          <div style={{ 
            padding: '0.5rem 1rem', 
            backgroundColor: '#f0f8ff', 
            borderRadius: '5px',
            marginTop: '1rem',
            marginBottom: '1rem'
          }}>
            <p style={{ fontSize: '1.2rem' }}>Status: <strong>{submissionResponse.status}</strong></p>
          </div>
        )}
        <div style={{ marginTop: '1rem' }}>
          <h2 style={{ fontSize: '1.5rem' }}>Your Preferences:</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ fontSize: '1.2rem' }}><strong>Name:</strong> {formData.username}</li>
            <li style={{ fontSize: '1.2rem' }}><strong>Pet Type:</strong> {formData.type}</li>
            <li style={{ fontSize: '1.2rem' }}><strong>Size Preference:</strong> {formData.size}</li>
            <li style={{ fontSize: '1.2rem' }}><strong>Energy Level:</strong> {formData.energy_level}</li>
            <li style={{ fontSize: '1.2rem' }}><strong>Maintenance Level:</strong> {formData.maintenance_level}</li>
            <li style={{ fontSize: '1.2rem' }}><strong>Budget:</strong> {formData.budget}</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: '80px',
      minHeight: '100vh',
      backgroundColor: '#fefefe', // Same background as other pages
      textAlign: 'center',
    }}>
      <h1 style={{ fontSize: '2.5rem' }}>
        Help us find the right pet for you!
      </h1>
      <p style={{ fontSize: '1.2rem', maxWidth: '600px' }}>
        Fill out this questionnaire to help us understand your pet preferences and lifestyle.
        We'll use this information to recommend the perfect companion for you.
      </p>
      
      <form onSubmit={handleSubmit} style={{ width: '80%', maxWidth: '500px' }}>
        <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter your name"
            style={{ width: '100%', padding: '0.5em', fontSize: '1em' }}
          />
          {errors.username && <div style={{ color: 'red', fontSize: '0.9rem' }}>{errors.username}</div>}
        </div>
        
        <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
          <label htmlFor="type">Pet Type</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.5em', fontSize: '1em' }}
          >
            <option value="">Select a pet type</option>
            <option value="dog">Dog</option>
            <option value="cat">Cat</option>
          </select>
          {errors.type && <div style={{ color: 'red', fontSize: '0.9rem' }}>{errors.type}</div>}
        </div>
        
        <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
          <label htmlFor="size">Size Preference</label>
          <select
            id="size"
            name="size"
            value={formData.size}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.5em', fontSize: '1em' }}
          >
            <option value="">Select size preference</option>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
            <option value="any">Any size</option>
          </select>
          {errors.size && <div style={{ color: 'red', fontSize: '0.9rem' }}>{errors.size}</div>}
        </div>
        
        <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
          <label htmlFor="energy_level">Energy Level</label>
          <select
            id="energy_level"
            name="energy_level"
            value={formData.energy_level}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.5em', fontSize: '1em' }}
          >
            <option value="">Select energy level</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          {errors.energy_level && <div style={{ color: 'red', fontSize: '0.9rem' }}>{errors.energy_level}</div>}
        </div>
        
        <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
          <label htmlFor="maintenance_level">Maintenance Level</label>
          <select
            id="maintenance_level"
            name="maintenance_level"
            value={formData.maintenance_level}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.5em', fontSize: '1em' }}
          >
            <option value="">Select maintenance level</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          {errors.maintenance_level && <div style={{ color: 'red', fontSize: '0.9rem' }}>{errors.maintenance_level}</div>}
        </div>
        
        <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
          <label htmlFor="budget">Monthly Budget</label>
          <select
            id="budget"
            name="budget"
            value={formData.budget}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.5em', fontSize: '1em' }}
          >
            <option value="">Select budget range</option>
            <option value="low">Low ($0 - $100)</option>
            <option value="medium">Medium ($300 - $500)</option>
            <option value="high">High ($600 - $1200)</option>
          </select>
          {errors.budget && <div style={{ color: 'red', fontSize: '0.9rem' }}>{errors.budget}</div>}
        </div>
        
        {errors.submit && (
          <div style={{ color: 'red', fontSize: '1rem', marginTop: '1rem', textAlign: 'center' }}>
            {errors.submit}
          </div>
        )}
        
        <button 
          type="submit" 
          disabled={isSubmitting}
          style={{
            padding: '0.6em 1.2em',
            fontSize: '1em',
            backgroundColor: '#646cff', // Same button color as other pages
            color: '#fff',
            border: 'none',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            marginTop: '1rem',
          }}
        >
          {isSubmitting ? 'Submitting...' : 'Find My Perfect Pet'}
        </button>
      </form>
    </div>
  );
}

export default Questionnaire;