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
        The webpage about our adoption of pets was produced by Chenghao Fan, Yichong Wu, Kyle, and Aarya together!
      </p>
    </div>
  );
}

export default About;