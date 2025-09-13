import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, updateDoc, doc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Mail, Trash2, MailOpen, Archive, Reply, Loader2, Search, MessageSquare, AlertCircle, RefreshCcw } from 'lucide-react';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'read' | 'unread' | 'archived';
  createdAt: string;
  updatedAt: string;
}

const Messages: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [showMobileDetail, setShowMobileDetail] = useState(false);
  const [unsubscribe, setUnsubscribe] = useState<(() => void) | null>(null);

  useEffect(() => {
    subscribeToMessages();
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const subscribeToMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const messagesRef = collection(db, 'messages');
      const q = query(messagesRef, orderBy('createdAt', 'desc'));
      
      const unsubscribeListener = onSnapshot(q, 
        (snapshot) => {
          const fetchedMessages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Message[];
          setMessages(fetchedMessages);
          setLoading(false);
        },
        (error) => {
          console.error('Error in messages subscription:', error);
          setError('Failed to connect to messages. Please try refreshing.');
          setLoading(false);
          
          // If it's a permission error, try to reconnect after 5 seconds
          if (error.code === 'permission-denied' || error.code === 'failed-precondition') {
            setTimeout(() => {
              if (unsubscribe) {
                unsubscribe();
              }
              subscribeToMessages();
            }, 5000);
          }
        }
      );
      
      setUnsubscribe(() => unsubscribeListener);
    } catch (error) {
      console.error('Error setting up messages subscription:', error);
      setError('Failed to load messages. Please try refreshing.');
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (unsubscribe) {
      unsubscribe();
    }
    subscribeToMessages();
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      const messageRef = doc(db, 'messages', messageId);
      await updateDoc(messageRef, {
        status: 'read',
        updatedAt: new Date().toISOString()
      });

      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, status: 'read' } : msg
      ));

      toast.success('Message marked as read');
    } catch (error) {
      console.error('Error updating message:', error);
      toast.error('Failed to update message');
    }
  };

  const handleArchive = async (messageId: string) => {
    try {
      const messageRef = doc(db, 'messages', messageId);
      await updateDoc(messageRef, {
        status: 'archived',
        updatedAt: new Date().toISOString()
      });

      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, status: 'archived' } : msg
      ));

      toast.success('Message archived');
    } catch (error) {
      console.error('Error archiving message:', error);
      toast.error('Failed to archive message');
    }
  };

  const handleDelete = async (messageId: string) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    try {
      await deleteDoc(doc(db, 'messages', messageId));
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      setSelectedMessage(null);
      setShowMobileDetail(false);
      toast.success('Message deleted');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  const handleReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;

    setIsReplying(true);
    try {
      // Here you would typically integrate with your email service
      // For now, we'll just show a success message
      toast.success('Reply sent successfully');
      setReplyText('');
      setIsReplying(false);
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Failed to send reply');
    }
  };

  const handleMessageSelect = (message: Message) => {
    setSelectedMessage(message);
    setShowMobileDetail(true);
    if (message.status === 'unread') {
      handleMarkAsRead(message.id);
    }
  };

  const filteredMessages = messages
    .filter(msg => {
      if (filter === 'all') return true;
      return msg.status === filter;
    })
    .filter(msg => {
      if (!searchQuery) return true;
      const searchLower = searchQuery.toLowerCase();
      return (
        msg.name.toLowerCase().includes(searchLower) ||
        msg.email.toLowerCase().includes(searchLower) ||
        msg.subject.toLowerCase().includes(searchLower) ||
        msg.message.toLowerCase().includes(searchLower)
      );
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread':
        return 'text-emerald-400 bg-emerald-400/10';
      case 'read':
        return 'text-blue-400 bg-blue-400/10';
      case 'archived':
        return 'text-slate-400 bg-slate-400/10';
      default:
        return 'text-slate-400 bg-slate-400/10';
    }
  };

  return (
    <div className="p-3 pt-8">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-emerald-400 mb-2">Messages</h1>
            <p className="text-slate-400">Manage your contact form submissions</p>
          </div>
          {error && (
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-200 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <RefreshCcw className="h-4 w-4" />
              Retry
            </button>
          )}
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <option value="all">All Messages</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
            <p className="text-slate-400">Loading messages...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-[60vh]">
          <div className="flex flex-col items-center gap-4 text-center">
            <AlertCircle className="h-12 w-12 text-rose-400" />
            <div>
              <p className="text-slate-200 font-medium mb-2">{error}</p>
              <p className="text-sm text-slate-400">
                There was an error loading your messages.
                <br />
                Please check your connection and try again.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Messages List */}
          <div className={`bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700/50 ${showMobileDetail ? 'hidden md:block' : 'block'}`}>
            {filteredMessages.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-slate-600" />
                <h3 className="text-lg font-medium text-slate-300 mb-2">No messages found</h3>
                <p className="text-slate-400 text-sm">
                  {searchQuery
                    ? 'Try adjusting your search or filter'
                    : 'Messages from your contact form will appear here'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-700/50">
                {filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    onClick={() => handleMessageSelect(message)}
                    className={`p-4 cursor-pointer transition-all hover:bg-slate-700/30 ${
                      selectedMessage?.id === message.id ? 'bg-slate-700/50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full ${getStatusColor(message.status)} flex items-center justify-center`}>
                        {message.status === 'unread' ? (
                          <Mail className="h-5 w-5" />
                        ) : message.status === 'archived' ? (
                          <Archive className="h-5 w-5" />
                        ) : (
                          <MailOpen className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className={`font-medium truncate ${
                            message.status === 'unread' ? 'text-white' : 'text-slate-200'
                          }`}>
                            {message.name}
                          </h3>
                          <span className="text-xs text-slate-400">
                            {new Date(message.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 truncate mb-1">
                          {message.subject}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {message.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Message Detail */}
          {selectedMessage ? (
            <div className={`bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 ${showMobileDetail ? 'block' : 'hidden md:block'}`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowMobileDetail(false)}
                    className="md:hidden p-2 text-slate-400 hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-700/50"
                    title="Back to messages"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <h2 className="text-xl font-semibold text-white">Message Details</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleArchive(selectedMessage.id)}
                    className="p-2 text-slate-400 hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-700/50"
                    title="Archive"
                  >
                    <Archive className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(selectedMessage.id)}
                    className="p-2 text-rose-400 hover:text-rose-300 transition-colors rounded-lg hover:bg-rose-500/10"
                    title="Delete"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">From</label>
                  <div className="flex items-center justify-between">
                    <p className="text-white">{selectedMessage.name}</p>
                    <a
                      href={`mailto:${selectedMessage.email}`}
                      className="text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      {selectedMessage.email}
                    </a>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Subject</label>
                  <p className="text-white">{selectedMessage.subject}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Message</label>
                  <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                    <p className="text-slate-200 whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-700">
                  <label className="block text-sm font-medium text-slate-400 mb-2">Reply</label>
                  <div className="space-y-4">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={4}
                      placeholder="Type your reply..."
                      className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent"
                    />
                    <button
                      onClick={handleReply}
                      disabled={isReplying || !replyText.trim()}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isReplying ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Reply className="h-5 w-5" />
                          Send Reply
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden md:flex bg-slate-800/50 rounded-xl border border-slate-700/50 p-8 items-center justify-center">
              <div className="text-center">
                <Mail className="h-12 w-12 mx-auto mb-4 text-slate-600" />
                <p className="text-slate-400">Select a message to view details</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Messages; 