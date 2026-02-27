import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { FiCalendar, FiMapPin, FiUsers, FiArrowLeft, FiCheck, FiX } from 'react-icons/fi';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationCount, setRegistrationCount] = useState(0);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchEventDetails();
    if (user && !isAdmin) {
      checkRegistration();
    }
  }, [id, user]);

  const fetchEventDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*, registrations(count)')
        .eq('id', id)
        .single();

      if (error) throw error;

      setEvent(data);
      setRegistrationCount(data.registrations?.[0]?.count || 0);
    } catch (err) {
      console.error('Error fetching event:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkRegistration = async () => {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('id')
        .eq('event_id', id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setIsRegistered(!!data);
    } catch (err) {
      console.error('Error checking registration:', err.message);
    }
  };

  const handleRegister = async () => {
    setRegistering(true);
    setMessage({ type: '', text: '' });
    try {
      const { error } = await supabase
        .from('registrations')
        .insert([
          {
            event_id: id,
            user_id: user.id,
          },
        ]);

      if (error) throw error;

      setIsRegistered(true);
      setRegistrationCount((prev) => prev + 1);
      setMessage({ type: 'success', text: 'Successfully registered for the event!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to register' });
    } finally {
      setRegistering(false);
    }
  };

  const handleCancelRegistration = async () => {
    setRegistering(true);
    setMessage({ type: '', text: '' });
    try {
      const { error } = await supabase
        .from('registrations')
        .delete()
        .eq('event_id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setIsRegistered(false);
      setRegistrationCount((prev) => prev - 1);
      setMessage({ type: 'success', text: 'Registration cancelled successfully.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to cancel registration' });
    } finally {
      setRegistering(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Navbar />
        <main className="dashboard-main">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading event details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="dashboard-layout">
        <Navbar />
        <main className="dashboard-main">
          <div className="empty-state">
            <h3>Event not found</h3>
            <button className="btn btn-primary" onClick={() => navigate(-1)}>
              Go Back
            </button>
          </div>
        </main>
      </div>
    );
  }

  const isUpcoming = new Date(event.date) > new Date();
  const spotsLeft = event.max_attendees ? event.max_attendees - registrationCount : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;

  return (
    <div className="dashboard-layout">
      <Navbar />
      <main className="dashboard-main">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <FiArrowLeft /> Back
        </button>

        <div className="event-details">
          {event.image_url && (
            <div className="event-image">
              <img src={event.image_url} alt={event.title} />
            </div>
          )}

          <div className="event-details-content">
            <div className="event-details-header">
              <h1>{event.title}</h1>
              <span className={`event-status ${isUpcoming ? 'upcoming' : 'past'}`}>
                {isUpcoming ? 'Upcoming' : 'Past'}
              </span>
            </div>

            <div className="event-details-meta">
              <div className="detail-meta-item">
                <FiCalendar className="detail-icon" />
                <div>
                  <strong>Date & Time</strong>
                  <span>{formatDate(event.date)}</span>
                </div>
              </div>
              <div className="detail-meta-item">
                <FiMapPin className="detail-icon" />
                <div>
                  <strong>Location</strong>
                  <span>{event.location}</span>
                </div>
              </div>
              <div className="detail-meta-item">
                <FiUsers className="detail-icon" />
                <div>
                  <strong>Attendees</strong>
                  <span>
                    {registrationCount}
                    {event.max_attendees ? ` / ${event.max_attendees}` : ''} registered
                  </span>
                </div>
              </div>
            </div>

            <div className="event-description-full">
              <h3>About this event</h3>
              <p>{event.description}</p>
            </div>

            {message.text && (
              <div className={`alert alert-${message.type}`}>{message.text}</div>
            )}

            {!isAdmin && isUpcoming && (
              <div className="event-actions">
                {isRegistered ? (
                  <div className="registered-section">
                    <div className="registered-badge">
                      <FiCheck /> You're registered for this event
                    </div>
                    <button
                      className="btn btn-danger"
                      onClick={handleCancelRegistration}
                      disabled={registering}
                    >
                      {registering ? 'Cancelling...' : 'Cancel Registration'}
                    </button>
                  </div>
                ) : (
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={handleRegister}
                    disabled={registering || isFull}
                  >
                    {registering ? 'Registering...' : isFull ? 'Event Full' : 'Register for Event'}
                  </button>
                )}
              </div>
            )}

            {!isUpcoming && !isAdmin && (
              <div className="alert alert-info">
                <FiX /> This event has already passed
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default EventDetails;
