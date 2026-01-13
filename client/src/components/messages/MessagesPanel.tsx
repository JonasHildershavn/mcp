import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { MessageLog } from '../../types/mcp';
import { useMessageLog } from '../../contexts/MessageLogContext';

export function MessagesPanel() {
  const { messages } = useMessageLog();
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const prevMessageCountRef = React.useRef(0);

  // Auto-scroll only when new messages arrive
  React.useEffect(() => {
    if (messages.length > prevMessageCountRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevMessageCountRef.current = messages.length;
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <p className="text-lg font-medium">No messages yet</p>
          <p className="text-sm mt-2">Execute a tool to see JSON-RPC messages</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-4 space-y-4">
      <div className="mb-4 pb-2 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">JSON-RPC Messages</h3>
        <p className="text-sm text-gray-600 mt-1">
          Live protocol communication
        </p>
      </div>

      {messages.map((msg, index) => (
        <MessageItem key={index} message={msg} />
      ))}

      <div ref={messagesEndRef} />
    </div>
  );
}

interface MessageItemProps {
  message: MessageLog;
}

function MessageItem({ message }: MessageItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isRequest = message.direction === 'request';
  const formattedTime = message.timestamp.toLocaleTimeString();

  // Get a preview of the message
  const getPreview = () => {
    const method = message.message.method || 'response';
    const id = message.message.id;
    return `${method} ${id !== undefined ? `(id: ${id})` : ''}`;
  };

  // Color coding based on message type
  const getColorClasses = () => {
    const type = message.messageType || '';

    if (type === 'initialize') {
      return { border: 'border-purple-300', bg: 'bg-purple-50', text: 'text-purple-900', badge: 'bg-purple-100 text-purple-800' };
    } else if (type === 'tools/list' || type === 'resources/list' || type === 'prompts/list') {
      return { border: 'border-blue-300', bg: 'bg-blue-50', text: 'text-blue-900', badge: 'bg-blue-100 text-blue-800' };
    } else if (type === 'tools/call') {
      return { border: 'border-green-300', bg: 'bg-green-50', text: 'text-green-900', badge: 'bg-green-100 text-green-800' };
    } else if (type === 'resources/read') {
      return { border: 'border-orange-300', bg: 'bg-orange-50', text: 'text-orange-900', badge: 'bg-orange-100 text-orange-800' };
    } else if (type === 'prompts/get') {
      return { border: 'border-yellow-300', bg: 'bg-yellow-50', text: 'text-yellow-900', badge: 'bg-yellow-100 text-yellow-800' };
    } else if (type === 'error') {
      return { border: 'border-red-300', bg: 'bg-red-50', text: 'text-red-900', badge: 'bg-red-100 text-red-800' };
    } else if (isRequest) {
      return { border: 'border-blue-200', bg: 'bg-blue-50', text: 'text-blue-900', badge: 'bg-blue-100 text-blue-800' };
    } else {
      return { border: 'border-gray-300', bg: 'bg-gray-50', text: 'text-gray-900', badge: 'bg-gray-100 text-gray-800' };
    }
  };

  // Get server color
  const getServerColor = () => {
    const colors = {
      calculator: 'bg-blue-600 text-white',
      notes: 'bg-green-600 text-white',
      templates: 'bg-orange-600 text-white',
      weather: 'bg-purple-600 text-white'
    };
    return colors[message.serverName as keyof typeof colors] || 'bg-gray-600 text-white';
  };

  const colors = getColorClasses();

  return (
    <div className={`rounded-lg border ${colors.border} ${colors.bg}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 flex items-center justify-between hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded font-semibold ${getServerColor()}`}>
            {message.serverName.toUpperCase()}
          </span>
          <span className={`font-semibold text-sm ${colors.text}`}>
            {isRequest ? '→ REQUEST' : '← RESPONSE'}
          </span>
          {message.messageType && (
            <span className={`text-xs px-2 py-0.5 rounded font-mono ${colors.badge}`}>
              {message.messageType}
            </span>
          )}
          <span className="text-xs text-gray-600">{formattedTime}</span>
          {!isExpanded && (
            <span className="text-xs text-gray-500 font-mono">
              {getPreview()}
            </span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-gray-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="overflow-x-auto">
          <SyntaxHighlighter
            language="json"
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              borderRadius: '0 0 0.5rem 0.5rem',
              fontSize: '0.875rem'
            }}
          >
            {JSON.stringify(message.message, null, 2)}
          </SyntaxHighlighter>
        </div>
      )}
    </div>
  );
}
