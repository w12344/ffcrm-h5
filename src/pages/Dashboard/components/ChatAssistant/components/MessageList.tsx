import {
  useEffect,
  useRef,
  useCallback,
  useState,
  forwardRef,
  useImperativeHandle,
  useMemo,
} from "react";
import { ChatMessage } from "../../../types";
import { BotConfig } from "@/services/chat";
import MessageItem from "./MessageItem";

interface MessageListProps {
  messages: ChatMessage[];
  onFollowUpClick?: (question: string) => void;
  onScrollButtonVisibilityChange?: (visible: boolean) => void;
  botConfig?: BotConfig | null; // Bot配置信息
  viewedEmployeeName?: string; // 从URL中获取的顾问姓名
}

export interface MessageListRef {
  scrollToBottom: () => void;
  forceScrollToBottom: () => void;
  hasStreamingMessage: () => boolean;
}

const MessageList = forwardRef<MessageListRef, MessageListProps>(
  (
    { messages, onFollowUpClick, onScrollButtonVisibilityChange, botConfig, viewedEmployeeName },
    ref
  ) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
    const isUserScrollingRef = useRef(false); // 标记用户是否主动向上滚动过
    const isScrollingRef = useRef(false); // 标记是否正在执行自动滚动

    // 滚动消息气泡内部到底部
    const scrollMessageContentToBottom = useCallback(
      (onlyLastMessage = false) => {
        if (!messagesContainerRef.current) return;

        const messageContents =
          messagesContainerRef.current.querySelectorAll(".message-content");
        if (!messageContents.length) return;

        const contents = Array.from(messageContents);
        const targetContents = onlyLastMessage ? contents.slice(-1) : contents;

        // 使用requestAnimationFrame批量处理DOM操作
        requestAnimationFrame(() => {
          targetContents.forEach((content) => {
            const element = content as HTMLElement;
            if (element.scrollHeight <= element.clientHeight) return;

            const isAtBottom =
              element.scrollTop >=
              element.scrollHeight - element.clientHeight - 10;
            const isLastContent = content === contents[contents.length - 1];

            if (isLastContent || isAtBottom) {
              element.scrollTop = element.scrollHeight;
            }
          });
        });
      },
      []
    );

    // 自动滚动到底部
    const scrollToBottom = useCallback(
      (smooth = true) => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({
            behavior: smooth ? "smooth" : "auto",
            block: "end",
          });

          // 根据滚动类型决定延时
          const delay = smooth ? 300 : 50; // 平滑滚动需要更长延时
          setTimeout(() => {
            scrollMessageContentToBottom();
          }, delay);
        }
      },
      [scrollMessageContentToBottom]
    );

    // 强制滚动到底部（用于流式更新和接着问按钮渲染后）
    const forceScrollToBottom = useCallback(() => {
      if (!messagesContainerRef.current) return;

      const container = messagesContainerRef.current;
      // 使用三重 requestAnimationFrame 确保 Markdown 内容完全渲染后再滚动
      // 这对于复杂的 Markdown 内容特别重要
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            container.scrollTop = container.scrollHeight;
            console.log(
              "📜 强制滚动到底部，scrollHeight:",
              container.scrollHeight
            );
          });
        });
      });
    }, []);

    // 检查是否在底部
    const isAtBottom = useCallback(() => {
      if (!messagesContainerRef.current) return true;

      const container = messagesContainerRef.current;
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;

      // 如果用户滚动到距离底部100px以内，则认为在底部
      return scrollHeight - scrollTop - clientHeight < 100;
    }, []);

    // 检查是否需要滚动（用户是否在底部附近）
    const shouldAutoScroll = useCallback(() => {
      return autoScrollEnabled && isAtBottom();
    }, [autoScrollEnabled, isAtBottom]);

    // 检查是否有消息正在流式输出
    const hasStreamingMessage = useCallback(() => {
      return messages.some((msg) => msg.isBot && msg.isStreaming);
    }, [messages]);

    // 暴露方法给父组件
    useImperativeHandle(ref, () => ({
      scrollToBottom: () => {
        // 用户主动点击"回到底部"按钮，重置状态并启用自动滚动
        isUserScrollingRef.current = false;
        setAutoScrollEnabled(true);
        scrollToBottom(true);
      },
      forceScrollToBottom: () => {
        // 强制滚动到底部，用于发送消息后立即滚动
        isUserScrollingRef.current = false;
        setAutoScrollEnabled(true);
        forceScrollToBottom();
      },
      hasStreamingMessage,
    }));

    // 处理滚动事件，检测用户是否手动滚动
    const handleScroll = useCallback(() => {
      const atBottom = isAtBottom();

      // 如果正在自动滚动，不处理用户滚动逻辑
      if (isScrollingRef.current) return;

      // 通知父组件更新滚动按钮显示状态
      onScrollButtonVisibilityChange?.(!atBottom);
    }, [isAtBottom, onScrollButtonVisibilityChange]);

    // 监听滚动事件（使用节流优化性能）
    useEffect(() => {
      const container = messagesContainerRef.current;
      if (!container) return;

      let ticking = false;
      let lastScrollTop = container.scrollTop;

      const throttledHandleScroll = () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            // 如果正在自动滚动，跳过用户滚动检测
            if (isScrollingRef.current) {
              ticking = false;
              return;
            }

            const currentScrollTop = container.scrollTop;
            const atBottom = isAtBottom();

            // 检测用户是否主动向上滚动（而不是自动滚动到底部）
            if (currentScrollTop < lastScrollTop) {
              // 用户向上滚动，立即禁用自动滚动
              isUserScrollingRef.current = true;
              setAutoScrollEnabled(false);
            }
            // 用户滚动到底部，重新启用自动滚动
            else if (atBottom && isUserScrollingRef.current) {
              // 只有当用户曾经向上滚动过，然后又手动滚回底部时，才重新启用自动滚动
              setAutoScrollEnabled(true);
              isUserScrollingRef.current = false;
            }

            lastScrollTop = currentScrollTop;
            handleScroll();
            ticking = false;
          });
          ticking = true;
        }
      };

      container.addEventListener("scroll", throttledHandleScroll, {
        passive: true,
      });
      return () => {
        container.removeEventListener("scroll", throttledHandleScroll);
      };
    }, [handleScroll, isAtBottom]);

    // 优化的滚动控制逻辑 - 使用useMemo缓存计算结果
    const scrollTriggers = useMemo(() => {
      const lastMessage = messages[messages.length - 1];
      if (!lastMessage) return null;

      return {
        messageCount: messages.length,
        lastMessageId: lastMessage.id,
        isStreaming: lastMessage.isStreaming,
        isComplete: lastMessage.isComplete,
        hasFollowUp: (lastMessage.followUpQuestions?.length || 0) > 0,
        contentLength: lastMessage.content?.length || 0,
        reasoningContentLength: lastMessage.reasoningContent?.length || 0,
      };
    }, [messages]);

    useEffect(() => {
      if (!autoScrollEnabled || isScrollingRef.current || !scrollTriggers)
        return;

      const lastMessage = messages[messages.length - 1];
      if (!lastMessage) return;

      // 防抖处理，避免多次快速触发
      const timeoutId = setTimeout(() => {
        if (!shouldAutoScroll() || isScrollingRef.current) return;

        // 标记开始滚动
        isScrollingRef.current = true;

        // 情况1: AI正在流式输出
        if (lastMessage.isBot && lastMessage.isStreaming) {
          // 增加延迟，确保 Markdown 内容渲染完成后再滚动
          setTimeout(() => {
            forceScrollToBottom();
            scrollMessageContentToBottom(true);
            setTimeout(() => {
              isScrollingRef.current = false;
            }, 50);
          }, 50); // 延迟 50ms，等待 Markdown 渲染
        }
        // 情况2: AI消息流式结束或有追问问题
        else if (
          lastMessage.isBot &&
          ((!lastMessage.isStreaming && lastMessage.isComplete) ||
            (lastMessage.followUpQuestions &&
              lastMessage.followUpQuestions.length > 0))
        ) {
          scrollToBottom(true);
          setTimeout(() => {
            scrollMessageContentToBottom();
            isScrollingRef.current = false;
          }, 350); // 平滑滚动需要更长时间
        }
        // 情况3: 普通新消息
        else {
          scrollToBottom(false);
          setTimeout(() => {
            scrollMessageContentToBottom();
            isScrollingRef.current = false;
          }, 100);
        }
      }, 16); // 使用16ms防抖，约等于一帧的时间

      return () => {
        clearTimeout(timeoutId);
        isScrollingRef.current = false;
      };
    }, [
      scrollTriggers, // 使用优化后的触发器
      autoScrollEnabled,
      shouldAutoScroll,
      scrollToBottom,
      forceScrollToBottom,
      scrollMessageContentToBottom,
    ]);

    // 专门处理流式消息的连续滚动
    useEffect(() => {
      const lastMessage = messages[messages.length - 1];
      if (!lastMessage || !lastMessage.isBot || !lastMessage.isStreaming)
        return;
      if (!autoScrollEnabled) return;

      // 为流式消息设置更频繁的滚动检查
      const streamingScrollInterval = setInterval(() => {
        if (!shouldAutoScroll() || isScrollingRef.current) return;

        // 检查是否需要滚动（内容可能已经增长）
        if (messagesContainerRef.current) {
          const container = messagesContainerRef.current;
          const isNearBottom =
            container.scrollHeight -
              container.scrollTop -
              container.clientHeight <
            200;

          if (isNearBottom) {
            // 使用更轻量的滚动方式
            container.scrollTop = container.scrollHeight;
            scrollMessageContentToBottom(true);
          }
        }
      }, 100); // 每100ms检查一次

      return () => {
        clearInterval(streamingScrollInterval);
      };
    }, [
      messages,
      autoScrollEnabled,
      shouldAutoScroll,
      scrollMessageContentToBottom,
    ]);

    // 使用MutationObserver监听DOM变化，确保流式内容更新时能及时滚动
    useEffect(() => {
      const lastMessage = messages[messages.length - 1];
      if (!lastMessage || !lastMessage.isBot || !lastMessage.isStreaming)
        return;
      if (!messagesContainerRef.current || !autoScrollEnabled) return;

      const container = messagesContainerRef.current;
      const observer = new MutationObserver((mutations) => {
        // 检查是否有文本内容变化
        const hasTextChanges = mutations.some(
          (mutation) =>
            mutation.type === "childList" ||
            mutation.type === "characterData" ||
            (mutation.type === "attributes" &&
              mutation.attributeName === "class")
        );

        if (hasTextChanges && shouldAutoScroll() && !isScrollingRef.current) {
          // 使用requestAnimationFrame确保DOM更新完成后再滚动
          requestAnimationFrame(() => {
            if (shouldAutoScroll() && !isScrollingRef.current) {
              container.scrollTop = container.scrollHeight;
              scrollMessageContentToBottom(true);
            }
          });
        }
      });

      // 观察最后一个消息的内容变化，包括ThinkingBox
      const lastMessageElement = container.querySelector(
        ".message-item:last-child"
      );
      if (lastMessageElement) {
        observer.observe(lastMessageElement, {
          childList: true,
          subtree: true,
          characterData: true,
          attributes: true,
          attributeFilter: ["class"],
        });
      }

      return () => {
        observer.disconnect();
      };
    }, [
      messages,
      autoScrollEnabled,
      shouldAutoScroll,
      scrollMessageContentToBottom,
    ]);

    // 专门监听ThinkingBox内容变化的滚动处理
    useEffect(() => {
      const lastMessage = messages[messages.length - 1];
      if (!lastMessage || !lastMessage.isBot || !lastMessage.thinkingStatus)
        return;
      if (!messagesContainerRef.current || !autoScrollEnabled) return;

      const container = messagesContainerRef.current;

      // 监听ThinkingBox内容变化
      const thinkingObserver = new MutationObserver((mutations) => {
        const hasThinkingContentChange = mutations.some((mutation) => {
          // 检查是否是ThinkingBox相关的变化
          const target = mutation.target as Element;
          return target.closest(".thinking-box") !== null;
        });

        if (
          hasThinkingContentChange &&
          shouldAutoScroll() &&
          !isScrollingRef.current
        ) {
          // 延迟滚动，确保ThinkingBox内部滚动完成后再滚动外层容器
          setTimeout(() => {
            if (shouldAutoScroll() && !isScrollingRef.current) {
              container.scrollTop = container.scrollHeight;
              scrollMessageContentToBottom(true);
            }
          }, 50);
        }
      });

      // 观察ThinkingBox区域
      const thinkingBoxElement = container.querySelector(
        ".message-item:last-child .thinking-box"
      );
      if (thinkingBoxElement) {
        thinkingObserver.observe(thinkingBoxElement, {
          childList: true,
          subtree: true,
          characterData: true,
        });
      }

      return () => {
        thinkingObserver.disconnect();
      };
    }, [
      messages,
      autoScrollEnabled,
      shouldAutoScroll,
      scrollMessageContentToBottom,
    ]);

    // 默认引导问题（当Bot配置未加载时使用）
    const defaultSuggestedQuestions = [
      "专业知识巩固",
      "高频问题答复",
      "非凡优势普及",
      "成交案例分析",
    ];

    // 使用Bot配置的建议问题或默认问题
    const suggestedQuestions =
      botConfig?.onboardingInfo?.suggestedQuestions ||
      defaultSuggestedQuestions;

    return (
      <div ref={messagesContainerRef} className="chat-messages">
        {messages.length === 0 ? (
          <div className="welcome-guide">
            <div className="guide-row">
              <div className="guide-avatar">
                {botConfig?.iconURL ? (
                  <img
                    src={botConfig.iconURL}
                    alt="AI"
                    className="avatar-image"
                  />
                ) : (
                  <span>AI</span>
                )}
              </div>
              <div className="guide-content">
                <div className="guide-bubble">
                  <div className="guide-text">
                    {botConfig?.onboardingInfo?.prologue || (
                      <>
                        嗨～有什么问题需要我帮忙的嘛？
                        <br />
                        试着点击下方快速查询哦～
                      </>
                    )}
                  </div>
                </div>
                <div className="guide-buttons">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      className="guide-btn"
                      onClick={() => onFollowUpClick?.(question)}
                    >
                      {question}
                    </button>
                  ))}
                </div>
                {/* 第二段引导文案 - 如果API返回了secondaryPrologue则显示 */}
                {(botConfig?.description || !botConfig) && (
                  <div className="guide-bubble guide-bubble-bottom">
                    <div className="guide-text">
                      {botConfig?.description ||
                        "我可以对客户进行总结分析哦～试一下点击客户池子里的气泡吧～或者也可以直接问我：对某某进行客户分析"}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageItem
                key={message.id}
                message={message}
                onFollowUpClick={onFollowUpClick}
                botIconURL={botConfig?.iconURL}
                viewedEmployeeName={viewedEmployeeName}
              />
            ))}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>
    );
  }
);

MessageList.displayName = "MessageList";

export default MessageList;
