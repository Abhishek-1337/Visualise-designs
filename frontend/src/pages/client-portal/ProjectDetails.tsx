import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar, { TopBar } from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import { Card, StatusBadge, EmptyState } from '../../components/shared';
import { projectService, messageService, taskService } from '../../services';
import { useSocket } from '../../contexts/SocketContext';
import type { RootState } from '../../store';

const ClientProjectDetails = () => {
  const { id } = useParams<any>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { socket } = useSocket();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      fetchProjectData(id);
      fetchMessages(id);
      socket?.emit('join:project', { projectId: id });
    }
    return () => {
      if (id) socket?.emit('leave:project', { projectId: id });
    };
  }, [id, socket]);

  useEffect(() => {
    if (socket) {
      const handler = (msg: any) => {
        if (msg.projectId === id) {
          setMessages((prev) => [...prev, msg]);
        }
      };
      socket.on('new:project-message', handler);
      return () => { socket.off('new:project-message', handler); };
    }
  }, [socket, id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTab]);

  const fetchProjectData = async (projectId: string) => {
    try {
      setLoading(true);
      const [pRes, tRes] = await Promise.all([
        projectService.getById(projectId),
        taskService.getAll({ projectId })
      ]);
      setProject(pRes.data);
      setTasks(tRes.data.tasks || []);
    } catch (error) {
      console.error('Failed to fetch project data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (projectId: string) => {
    try {
      const res = await messageService.getProjectMessages(projectId);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error('Failed to load project messages:', err);
    }
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !id || !socket) return;
    socket.emit('send:message', { 
      projectId: id, 
      content: messageText.trim() 
    });
    setMessageText('');
  };

  if (loading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <EmptyState icon="Folder" title="Project not found" />
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-background">
      <Sidebar />
      <TopBar />
      <main className="md:ml-[240px] h-screen pt-[60px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center gap-4 mb-4">
            <button 
              onClick={() => navigate('/client-portal/projects')}
              className="p-2 hover:bg-muted rounded-lg transition-smooth"
            >
              <Icon name="ArrowLeft" size={20} />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-foreground">{project.name}</h1>
                <StatusBadge status={project.status} />
              </div>
              <p className="text-sm text-muted-foreground">{project.description}</p>
            </div>
          </div>

          <div className="flex gap-6">
            {['overview', 'tasks', 'chat'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm font-medium pb-2 transition-smooth border-b-2 capitalize ${
                  activeTab === tab 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="max-w-7xl mx-auto px-6 py-6 h-full flex flex-col">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 md:col-span-2">
                  <h3 className="font-semibold mb-4">Progress</h3>
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Overall Completion</span>
                      <span className="font-bold">{project.progress}%</span>
                    </div>
                    <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary" 
                        style={{ width: `${project.progress}%` }} 
                      />
                    </div>
                  </div>
                  
                  <h3 className="font-semibold mb-4">Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Start Date</p>
                      <p className="font-medium">{project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Target End Date</p>
                      <p className="font-medium">{project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Budget</p>
                      <p className="font-medium">${project.budget?.toLocaleString() || 'N/A'}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 h-fit">
                  <h3 className="font-semibold mb-4">Team</h3>
                  <div className="space-y-4">
                    {(project.members || []).map((m: any) => (
                      <div key={m.id} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                          {m.avatar ? <img src={m.avatar} alt={m.name} /> : m.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{m.name}</p>
                          <p className="text-[10px] text-muted-foreground uppercase">{m.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'tasks' && (
              <div className="space-y-4">
                {tasks.length === 0 ? (
                  <EmptyState icon="CheckSquare" title="No tasks found" description="Tasks will appear here once the team starts the delivery flow." />
                ) : (
                  tasks.map((task) => (
                    <Card key={task.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-2 rounded-full ${
                          task.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-amber-500'
                        }`} />
                        <div>
                          <p className="font-medium text-foreground">{task.title}</p>
                          <p className="text-xs text-muted-foreground">{task.description}</p>
                        </div>
                      </div>
                      <StatusBadge status={task.status} />
                    </Card>
                  ))
                )}
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="flex-1 flex flex-col min-h-0 bg-card border border-border rounded-xl">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg, i) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-xl px-4 py-2 ${
                        msg.sender === 'me' 
                          ? 'bg-primary text-white' 
                          : 'bg-muted text-foreground'
                      }`}>
                        {msg.sender !== 'me' && (
                          <p className="text-[10px] font-bold mb-1 opacity-70">{msg.senderName}</p>
                        )}
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-[9px] mt-1 text-right ${msg.sender === 'me' ? 'text-white/70' : 'text-muted-foreground'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <div className="p-4 border-t border-border">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 bg-background border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-smooth"
                    >
                      <Icon name="Send" size={20} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientProjectDetails;
