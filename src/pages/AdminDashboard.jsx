import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import EventCard from '../components/EventCard';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*, registrations(count)')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const eventsWithCount = data.map((event) => ({
        ...event,
        registration_count: event.registrations?.[0]?.count || 0,
      }));

      setEvents(eventsWithCount);
    } catch (err) {
      console.error('Error fetching events:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event? All registrations will be removed.')) return;

    setDeleteLoading(eventId);
    try {
      // Delete registrations first
      await supabase.from('registrations').delete().eq('event_id', eventId);
      // Delete event
      const { error } = await supabase.from('events').delete().eq('id', eventId);
      if (error) throw error;
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    } catch (err) {
      console.error('Error deleting event:', err.message);
    } finally {
      setDeleteLoading(null);
    }
  };

  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: events.length,
    upcoming: events.filter((e) => new Date(e.date) > new Date()).length,
    totalRegistrations: events.reduce((sum, e) => sum + (e.registration_count || 0), 0),
  };

  return (
    <div className="dashboard-layout">
      <Navbar />
      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Welcome back, {profile?.full_name}</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/admin/create')}>
            <FiPlus /> Create Event
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Events</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.upcoming}</div>
            <div className="stat-label">Upcoming</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.totalRegistrations}</div>
            <div className="stat-label">Total Registrations</div>
          </div>
        </div>

        <div className="section-header">
          <h2>Your Events</h2>
          <div className="search-bar search-bar-sm">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="empty-state">
            <h3>No events yet</h3>
            <p>Start by creating your first event!</p>
            <button className="btn btn-primary" onClick={() => navigate('/admin/create')}>
              <FiPlus /> Create Event
            </button>
          </div>
        ) : (
          <div className="events-grid">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onClick={() => navigate(`/event/${event.id}`)}
                actionButton={
                  <div className="admin-actions">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => navigate(`/admin/edit/${event.id}`)}
                    >
                      <FiEdit2 /> Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => deleteEvent(event.id)}
                      disabled={deleteLoading === event.id}
                    >
                      <FiTrash2 /> {deleteLoading === event.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                }
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
