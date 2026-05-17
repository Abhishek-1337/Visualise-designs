import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const FilesTab = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([
    { id: 1, name: 'Project_Contract_2025.pdf', type: 'pdf', size: '2.4 MB', uploadedBy: 'Sarah Mitchell', uploadedAt: new Date('2025-11-01'), category: 'contract' },
    { id: 2, name: 'Mood_Board_References.zip', type: 'zip', size: '45.2 MB', uploadedBy: 'James Rivera', uploadedAt: new Date('2025-11-15'), category: 'asset' },
    { id: 3, name: 'Phase1_Renders_Draft.pdf', type: 'pdf', size: '18.7 MB', uploadedBy: 'Sarah Mitchell', uploadedAt: new Date('2025-12-01'), category: 'deliverable' },
    { id: 4, name: 'Client_Brief_Final.docx', type: 'docx', size: '1.1 MB', uploadedBy: 'Studio Manager', uploadedAt: new Date('2025-10-20'), category: 'brief' }
  ]);

  const fileIcons = { pdf: 'FileText', zip: 'Archive', docx: 'FileText', png: 'Image', jpg: 'Image', mp4: 'Video' };
  const categoryColors = { contract: 'bg-primary/10 text-primary', asset: 'bg-accent/10 text-accent', deliverable: 'bg-success/10 text-success', brief: 'bg-secondary/10 text-secondary' };

  const handleDragOver = (e) => { e?.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => { e?.preventDefault(); setIsDragging(false); };

  const formatDate = (date) => date?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="space-y-6">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-smooth ${
          isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
        }`}
      >
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
          <Icon name="Upload" size={24} color="var(--color-primary)" />
        </div>
        <p className="font-medium text-foreground mb-1">Drop files here or click to upload</p>
        <p className="text-sm text-muted-foreground">Supports PDF, DOCX, ZIP, PNG, JPG up to 100MB</p>
        <button className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium transition-smooth hover-lift active-press">
          Browse Files
        </button>
      </div>
      <div className="bg-card rounded-xl shadow-warm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-heading font-semibold text-foreground">All Files ({files?.length})</h3>
          <div className="flex gap-2">
            {['All', 'Contracts', 'Assets', 'Deliverables']?.map((filter) => (
              <button key={filter} className="px-3 py-1 text-xs rounded-full bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-smooth">
                {filter}
              </button>
            ))}
          </div>
        </div>
        <div className="divide-y divide-border">
          {files?.map((file) => (
            <div key={file?.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-smooth">
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name={fileIcons?.[file?.type] || 'File'} size={20} color="var(--color-muted-foreground)" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground truncate">{file?.name}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-muted-foreground">{file?.size}</span>
                  <span className="text-xs text-muted-foreground">by {file?.uploadedBy}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(file?.uploadedAt)}</span>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${categoryColors?.[file?.category] || 'bg-muted text-muted-foreground'}`}>
                {file?.category}
              </span>
              <div className="flex gap-1">
                <button className="p-2 rounded-lg hover:bg-muted transition-smooth" title="Download">
                  <Icon name="Download" size={16} color="var(--color-muted-foreground)" />
                </button>
                <button className="p-2 rounded-lg hover:bg-muted transition-smooth" title="Delete">
                  <Icon name="Trash2" size={16} color="var(--color-muted-foreground)" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilesTab;
