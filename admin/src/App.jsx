import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAdminStore from './store/adminStore';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Transactions from './pages/Transactions';
import Deposits from './pages/Deposits';
import Withdrawals from './pages/Withdrawals';
import Games from './pages/Games';
import KYC from './pages/KYC';
import Support from './pages/Support';
import Settings from './pages/Settings';
import Policies from './pages/Policies';

// Layout
import Layout from './components/Layout';

function App() {
  const { isAuthenticated } = useAdminStore();

  return (
    <Router>
      <Toaster position="top-right" />
      
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        
        <Route element={<Layout />}>
          <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/users" element={isAuthenticated ? <Users /> : <Navigate to="/login" />} />
          <Route path="/transactions" element={isAuthenticated ? <Transactions /> : <Navigate to="/login" />} />
          <Route path="/deposits" element={isAuthenticated ? <Deposits /> : <Navigate to="/login" />} />
          <Route path="/withdrawals" element={isAuthenticated ? <Withdrawals /> : <Navigate to="/login" />} />
          <Route path="/games" element={isAuthenticated ? <Games /> : <Navigate to="/login" />} />
          <Route path="/kyc" element={isAuthenticated ? <KYC /> : <Navigate to="/login" />} />
          <Route path="/support" element={isAuthenticated ? <Support /> : <Navigate to="/login" />} />
          <Route path="/settings" element={isAuthenticated ? <Settings /> : <Navigate to="/login" />} />
          <Route path="/settings/policies" element={isAuthenticated ? <Policies /> : <Navigate to="/login" />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
