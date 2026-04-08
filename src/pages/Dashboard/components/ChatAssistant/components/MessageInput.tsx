import React, { useState } from 'react';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  isLoading?: boolean; // 是否正在加载
  onStop?: () => void; // 停止回复的回调
}

const MessageInput: React.FC<MessageInputProps> = ({ 
  onSendMessage, 
  disabled = false, 
  placeholder,
  isLoading = false,
  onStop
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (inputValue.trim() && !disabled) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !disabled) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-input">
      <div className="input-container">
        <div className="input-wrapper">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={disabled ? "AI正在思考中..." : (placeholder || "输入消息...")}
            className="message-input"
            rows={3}
            disabled={disabled}
          />
        </div>
        
        {/* 根据loading状态显示发送按钮或停止按钮 */}
        {isLoading ? (
          <button 
            className="stop-button"
            onClick={onStop}
            title="终止回复"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle
                cx="10"
                cy="10"
                r="8"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <rect
                x="7"
                y="7"
                width="6"
                height="6"
                rx="1"
                fill="currentColor"
              />
            </svg>
          </button>
        ) : (
          <button 
            className="send-button"
            onClick={handleSend}
            disabled={!inputValue.trim() || disabled}
          >
            发送
          </button>
        )}
      </div>
    </div>
  );
};

export default MessageInput;
