import React, { useState, useEffect } from 'react';
import { fetchChatHistory } from '@/services/chat';
import type { ChatHistoryMessage } from '@/services/chat';
import { formatRelativeTime } from '@/utils/dateFormat';
import './ChatHistory.less';

interface ChatHistoryProps {
  visible: boolean;
  onClose: () => void;
  onSelectConversation: (conversationId: string) => void;
}

interface ConversationItem {
  conversationId: string;
  title: string;
  lastMessageTime: string;
  messageCount: number;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ visible, onClose, onSelectConversation }) => {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadChatHistory();
    }
  }, [visible]);

  const loadChatHistory = async () => {
    setLoading(true);
    try {
      const response = await fetchChatHistory();
      
      if (response && response.code === 200 && response.data?.data?.length > 0) {
        const messages = response.data.data;
        
        // 按 conversationId 分组
        const conversationMap = new Map<string, ChatHistoryMessage[]>();
        
        messages.forEach((msg) => {
          const convId = msg.conversationId;
          if (!conversationMap.has(convId)) {
            conversationMap.set(convId, []);
          }
          conversationMap.get(convId)!.push(msg);
        });
        
        // 转换为会话列表
        const conversationList: ConversationItem[] = Array.from(conversationMap.entries()).map(([convId, msgs]) => {
          // 找到第一条用户消息作为标题
          const firstUserMsg = msgs
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
            .find(m => m.role === 'user');
          
          const title = firstUserMsg?.query || '未命名对话';
          
          // 找到最后一条消息的时间
          const lastMsg = msgs.reduce((latest, current) => 
            new Date(current.createdAt).getTime() > new Date(latest.createdAt).getTime() ? current : latest
          );
          
          return {
            conversationId: convId,
            title: title.length > 20 ? title.substring(0, 20) + '...' : title,
            lastMessageTime: formatRelativeTime(lastMsg.createdAt),
            messageCount: msgs.length,
          };
        });
        
        // 按最后消息时间倒序排列
        conversationList.sort((a, b) => {
          const timeA = messages.find(m => m.conversationId === a.conversationId)?.createdAt || '';
          const timeB = messages.find(m => m.conversationId === b.conversationId)?.createdAt || '';
          return new Date(timeB).getTime() - new Date(timeA).getTime();
        });
        
        setConversations(conversationList);
      }
    } catch (error) {
      console.error('加载历史对话失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = (conversationId: string) => {
    onSelectConversation(conversationId);
    onClose();
  };

  if (!visible) {
    return null;
  }

  return (
    <>
      <div className="chat-history-overlay" onClick={onClose} />
      <div className="chat-history-panel">
        <div className="chat-history-header">
          <h3>历史对话</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="chat-history-content">
          {loading ? (
            <div className="loading-state">加载中...</div>
          ) : conversations.length === 0 ? (
            <div className="empty-state">暂无历史对话</div>
          ) : (
            <div className="conversation-list">
              {conversations.map((conv) => (
                <div
                  key={conv.conversationId}
                  className="conversation-item"
                  onClick={() => handleSelectConversation(conv.conversationId)}
                >
                  <div className="conversation-icon">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M2 3.5C2 2.67157 2.67157 2 3.5 2H12.5C13.3284 2 14 2.67157 14 3.5V10.5C14 11.3284 13.3284 12 12.5 12H5.5L2 14V3.5Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        fill="none"
                      />
                    </svg>
                  </div>
                  <div className="conversation-info">
                    <div className="conversation-title">{conv.title}</div>
                    <div className="conversation-meta">
                      <span className="message-count">{conv.messageCount} 条消息</span>
                      <span className="separator">•</span>
                      <span className="last-time">{conv.lastMessageTime}</span>
                    </div>
                  </div>
                  <div className="conversation-arrow">›</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ChatHistory;

