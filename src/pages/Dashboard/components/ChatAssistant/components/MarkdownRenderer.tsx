import React from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import "./MarkdownRenderer.less";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * 使用 react-markdown 渲染 Markdown 内容
 */
const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = "",
}) => {
  // 预处理内容：修复不标准的 markdown 格式
  const preprocessContent = (text: string): string => {
    if (!text) return "";

    let processed = text;

    // 步骤1: 处理连续的 ### 标记（多次执行以处理嵌套情况）
    // 例如：###标题1###标题2###标题3 -> ###标题1\n\n###标题2\n\n###标题3
    for (let i = 0; i < 5; i++) {
      processed = processed.replace(
        /(#{1,6})([^#\n]+?)(#{1,6})/g,
        "$1$2\n\n$3"
      );
    }

    // 步骤2: 在所有 # 标记后添加空格（如果后面不是空格、换行或 #）
    // 例如：###标题 -> ### 标题
    processed = processed.replace(/(#{1,6})([^\s#\n])/g, "$1 $2");

    // 步骤3: 确保标题前有换行（如果前面不是换行或文档开头）
    processed = processed.replace(/([^\n])(#{1,6}\s)/g, "$1\n\n$2");

    // 步骤4: 修复列表项（- 开头）
    // 确保 - 前面有换行，后面有空格
    processed = processed.replace(/([^\n])\s*-\s*([^\s])/g, "$1\n- $2");

    // 步骤5: 清理多余的连续换行
    processed = processed.replace(/\n{3,}/g, "\n\n");

    return processed.trim();
  };

  const processedContent = preprocessContent(content);

  const components: Components = {
    h1: ({ children }) => <h1 className="md-heading md-h1">{children}</h1>,
    h2: ({ children }) => <h2 className="md-heading md-h2">{children}</h2>,
    h3: ({ children }) => <h3 className="md-heading md-h3">{children}</h3>,
    h4: ({ children }) => <h4 className="md-heading md-h4">{children}</h4>,
    h5: ({ children }) => <h5 className="md-heading md-h5">{children}</h5>,
    h6: ({ children }) => <h6 className="md-heading md-h6">{children}</h6>,
    p: ({ children }) => <p className="md-paragraph">{children}</p>,
    ul: ({ children }) => <ul className="md-list">{children}</ul>,
    ol: ({ children }) => <ol className="md-list">{children}</ol>,
    li: ({ children }) => <li>{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className="md-blockquote">{children}</blockquote>
    ),
    code: ({ children, className }) => {
      // 检查是否是行内代码（没有 language- 前缀）
      const isInline = !className || !className.startsWith("language-");
      return isInline ? (
        <code className="md-inline-code">{children}</code>
      ) : (
        <code className={className}>{children}</code>
      );
    },
    pre: ({ children }) => <pre className="md-code-block">{children}</pre>,
    a: ({ href, children }) => (
      <a
        href={href}
        className="md-link"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
    strong: ({ children }) => <strong className="md-bold">{children}</strong>,
    em: ({ children }) => <i className="md-italic">{children}</i>,
    del: ({ children }) => <del className="md-strikethrough">{children}</del>,
    hr: () => <hr className="md-hr" />,
  };

  return (
    <div className={`markdown-renderer ${className}`}>
      <ReactMarkdown components={components}>{processedContent}</ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
