import React from 'react';
import { FiMapPin, FiCalendar, FiUsers } from 'react-icons/fi';

const EventCard = ({ event, onClick, actionButton }) => {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isUpcoming = new Date(event.date) > new Date();
  const registrationCount = event.registration_count || 0;
  const spotsLeft = event.max_attendees ? event.max_attendees - registrationCount : null;

  return (
    <div className="event-card" onClick={onClick}>
      <div className="event-card-header">
        <span className={`event-status ${isUpcoming ? 'upcoming' : 'past'}`}>
          {isUpcoming ? 'Upcoming' : 'Past'}
        </span>
        {spotsLeft !== null && isUpcoming && (
          <span className={`spots-badge ${spotsLeft <= 5 ? 'low' : ''}`}>
            {spotsLeft > 0 ? `${spotsLeft} spots left` : 'Full'}
          </span>
        )}
      </div>

      <h3 className="event-card-title">{event.title}</h3>

      <p className="event-card-description">
        {event.description?.length > 120
          ? event.description.substring(0, 120) + '...'
          : event.description}
      </p>

      <div className="event-card-meta">
        <div className="meta-item">
          <FiCalendar />
          <span>{formatDate(event.date)}</span>
        </div>
        <div className="meta-item">
          <FiMapPin />
          <span>{event.location}</span>
        </div>
        <div className="meta-item">
          <FiUsers />
          <span>{registrationCount}{event.max_attendees ? ` / ${event.max_attendees}` : ''} registered</span>
        </div>
      </div>

      {actionButton && (
        <div className="event-card-actions" onClick={(e) => e.stopPropagation()}>
          {actionButton}
        </div>
      )}
    </div>
  );
};

export default EventCard;
