function About() {
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
        About This Project
      </h1>
      <p style={{ fontSize: '1.2rem', maxWidth: '600px' }}>
        This is a demo page made my Aarya Vasantlal to learn and test the functionalites of backend and frontend development. This project involves multiple API Routes including an Admin Approval functionality.
      </p>
    </div>
  );
}

export default About;