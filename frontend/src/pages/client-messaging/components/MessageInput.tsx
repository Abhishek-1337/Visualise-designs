import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

interface MessageInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  onTyping?: (isTyping: boolean) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSend, disabled, onTyping }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px';
    }
  }, [message]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    if (onTyping) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      } else {
        onTyping(true);
      }

      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
        typingTimeoutRef.current = null;
      }, 2000);
    }
  };

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed || disabled) return;
    
    if (onTyping && typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      onTyping(false);
      typingTimeoutRef.current = null;
    }

    onSend(trimmed);
    setMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-border bg-card px-6 py-4">
      <div className="flex items-center gap-3 bg-muted rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/50 transition-all">
        <button
          className="p-1.5 rounded-lg hover:bg-background transition-smooth text-muted-foreground hover:text-foreground flex-shrink-0 mb-0.5"
          title="Attach file"
        >
          <Icon name="Paperclip" size={20} color="currentColor" />
        </button>
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (Shift+Enter for new line)"
          rows={1}
          disabled={disabled}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none resize-none max-h-40 py-0.5"
        />
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            className="p-1.5 rounded-lg hover:bg-background transition-smooth text-muted-foreground hover:text-foreground"
            title="Emoji"
          >
            <Icon name="Smile" size={20} color="currentColor" />
          </button>
          <button
            onClick={handleSend}
            disabled={!message.trim() || disabled}
            className={`p-2 rounded-lg transition-smooth ${
              message.trim() && !disabled
                ? 'bg-primary text-primary-foreground hover:opacity-90'
                : 'bg-muted-foreground/20 text-muted-foreground/50 cursor-not-allowed'
            }`}
            title="Send message"
          >
            <Icon name="Send" size={18} color="currentColor" />
          </button>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground/40 mt-1.5 text-center">
        Press Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
};

export default MessageInput;
