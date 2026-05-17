import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const ClientHeader = ({ client, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);

  const statusColors = {
    active: 'bg-success/10 text-success',
    prospect: 'bg-warning/10 text-warning',
    inactive: 'bg-muted text-muted-foreground',
    vip: 'bg-primary/10 text-primary'
  };

  return (
    <div className="bg-card rounded-xl shadow-warm p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-start gap-6">
        <div className="flex items-start gap-4 flex-1">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            {client?.avatar ? (
              <img src={client?.avatar} alt={client?.avatarAlt || client?.name} className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <Icon name="User" size={32} color="var(--color-primary)" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-heading font-bold text-foreground">{client?.name}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColors?.[client?.status] || statusColors?.active}`}>
                {client?.status || 'Active'}
              </span>
            </div>
            <p className="text-muted-foreground font-medium mt-1">{client?.company}</p>
            <div className="flex flex-wrap gap-4 mt-3">
              <a href={`mailto:${client?.email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-smooth">
                <Icon name="Mail" size={14} color="currentColor" />
                <span>{client?.email}</span>
              </a>
              <a href={`tel:${client?.phone}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-smooth">
                <Icon name="Phone" size={14} color="currentColor" />
                <span>{client?.phone}</span>
              </a>
              {client?.location && (
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon name="MapPin" size={14} color="currentColor" />
                  <span>{client?.location}</span>
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium transition-smooth hover-lift active-press">
            <Icon name="Phone" size={16} color="currentColor" />
            <span>Call</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium text-foreground transition-smooth hover:bg-muted active-press">
            <Icon name="Mail" size={16} color="currentColor" />
            <span>Email</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium text-foreground transition-smooth hover:bg-muted active-press">
            <Icon name="Calendar" size={16} color="currentColor" />
            <span>Schedule</span>
          </button>
          <button
            onClick={() => onEdit?.()}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium text-foreground transition-smooth hover:bg-muted active-press"
          >
            <Icon name="Edit" size={16} color="currentColor" />
            <span>Edit</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientHeader;
