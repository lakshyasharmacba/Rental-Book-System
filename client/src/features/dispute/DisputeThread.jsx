import { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useAuthContext } from '@/app/providers';
import { useDisputeMessages } from '@/hooks/useDispute';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';

export const DisputeThread = ({ disputeId }) => {
  const { user } = useAuthContext();
  const { data: initialMessages = [], refetch } = useDisputeMessages(disputeId);
  const { socket, isConnected } = useSocket('/disputes');
  
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    if (socket && isConnected) {
      socket.emit('join-dispute', disputeId);
      
      socket.on('new-message', (msg) => {
        setMessages(prev => {
          if (prev.find(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      });
    }

    // Polling fallback
    const interval = setInterval(() => {
      if (!isConnected) refetch();
    }, 5000);

    return () => {
      if (socket) socket.off('new-message');
      clearInterval(interval);
    };
  }, [socket, isConnected, disputeId, refetch]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    setIsSending(true);
    try {
      await api.post(`/disputes/${disputeId}/messages`, { text });
      setText('');
    } catch (err) {
      console.error('Failed to send message', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] border border-border rounded-card bg-surface overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => {
          const isMine = msg.senderId === user?.id;
          const isAdmin = msg.senderRole === 'admin';
          
          return (
            <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
              <div className="text-xs text-text-muted mb-1 px-1">
                {isAdmin ? 'Admin' : (isMine ? 'You' : msg.senderName)}
              </div>
              <div className={`px-4 py-2 rounded-2xl max-w-[80%] ${
                isAdmin ? 'bg-primary/10 border border-primary/20 text-primary-900' :
                isMine ? 'bg-primary text-white' : 'bg-surface-alt border border-border text-text-main'
              }`}>
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      
      <form onSubmit={handleSend} className="p-3 bg-surface-alt border-t border-border flex gap-2">
        <Input 
          className="flex-1"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isSending}
        />
        <Button type="submit" disabled={isSending || !text.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
};
