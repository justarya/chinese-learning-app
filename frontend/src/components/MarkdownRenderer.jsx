import { useMemo } from 'react';

/**
 * A simple markdown renderer that supports:
 * - Headers (# ## ###)
 * - Bold (**text**)
 * - Italic (*text*)
 * - Code blocks (```code```)
 * - Inline code (`code`)
 * - Lists (- item)
 * - Line breaks
 */
function MarkdownRenderer({ content }) {
  const renderMarkdown = useMemo(() => {
    if (!content) return '';

    let html = content;

    // Code blocks (```...```)
    html = html.replace(/```([\s\S]*?)```/g, (match, code) => {
      return `<pre class="bg-gray-800 text-gray-100 p-3 rounded-lg overflow-x-auto my-3"><code>${escapeHtml(code.trim())}</code></pre>`;
    });

    // Inline code (`...`)
    html = html.replace(/`([^`]+)`/g, (match, code) => {
      return `<code class="bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">${escapeHtml(code)}</code>`;
    });

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-gray-800 mt-4 mb-2">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-gray-800 mt-4 mb-2">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-gray-800 mt-4 mb-2">$1</h1>');

    // Bold (**text**)
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>');

    // Italic (*text* or _text_)
    html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
    html = html.replace(/_(.*?)_/g, '<em class="italic">$1</em>');

    // Unordered lists (- item or * item)
    html = html.replace(/^[\-\*] (.*$)/gim, '<li class="ml-4 list-disc">$1</li>');
    html = html.replace(/(<li class="ml-4 list-disc">.*<\/li>)/s, '<ul class="my-2">$1</ul>');

    // Ordered lists (1. item)
    html = html.replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal">$1</li>');
    html = html.replace(/(<li class="ml-4 list-decimal">.*<\/li>)/s, '<ol class="my-2">$1</ol>');

    // Line breaks
    html = html.replace(/\n\n/g, '<br/><br/>');
    html = html.replace(/\n/g, '<br/>');

    return html;
  }, [content]);

  const escapeHtml = (text) => {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  };

  return (
    <div
      className="markdown-content"
      dangerouslySetInnerHTML={{ __html: renderMarkdown }}
    />
  );
}

export default MarkdownRenderer;
