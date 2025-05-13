import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Pets() {
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/pets')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => setPets(data))
      .catch(err => setError(err));
  }, []);

  const handlePetClick = id => {
    navigate(`/pets/${id}`);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: '80px',
      minHeight: '100vh',
      backgroundColor: '#fefefe',
      textAlign: 'center',
    }}>
      <h1 style={{ fontSize: '2.5rem' }}>Available Pets</h1>

      {error && (
        <p style={{ fontSize: '1.2rem', color: 'red' }}>
          Error: {error.message}
        </p>
      )}

      {pets.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0, width: '80%', maxWidth: '600px' }}>
          {pets.map(pet => (
            <li key={pet.id} style={{ marginBottom: '1rem' }}>
              <button
                onClick={() => handlePetClick(pet.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1rem',
                  width: '100%',
                  backgroundColor: '#646cff',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '1.2rem',
                  gap: '1rem',
                }}
              >
                {/* use static image from public/images folder based on pet name */}
                <img
                  src={`/images/${pet.name}.jpg`}            // image path matched to pet.name.jpg
                  alt={pet.name}
                  style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                  onError={e => {                           // fallback if image not found
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/images/default.jpg';
                  }}
                />
                <div>
                  <strong>{pet.name}</strong> — {pet.type}
                </div>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ fontSize: '1.2rem' }}>
          No pets available for adoption at this time.
        </p>
      )}
    </div>
  );
}

export default Pets;