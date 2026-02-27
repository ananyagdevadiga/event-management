import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiCalendar } from 'react-icons/fi';

const Navbar = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => navigate(profile?.role === 'admin' ? '/admin' : '/dashboard')}>
        <FiCalendar className="navbar-icon" />
        <span>EventSphere</span>
      </div>

      <div className="navbar-links">
        {profile?.role === 'admin' ? (
          <>
            <button
              className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
              onClick={() => navigate('/admin')}
            >
              Dashboard
            </button>
            <button
              className={`nav-link ${isActive('/admin/create') ? 'active' : ''}`}
              onClick={() => navigate('/admin/create')}
            >
              Create Event
            </button>
            <button
              className={`nav-link ${isActive('/admin/registrations') ? 'active' : ''}`}
              onClick={() => navigate('/admin/registrations')}
            >
              Registrations
            </button>
          </>
        ) : (
          <>
            <button
              className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
              onClick={() => navigate('/dashboard')}
            >
              Events
            </button>
            <button
              className={`nav-link ${isActive('/my-registrations') ? 'active' : ''}`}
              onClick={() => navigate('/my-registrations')}
            >
              My Registrations
            </button>
          </>
        )}
      </div>

      <div className="navbar-user">
        <span className="user-name">{profile?.full_name}</span>
        <span className={`role-badge ${profile?.role === 'admin' ? 'admin' : 'user'}`}>
          {profile?.role}
        </span>
        <button className="btn-logout" onClick={handleSignOut} title="Sign Out">
          <FiLogOut />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
