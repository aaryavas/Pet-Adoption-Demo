import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Pets from './pages/Pets';
import Questionaire from './pages/Questionaire';
import Login from './pages/Login';
import Register from './pages/Register';
import Test from './pages/test';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import PetDetails from './pages/PetDetails';

function App() {
  return (
    <div style={{ 
      backgroundColor: '#fff', 
      minHeight: '100vh',
      width: '100%'
    }}>
      <Router>
        <nav style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem',
          background: '#eee'
        }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/">Home</Link>
            <Link to="/questionaire">Pets for you</Link>
            <Link to="/about">About</Link>
            <Link to="/dashboard">Dashboard</Link>
          </div>
          <div>
            <Link to="/login">Login</Link>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/pets" element={<Pets />} />
          <Route path="/questionaire" element={<Questionaire />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/test" element={<Test />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />        
          <Route path="/admin-dashb" element={<PetDetails />} />
          <Route path="/pets/:id" element={<PetDetails />} />      
        </Routes>
      </Router>
    </div>
  );
}

export default App;
