import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [questionnaires, setQuestionnaires] = useState([]);
  const [adoptions, setAdoptions] = useState([]);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState(null);
  const [pets, setPets] = useState([]);  // state to store available pets
  const [petChoices, setPetChoices] = useState({});  // Track admin pet recommendations keyed by questionnaire id
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch questionnaires from admin route
    fetch('http://localhost:5000/api/admin/questionnaires')
      .then(r => {
        if (!r.ok) throw new Error('Failed to fetch questionnaires');
        return r.json();
      })
      .then(data => {
        console.log('Fetched questionnaires:', data);
        setQuestionnaires(data);
      })
      .catch(err => {
        console.error('Error fetching questionnaires:', err);
        setError('Failed to load questionnaires');
      });

    // Fetch adoption requests
    console.log("DEBUG: Fetching adoptions for admin");
    fetch('http://localhost:5000/api/admin/adoptions')
      .then(r => {
        console.log("DEBUG: Adoption response status:", r.status);
        return r.text();
      })
      .then(text => {
        console.log("DEBUG: Raw adoption response text:", text);
        try {
          const data = JSON.parse(text);
          console.log("DEBUG: Parsed adoption data:", data);
          setAdoptions(data);
        } catch (err) {
          console.error("DEBUG: JSON parse error in adoption response:", err);
          setError("Failed to load adoption requests");
        }
      })
      .catch(err => {
        console.error("DEBUG: Error fetching adoptions:", err);
        setError("Failed to load adoption requests");
      });

    // Fetch the pet list for the dropdown
    fetch('http://localhost:5000/api/pets')
      .then(r => {
        if (!r.ok) throw new Error('Failed to fetch pets');
        return r.json();
      })
      .then(data => {
        console.log('Fetched pets:', data);
        setPets(data);
      })
      .catch(err => {
        console.error('Error fetching pets:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Handle approval or rejection of questionnaires/adoptions
  const handleAction = (type, id, action, petChoice) => {
    setLoading(true);

    let payload;
    if (type === 'questionnaires' && action === 'approve') {
      // For approvals, the backend expects a "pet_ids" array.
      // If no pet is selected, you might want to prevent sending an empty array.
      if (!petChoice) {
        console.error("DEBUG: No pet selected for approval.");
        setError("Please select a pet before approving.");
        setLoading(false);
        return;
      }
      payload = { pet_ids: [petChoice] };
    } else {
      // For other cases (questionnaire rejection or adoption actions), send the original payload.
      payload = { petChoice };
    }
    
    console.log(`DEBUG: Sending ${action} for ${type} with id: ${id}`);
    console.log("DEBUG: Payload:", payload);

    fetch(`http://localhost:5000/api/admin/${type}/${id}/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(r => {
        if (!r.ok) {
          console.error(`DEBUG: Response not OK. Status: ${r.status}`);
          throw new Error(`Failed to ${action} ${type}`);
        }
        return r.json();
      })
      .then(data => {
        console.log(`DEBUG: ${action} successful. Response:`, data);
        if (type === 'questionnaires') {
          setQuestionnaires(questionnaires.map(q =>
            q.id === id ? { ...q, status: action.toUpperCase() } : q
          ));
        } else if (type === 'adoptions') {
          setAdoptions(adoptions.map(a =>
            a.request_id === id ? { ...a, status: action.toUpperCase() } : a
          ));
        }
      })
      .catch(err => {
        console.error(`DEBUG: Error during ${action}:`, err);
        setError(`Failed to ${action} the request`);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // View questionnaire details
  const viewQuestionnaireDetails = (questionnaire) => {
    setSelectedQuestionnaire(questionnaire);
  };

  // Format questionnaire labels for display
  const formatLabel = (label) => {
    return label
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading && questionnaires.length === 0 && adoptions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p>Loading dashboard data...</p>
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
      backgroundColor: '#fefefe',
      textAlign: 'center',
    }}>
      <h1 style={{ fontSize: '2.5rem' }}>Admin Dashboard</h1>
      {error && (
        <div style={{ color: 'red', margin: '10px 0' }}>{error}</div>
      )}
      
      <section style={{ width: '80%', maxWidth: '800px', marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem' }}>Questionnaire Reviews</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {questionnaires.length > 0 ? (
            questionnaires.map(q => (
              <li key={q.id} style={{
                fontSize: '1.2rem',
                marginBottom: '1rem',
                padding: '10px',
                border: '1px solid #eee',
                textAlign: 'left'
              }}>
                <div style={{ marginBottom: '10px' }}>
                  <span style={{ fontWeight: 'bold' }}>{q.username}</span>
                  <span style={{ marginLeft: '10px' }}>— Status: {q.status}</span>
                  <button
                    onClick={() => viewQuestionnaireDetails(q)}
                    style={{
                      marginLeft: '10px',
                      padding: '0.2em 0.5em',
                      fontSize: '0.9rem',
                      backgroundColor: '#f0f0f0',
                      border: '1px solid #ccc',
                      cursor: 'pointer'
                    }}
                  >
                    View Details
                  </button>
                </div>
                {selectedQuestionnaire && selectedQuestionnaire.id === q.id && (
                  <div style={{ margin: '10px 0', padding: '10px', backgroundColor: '#f9f9f9' }}>
                    <h3 style={{ fontSize: '1.1rem', margin: '0 0 10px 0' }}>Questionnaire Details:</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <tbody>
                        {Object.entries(q)
                          .filter(([key]) => !['id', 'username', 'status'].includes(key))
                          .map(([key, value]) => (
                            <tr key={key}>
                              <td style={{ padding: '5px', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>
                                {key.charAt(0).toUpperCase() + key.slice(1)}:
                              </td>
                              <td style={{ padding: '5px', borderBottom: '1px solid #eee' }}>{value}</td>
                            </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {q.status === 'PENDING' && (
                  <div style={{ marginTop: '10px' }}>
                    <label style={{ marginRight: '10px' }}>
                      Choose Recommended Pet:
                      <select
                        value={petChoices[q.id] || ''}
                        onChange={(e) =>
                          setPetChoices({ ...petChoices, [q.id]: e.target.value })
                        }
                        style={{
                          padding: '0.4em',
                          marginLeft: '0.5em',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          fontSize: '0.9rem'
                        }}
                      >
                        <option value="">Select a pet</option>
                        {pets.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} - {p.type} - {p.size} - {p.energy_level} - {p.maintenance_level} - ${p.budget}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <button
                        onClick={() => handleAction('questionnaires', q.id, 'approve', petChoices[q.id])}
                        style={{
                          padding: '0.4em 0.8em',
                          fontSize: '0.9rem',
                          backgroundColor: '#4caf50',
                          color: '#fff',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction('questionnaires', q.id, 'reject', petChoices[q.id])}
                        style={{
                          padding: '0.4em 0.8em',
                          fontSize: '0.9rem',
                          backgroundColor: '#f44336',
                          color: '#fff',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))
          ) : (
            <li style={{ fontSize: '1.2rem' }}>No questionnaire reviews yet</li>
          )}
        </ul>
      </section>
      
      <section style={{ width: '80%', maxWidth: '800px', marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem' }}>Adoption Requests</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {adoptions.length > 0 ? (
            adoptions.map(a => (
              <li key={a.request_id} style={{
                fontSize: '1.2rem',
                marginBottom: '1rem',
                padding: '10px',
                border: '1px solid #eee',
                textAlign: 'left'
              }}>
                <div>
                  <span style={{ fontWeight: 'bold' }}>{a.username}</span> wants to adopt <span style={{ fontWeight: 'bold' }}>{a.pet_name}</span>
                  <span style={{ marginLeft: '10px' }}>— Status: {a.status}</span>
                </div>
                {a.status === 'PENDING' && (
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button
                      onClick={() => handleAction('adoptions', a.request_id, 'approve', null)}
                      style={{
                        padding: '0.4em 0.8em',
                        fontSize: '0.9rem',
                        backgroundColor: '#4caf50',
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction('adoptions', a.request_id, 'reject', null)}
                      style={{
                        padding: '0.4em 0.8em',
                        fontSize: '0.9rem',
                        backgroundColor: '#f44336',
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </li>
            ))
          ) : (
            <li style={{ fontSize: '1.2rem' }}>No adoption requests yet</li>
          )}
        </ul>
      </section>
    </div>
  );
}