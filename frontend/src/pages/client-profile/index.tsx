import React, { useState, useEffect } from 'react';
import Sidebar, { TopBar } from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import ClientHeader from './components/ClientHeader';
import OverviewTab from './components/OverviewTab';
import FilesTab from './components/FilesTab';
import PaymentsTab from './components/PaymentsTab';
import { contactService } from '../../services';

const ClientProfile = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const res = await contactService.getAll({ limit: '50' });
      const list = res.data.contacts || [];
      setContacts(list);
      if (list.length > 0) setSelectedContact(list[0]);
    } catch {
      console.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const client = selectedContact ? {
    id: selectedContact.id,
    name: `${selectedContact.firstName} ${selectedContact.lastName}`,
    company: selectedContact.company || '',
    email: selectedContact.email,
    phone: selectedContact.phone || '',
    location: selectedContact.country || '',
    status: selectedContact.status?.toLowerCase() || 'active',
    industry: selectedContact.jobTitle || '',
    clientSince: new Date(selectedContact.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    totalProjects: String(selectedContact._count?.projects || 0),
    lifetimeValue: selectedContact.value ? `$${(selectedContact.value / 1000).toFixed(0)}K` : '$0',
    assignedTo: selectedContact.owner?.name || 'Unassigned',
    avatar: selectedContact.avatar || '',
    avatarAlt: `${selectedContact.firstName} ${selectedContact.lastName}`,
  } : null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
    { id: 'projects', label: 'Projects', icon: 'FolderOpen' },
    { id: 'communications', label: 'Communications', icon: 'MessageSquare' },
    { id: 'files', label: 'Files', icon: 'Paperclip' },
    { id: 'payments', label: 'Payments', icon: 'CreditCard' },
  ];

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <Sidebar />
      <TopBar />
      <main className="md:ml-[260px] pt-[60px]">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
          <div className="mb-6">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-smooth mb-4"
            >
              <Icon name="ArrowLeft" size={16} />
              Back
            </button>

            {!loading && contacts.length > 0 && (
              <select
                value={selectedContact?.id || ''}
                onChange={(e) => {
                  const c = contacts.find((ct) => ct.id === e.target.value);
                  if (c) setSelectedContact(c);
                }}
                className="w-full max-w-md px-4 py-2.5 bg-card border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 shadow-soft-sm"
              >
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName} - {c.company || c.email}
                  </option>
                ))}
              </select>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-[40vh]">
              <div className="text-center animate-fade-in">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading client data...</p>
              </div>
            </div>
          ) : client ? (
            <>
              <ClientHeader client={client} onEdit={() => {}} />

              <div className="flex gap-1 mb-6 border-b border-border overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-smooth whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon name={tab.icon} size={16} />
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeTab === 'overview' && <OverviewTab client={client} />}
              {activeTab === 'files' && <FilesTab />}
              {activeTab === 'payments' && <PaymentsTab />}
              {(activeTab === 'projects' || activeTab === 'communications') && (
                <div className="text-center py-16 text-muted-foreground animate-fade-in">
                  <Icon name="FolderOpen" size={48} className="mx-auto mb-4 opacity-40" />
                  <p>Select a client to view their projects and communications</p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 text-muted-foreground animate-fade-in">
              <Icon name="UserCircle" size={48} className="mx-auto mb-4 opacity-40" />
              <p>No clients found. Add contacts to get started.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ClientProfile;
