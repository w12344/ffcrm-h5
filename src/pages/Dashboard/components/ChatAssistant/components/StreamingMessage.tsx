import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../../../types';
import MarkdownRenderer from './MarkdownRenderer';

interface StreamingMessageProps {
  message: ChatMessage;
}

const StreamingMessage: React.FC<StreamingMessageProps> = ({ message }) => {
  const [displayedReasoningContent, setDisplayedReasoningContent] = useState('');
  const [displayedContent, setDisplayedContent] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const targetReasoningContentRef = useRef('');
  const targetContentRef = useRef('');
  const displayReasoningIndexRef = useRef(0);
  const displayIndexRef = useRef(0);
  const animationFrameRef = useRef<number>();
  const lastUpdateTimeRef = useRef(0);
  const contentContainerRef = useRef<HTMLDivElement>(null);
  const cursorSpanRef = useRef<HTMLSpanElement | null>(null);

  // 优化的流式动画效果：使用节流和批量更新
  useEffect(() => {
    if (!message.isStreaming) {
      setDisplayedReasoningContent(message.reasoningContent || '');
      setDisplayedContent(message.content || '');
      setShowCursor(false);
      return;
    }

    // 更新目标内容
    targetReasoningContentRef.current = message.reasoningContent || '';
    targetContentRef.current = message.content || '';

    // 使用节流的 requestAnimationFrame 实现更高效的逐字动画
    const animate = () => {
      const now = Date.now();
      const timeSinceLastUpdate = now - lastUpdateTimeRef.current;
      
      // 优化的更新间隔，降低更新频率以提升性能
      const updateInterval = 40; // ~25fps，更顺滑
      
      if (timeSinceLastUpdate >= updateInterval) {
        let updated = false;
        
        // 只有在非ThinkingBox模式下才处理深度思考内容
        if (!message.thinkingStatus) {
          const targetReasoningLength = targetReasoningContentRef.current.length;
          const currentReasoningLength = displayReasoningIndexRef.current;
          
          if (currentReasoningLength < targetReasoningLength) {
            // 优化：批量添加更多字符，减少状态更新次数
            const remainingChars = targetReasoningLength - currentReasoningLength;
            const charsToAdd = Math.min(
              remainingChars > 200 ? 10 : remainingChars > 50 ? 6 : 3, // 更激进的批量处理
              remainingChars
            );
            const newIndex = currentReasoningLength + charsToAdd;
            
            setDisplayedReasoningContent(targetReasoningContentRef.current.substring(0, newIndex));
            displayReasoningIndexRef.current = newIndex;
            updated = true;
          }
        }
        
        // 再处理正式回答内容
        const targetContentLength = targetContentRef.current.length;
        const currentContentLength = displayIndexRef.current;
        
        if (currentContentLength < targetContentLength) {
          // 优化：批量添加更多字符，减少状态更新次数
          const remainingChars = targetContentLength - currentContentLength;
          const charsToAdd = Math.min(
            remainingChars > 200 ? 12 : remainingChars > 50 ? 6 : 3, // 更激进的批量处理，提升长段流畅度
            remainingChars
          );
          const newIndex = currentContentLength + charsToAdd;
          
          setDisplayedContent(targetContentRef.current.substring(0, newIndex));
          displayIndexRef.current = newIndex;
          updated = true;
        }
        
        if (updated) {
          lastUpdateTimeRef.current = now;
        }
      }
      
      // 继续动画
      const shouldContinueReasoning = !message.thinkingStatus && 
        displayReasoningIndexRef.current < targetReasoningContentRef.current.length;
      const shouldContinueContent = displayIndexRef.current < targetContentRef.current.length;
      
      if (shouldContinueReasoning || shouldContinueContent) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    // 启动动画
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [message.content, message.reasoningContent, message.isStreaming, message.thinkingStatus]);

  // 将光标移动到 Markdown 内容的最后一个文本节点末尾
  useEffect(() => {
    if (!message.isStreaming) return;
    const container = contentContainerRef.current;
    if (!container) return;

    // 创建或获取光标元素
    if (!cursorSpanRef.current) {
      const span = document.createElement('span');
      span.className = 'typing-cursor';
      span.textContent = '|';
      cursorSpanRef.current = span;
    }

    // 先移除已有光标，避免重复
    if (cursorSpanRef.current.parentElement) {
      try {
        cursorSpanRef.current.parentElement.removeChild(cursorSpanRef.current);
      } catch {}
    }

    // 查找最后一个非空白文本节点
    const findLastTextNode = (root: Node): Text | null => {
      const walker = document.createTreeWalker(
        root,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: (node: Node) => {
            const text = node.nodeValue || '';
            return text.trim().length > 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
          }
        } as unknown as NodeFilter,
      );
      let lastText: Text | null = null;
      while (walker.nextNode()) {
        const node = walker.currentNode as Text;
        // 跳过光标自身
        if (node.parentElement && node.parentElement.classList.contains('typing-cursor')) continue;
        lastText = node;
      }
      return lastText;
    };

    const lastTextNode = findLastTextNode(container);
    if (lastTextNode && cursorSpanRef.current) {
      const range = document.createRange();
      range.setStart(lastTextNode, lastTextNode.nodeValue ? lastTextNode.nodeValue.length : 0);
      range.collapse(true);
      range.insertNode(cursorSpanRef.current);
      range.detach();
    } else if (cursorSpanRef.current) {
      // 找不到文本节点时，作为后备方案追加到容器末尾
      container.appendChild(cursorSpanRef.current);
    }

    return () => {
      // 清理游离的光标，避免重复堆积
      if (cursorSpanRef.current && cursorSpanRef.current.parentElement && cursorSpanRef.current.parentElement !== contentContainerRef.current) {
        try {
          cursorSpanRef.current.parentElement.removeChild(cursorSpanRef.current);
        } catch {}
      }
    };
  }, [displayedContent, displayedReasoningContent, message.isStreaming]);

  // 控制光标可见性，实现闪烁效果
  useEffect(() => {
    if (!message.isStreaming) {
      // 结束流式时移除光标
      if (cursorSpanRef.current && cursorSpanRef.current.parentElement) {
        try {
          cursorSpanRef.current.parentElement.removeChild(cursorSpanRef.current);
        } catch {}
      }
      return;
    }

    if (cursorSpanRef.current) {
      // 使用不触发布局的方式隐藏/显示
      cursorSpanRef.current.style.opacity = showCursor ? '1' : '0';
    }
  }, [showCursor, message.isStreaming]);

  // 光标闪烁效果 - 更流畅的闪烁速度
  useEffect(() => {
    if (message.isStreaming) {
      const cursorInterval = setInterval(() => {
        setShowCursor(prev => !prev);
      }, 500); // 半秒闪烁一次，更符合真实打字机效果

      return () => clearInterval(cursorInterval);
    } else {
      setShowCursor(false);
    }
  }, [message.isStreaming]);

  // 重置状态
  useEffect(() => {
    if (!message.isStreaming) {
      // 当流式结束时，重置索引以便下次使用
      displayReasoningIndexRef.current = 0;
      displayIndexRef.current = 0;
      targetReasoningContentRef.current = '';
      targetContentRef.current = '';
    }
  }, [message.isStreaming]);

  // 增强的内容渲染，支持更多格式
  // const renderContent = (text: string) => {
  //   if (!text) return '';
  //   
  //   return text
  //     // 处理粗体
  //     .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  //     // 处理斜体
  //     .replace(/\*(.*?)\*/g, '<em>$1</em>')
  //     // 处理行内代码
  //     .replace(/`(.*?)`/g, '<code>$1</code>')
  //     // 处理换行
  //     .replace(/\n/g, '<br/>')
  //     // 处理问题标题（Q开头的行）
  //     .replace(/^(Q\d+\.?\s*.*?)(<br\/>|$)/gm, '<div class="question-title">$1</div>')
  //     // 处理回答建议标题
  //     .replace(/(回答建议：?)/g, '<div class="answer-suggestion-title">$1</div>')
  //     // 处理家长担心点标题
  //     .replace(/(家长担心点.*?：)/g, '<div class="concern-title">$1</div>')
  //     // 处理优势支撑点标题
  //     .replace(/(优势支撑点.*?：)/g, '<div class="advantage-title">$1</div>');
  // };

  // 格式化显示内容，使用Markdown渲染
  const formatContent = (content: string, isReasoning = false) => {
    if (!content) return null;
    
    const shouldShowCursor = message.isStreaming && showCursor;
    
    return (
      <div ref={contentContainerRef} className={isReasoning ? 'reasoning' : ''}>
        <MarkdownRenderer content={content} />
        {/* 光标元素在effect中被移动到文本末尾；这里保底渲染一份，防止初次为空 */}
        {shouldShowCursor && !cursorSpanRef.current && <span className="typing-cursor">|</span>}
      </div>
    );
  };

  return (
    <div className="streaming-content">
      {/* 如果使用了ThinkingBox（有thinkingStatus），则只显示正式回答内容 */}
      {message.thinkingStatus ? (
        // 使用ThinkingBox时，只显示正式回答内容
        displayedContent && (
          <div className="answer-content">
            {formatContent(displayedContent, false)}
          </div>
        )
      ) : (
        // 传统模式：显示思考内容和回答内容
        <>
          {/* 深度思考内容 - 浅色显示 */}
          {displayedReasoningContent && (
            <div className="reasoning-content">
              {formatContent(displayedReasoningContent, true)}
            </div>
          )}
          {/* 正式回答内容 - 正常颜色显示 */}
          {displayedContent && (
            <div className="answer-content">
              {formatContent(displayedContent, false)}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StreamingMessage;
