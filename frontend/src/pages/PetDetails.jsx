import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function PetDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/pets/${id}`)
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch pet details');
        return response.json();
      })
      .then(data => setPet(data))
      .catch(err => {
        console.error('Error fetching pet details:', err);
        setError(err);
      });
  }, [id]);

  const handleBackClick = () => {
    navigate('/pets');
  };

  const handleAdoptClick = () => {
    const username = localStorage.getItem('username');
    if (!username) {
      alert('Please log in to adopt a pet.');
      navigate('/');
      return;
    }

    fetch(`http://localhost:5000/api/admin/adoptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pet_id: id, username })
    })
      .then(response => {
        if (!response.ok) throw new Error('Failed to submit adoption request');
        return response.json();
      })
      .then(() => {
        alert('Adoption request submitted successfully!');
        navigate('/pets');
      })
      .catch(err => {
        console.error('Error submitting adoption request:', err);
        setError(err);
      });
  };

  if (error) {
    return (
      <div style={{ textAlign: 'center', paddingTop: '80px' }}>
        <button onClick={handleBackClick} style={{ position: 'absolute', top: 20, left: 20 }}>← Back</button>
        <p style={{ color: 'red' }}>Error: {error.message}</p>
      </div>
    );
  }

  if (!pet) {
    return <p style={{ textAlign: 'center', paddingTop: '80px' }}>Loading pet details…</p>;
  }

  // Construct the static image URL based on pet name (served from public/images)
  const imgSrc = `/images/${pet.name}.jpg`;  // e.g. "/images/Max.jpg"

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '80px', minHeight: '100vh', backgroundColor: '#fefefe' }}>
      <button 
        onClick={handleBackClick} 
        style={{ position: 'absolute', top: '80px', left: '20px', padding: '0.5em 1em', backgroundColor: '#646cff', color: '#fff', border: 'none', cursor: 'pointer' }}
      >
        ← Back to Pets
      </button>
      <h1 style={{ fontSize: '2.5rem' }}>Pet Details</h1>
      <div style={{ width: '80%', maxWidth: '600px', display: 'flex', gap: '2rem', marginTop: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img
            src={imgSrc}                                          /* use the static image path from public/images */
            alt={pet.name}
            style={{ width: '300px', height: '300px', objectFit: 'cover', marginBottom: '1rem' }}
            onError={e => {                                       
              e.currentTarget.onerror = null;                    /* prevent infinite loop if default also missing */
              e.currentTarget.src = '/images/default.jpg';      /* fallback to a default placeholder */
            }}
          />
          <button onClick={handleAdoptClick} style={{ padding: '0.6em 1.2em', fontSize: '1em', backgroundColor: '#28a745', color: '#fff', border: 'none', cursor: 'pointer' }}>
            Adopt this Pet
          </button>
        </div>
        <div style={{ textAlign: 'left', flex: 1 }}>
          <h2 style={{ fontSize: '1.5rem' }}>{pet.name} — {pet.type}</h2>
          <p style={{ fontSize: '1.2rem' }}><strong>Activity Level:</strong> {pet.activity_level || 'Not specified'}</p>
          <p style={{ fontSize: '1.2rem' }}><strong>Budget:</strong> {pet.budget || 'Not specified'}</p>
          <p style={{ fontSize: '1.2rem' }}><strong>Maintenance Level:</strong> {pet.maintenance_level || 'Not specified'}</p>
          <p style={{ fontSize: '1.2rem' }}><strong>Size:</strong> {pet.size || 'Not specified'}</p>
        </div>
      </div>
    </div>
  );
}

export default PetDetails;