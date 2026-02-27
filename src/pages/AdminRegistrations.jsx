import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { FiSearch, FiDownload, FiUsers, FiCalendar } from 'react-icons/fi';

const AdminRegistrations = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchAdminEvents();
  }, []);

  useEffect(() => {
    fetchRegistrations();
  }, [selectedEvent]);

  const fetchAdminEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id, title')
        .eq('created_by', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      console.error('Error fetching events:', err.message);
    }
  };

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      // Fetch registrations with events
      const { data, error } = await supabase
        .from('registrations')
        .select(`
          id,
          user_id,
          event_id,
          registered_at,
          events(id, title, date, created_by)
        `)
        .eq('events.created_by', user.id)
        .order('registered_at', { ascending: false });

      if (error) throw error;

      let filtered = data || [];

      if (selectedEvent !== 'all') {
        filtered = filtered.filter((reg) => reg.event_id === selectedEvent);
      }

      // Fetch profiles for all user_ids
      const userIds = [...new Set(filtered.map((reg) => reg.user_id))];
      let profilesMap = {};

      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds);

        if (profilesError) {
          console.error('Profiles fetch error:', profilesError);
        }

        if (profilesData) {
          console.log('Raw profiles data:', profilesData);
          profilesData.forEach((profile) => {
            // Use email prefix as fallback if full_name is empty
            const displayName = profile.full_name && profile.full_name.trim() 
              ? profile.full_name 
              : (profile.email?.split('@')[0] || 'Unknown');
            
            profilesMap[profile.id] = {
              full_name: displayName,
              email: profile.email,
            };
          });
        }
      }

      // Enrich registrations with profile data
      const enrichedRegistrations = filtered.map((reg) => ({
        ...reg,
        profiles: profilesMap[reg.user_id] || {
          full_name: 'Not Available',
          email: 'Not Available',
        },
      }));

      console.log('Enriched registrations:', enrichedRegistrations);
      setRegistrations(enrichedRegistrations);
    } catch (err) {
      console.error('Error fetching registrations:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredRegistrations = registrations.filter((reg) =>
    reg.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    reg.profiles?.email?.toLowerCase().includes(search.toLowerCase()) ||
    reg.events?.title?.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Event', 'Event Date', 'Registered At'];
    const rows = filteredRegistrations.map((reg) => [
      reg.profiles?.full_name,
      reg.profiles?.email,
      reg.events?.title,
      formatDate(reg.events?.date),
      formatDate(reg.registered_at),
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'registrations.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="dashboard-layout">
      <Navbar />
      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1>Registrations</h1>
            <p>View all registrations for your events</p>
          </div>
          {filteredRegistrations.length > 0 && (
            <button className="btn btn-secondary" onClick={exportCSV}>
              <FiDownload /> Export CSV
            </button>
          )}
        </div>

        <div className="toolbar">
          <div className="search-bar">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <FiCalendar />
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
            >
              <option value="all">All Events</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="registrations-summary">
          <FiUsers />
          <span>{filteredRegistrations.length} registration(s) found</span>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading registrations...</p>
          </div>
        ) : filteredRegistrations.length === 0 ? (
          <div className="empty-state">
            <h3>No registrations found</h3>
            <p>No one has registered for your events yet.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Event</th>
                  <th>Event Date</th>
                  <th>Registered At</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegistrations.map((reg, index) => (
                  <tr key={reg.id}>
                    <td>{index + 1}</td>
                    <td className="td-name">{reg.profiles?.full_name || 'N/A'}</td>
                    <td>{reg.profiles?.email}</td>
                    <td className="td-event">{reg.events?.title}</td>
                    <td>{formatDate(reg.events?.date)}</td>
                    <td>{formatDate(reg.registered_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminRegistrations;
