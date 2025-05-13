import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = localStorage.getItem('username');
  const [questionnaire, setQuestionnaire] = useState(null);
  const [adoptions, setAdoptions] = useState([]);
  const [pendingAdoption, setPendingAdoption] = useState(null);
  const [pendingPet, setPendingPet] = useState(null);

  // Helper function to format questionnaire field labels
  const formatLabel = (label) => {
    return label
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  useEffect(() => {
    // Fetch questionnaire data for the current user.
    fetch(`http://localhost:5000/api/questionnaire/${user}`)
      .then(r => {
        if (!r.ok) {
          throw new Error('Failed to fetch questionnaire');
        }
        return r.json();
      })
      .then(data => {
        console.log('Fetched questionnaire data:', data);
        if (data.answers) {
          console.log('Questionnaire answers:', data.answers);
        } else {
          console.warn('No answers found in the questionnaire data');
        }
        setQuestionnaire(data);
      })
      .catch(error => console.error('Error fetching questionnaire:', error));
  }, [user]);

  useEffect(() => {
    console.log("DEBUG: Fetching adoptions for user", user);
    fetch(`http://localhost:5000/api/adoptions/${user}`)
      .then(r => {
        console.log("DEBUG: Adoption response status:", r.status);
        return r.text();  // first get as text for debugging
      })
      .then(text => {
        console.log("DEBUG: Adoption response text:", text);
        try {
          const data = JSON.parse(text);
          setAdoptions(data);
        } catch (err) {
          console.error("DEBUG: JSON parse error:", err);
        }
      })
      .catch(error => {
        console.error("DEBUG: Error fetching adoptions:", error);
      });
  }, [user]);

  useEffect(() => {
    // Find a pending adoption request.
    const pending = adoptions.find(a => a.status === "PENDING");
    if (pending && pending.pet_id) {
      setPendingAdoption(pending);
      // Fetch full pet details for the pending adoption request.
      fetch(`http://localhost:5000/api/pets/${pending.pet_id}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch pending pet details');
          }
          return response.json();
        })
        .then(petData => {
          console.log('Fetched pending pet details:', petData);
          setPendingPet(petData);
        })
        .catch(err => console.error('Error fetching pending pet details:', err));
    }
  }, [adoptions]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: '80px',
      minHeight: '100%',
      backgroundColor: '#f5f5f5', // Softer off-white for warmth
      textAlign: 'center',
      fontFamily: "'Arial', sans-serif", // Clean, simple font
      
    }}>
      <h1 style={{
        fontSize: '2.3rem', // Slightly smaller for balance
        color: '#333', // Darker for contrast
        marginBottom: '1rem', // More spacing
      }}>
        Your Dashboard
      </h1>
      
      {/* Questionnaire Section */}
      <section style={{
        width: '80%',
        maxWidth: '600px',
        marginTop: '2rem',
        backgroundColor: '#fff', // White card background
        border: '1px solid #ddd', // Subtle border
        borderRadius: '8px', // Rounded corners
        padding: '1.5rem', // Inner spacing
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)', // Increased shadow for stronger effect
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          color: '#2a2a2a', // Darker for emphasis
          marginBottom: '1rem',
          textAlign: 'center', // Center the heading
        }}>
          Questionnaire
        </h2>
        {questionnaire ? (
          <div style={{ fontSize: '1.1rem', textAlign: 'center', color: '#444' }}>
            {questionnaire.answers && (
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                backgroundColor: '#fafafa', // Light gray for contrast
                margin: '0 auto' // Center the table
              }}>
                <tbody>
                  {Object.entries(questionnaire.answers).map(([key, value]) => (
                    <tr key={key}>
                      <td style={{
                        padding: '10px',
                        borderBottom: '1px solid #e0e0e0',
                        fontWeight: '600',
                        color: '#333',
                      }}>
                        {formatLabel(key)}:
                      </td>
                      <td style={{
                        padding: '10px',
                        borderBottom: '1px solid #e0e0e0',
                        color: '#555',
                      }}>
                        {value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <p style={{ marginTop: '15px', color: '#444' }}>
              Status: <strong>{questionnaire.status}</strong>
            </p>
          </div>
        ) : (
          <p style={{
            fontSize: '1.1rem',
            color: '#444',
            margin: '0.5rem 0',
            textAlign: 'center'
          }}>None yet</p>
        )}
      </section>
      
      {/* Your Adoption Requests Section */}
      <section style={{
        width: '80%',
        maxWidth: '600px',
        marginTop: '2rem',
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '1.5rem',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          color: '#2a2a2a',
          marginBottom: '1rem',
        }}>
          Your Adoption Requests
        </h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {adoptions.length > 0 ? (
            adoptions.map(a => (
              <li key={a.request_id} style={{ fontSize: '1.1rem', color: '#444', marginBottom: '0.5rem' }}>
                {a.pet_name} — {a.status}
              </li>
            ))
          ) : (
            <li style={{ fontSize: '1.1rem', color: '#444', margin: '0.5rem 0' }}>No adoption requests yet</li>
          )}
        </ul>
      </section>
      
      {/* Pending Adoption Request Section */}
      <section style={{
        width: '80%',
        maxWidth: '600px',
        marginTop: '2rem',
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '1.5rem',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          color: '#2a2a2a',
          marginBottom: '1rem',
          textAlign: 'center', // Center the heading
        }}>
          Pending Adoption Request
        </h2>
        {pendingAdoption && pendingPet ? (
          <div style={{ fontSize: '1.1rem', textAlign: 'center', color: '#444' }}>
            <p>
              <strong>{pendingPet.name}</strong> - {pendingPet.type}
            </p>
            <p>Status: {pendingAdoption.status}</p>
            <button
              onClick={() => navigate(`/pets/${pendingPet.id}`)}
              style={{
                padding: '0.5em 1em',
                fontSize: '0.9rem',
                backgroundColor: '#4caf50',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
            >
              View Pet Details
            </button>
          </div>
        ) : (
          <p style={{ fontSize: '1.1rem', color: '#444', margin: '0.5rem 0', textAlign: 'center' }}>
            No pending adoption requests.
          </p>
        )}
      </section>

      {/* Recommended Pet Section */}
      <section style={{
        width: '80%',
        maxWidth: '600px',
        marginTop: '2rem',
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '1.5rem',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          color: '#2a2a2a',
          marginBottom: '1rem',
          textAlign: 'center', // Center the heading
        }}>
          Recommended Pet
        </h2>
        {questionnaire && questionnaire.recommendations && questionnaire.recommendations.length > 0 ? (
          <div style={{ fontSize: '1.1rem', textAlign: 'center', color: '#444' }}>
            {(() => {
              const pet = questionnaire.recommendations[0];
              return (
                <>
                  <p>
                    <strong>{pet.name}</strong> - {pet.type} - {pet.size}
                  </p>
                  <button
                    onClick={() => navigate(`/pets/${pet.id}`)}
                    style={{
                      padding: '0.5em 1em',
                      fontSize: '0.9rem',
                      backgroundColor: '#4caf50',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                    }}
                  >
                    View Pet Details & Adopt
                  </button>
                </>
              );
            })()}
          </div>
        ) : (
          <p style={{
            fontSize: '1.1rem',
            color: '#444',
            margin: '0.5rem 0',
            textAlign: 'center'
          }}>
            No recommended pet available yet.
          </p>
        )}
      </section>
    </div>
  );
}