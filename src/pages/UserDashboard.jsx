import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import EventCard from '../components/EventCard';
import { FiSearch, FiFilter } from 'react-icons/fi';

const UserDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('upcoming');
  const { profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, [filter]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('events')
        .select('*, registrations(count)')
        .order('date', { ascending: true });

      if (filter === 'upcoming') {
        query = query.gte('date', new Date().toISOString());
      } else if (filter === 'past') {
        query = query.lt('date', new Date().toISOString());
      }

      const { data, error } = await query;

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

  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(search.toLowerCase()) ||
    event.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard-layout">
      <Navbar />
      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1>Welcome, {profile?.full_name}!</h1>
            <p>Discover and register for upcoming events</p>
          </div>
        </div>

        <div className="toolbar">
          <div className="search-bar">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search events by title or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <FiFilter />
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
              <option value="all">All Events</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="empty-state">
            <h3>No events found</h3>
            <p>
              {search
                ? 'Try adjusting your search term'
                : 'Check back later for new events'}
            </p>
          </div>
        ) : (
          <div className="events-grid">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onClick={() => navigate(`/event/${event.id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;
