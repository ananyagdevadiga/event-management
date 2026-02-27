import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { FiCalendar, FiMapPin, FiXCircle } from 'react-icons/fi';

const MyRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRegistrations();
  }, [user]);

  const fetchRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*, events(*)')
        .eq('user_id', user.id)
        .order('registered_at', { ascending: false });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (err) {
      console.error('Error fetching registrations:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelRegistration = async (registrationId, eventId) => {
    if (!window.confirm('Are you sure you want to cancel this registration?')) return;

    try {
      const { error } = await supabase
        .from('registrations')
        .delete()
        .eq('id', registrationId);

      if (error) throw error;
      setRegistrations((prev) => prev.filter((r) => r.id !== registrationId));
    } catch (err) {
      console.error('Error cancelling registration:', err.message);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="dashboard-layout">
      <Navbar />
      <main className="dashboard-main">
        <div className="dashboard-header">
          <h1>My Registrations</h1>
          <p>Events you've registered for</p>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading registrations...</p>
          </div>
        ) : registrations.length === 0 ? (
          <div className="empty-state">
            <h3>No registrations yet</h3>
            <p>Browse events and register for ones that interest you!</p>
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
              Browse Events
            </button>
          </div>
        ) : (
          <div className="registrations-list">
            {registrations.map((reg) => {
              const isUpcoming = new Date(reg.events.date) > new Date();
              return (
                <div key={reg.id} className="registration-item" onClick={() => navigate(`/event/${reg.events.id}`)}>
                  <div className="registration-info">
                    <div className="registration-header">
                      <h3>{reg.events.title}</h3>
                      <span className={`event-status ${isUpcoming ? 'upcoming' : 'past'}`}>
                        {isUpcoming ? 'Upcoming' : 'Past'}
                      </span>
                    </div>
                    <div className="registration-meta">
                      <span><FiCalendar /> {formatDate(reg.events.date)}</span>
                      <span><FiMapPin /> {reg.events.location}</span>
                    </div>
                    <p className="registration-date">
                      Registered on {formatDate(reg.registered_at)}
                    </p>
                  </div>
                  {isUpcoming && (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        cancelRegistration(reg.id, reg.events.id);
                      }}
                    >
                      <FiXCircle /> Cancel
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyRegistrations;
