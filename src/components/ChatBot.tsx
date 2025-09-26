import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, X, Bot, User, Minimize2 } from "lucide-react";
import { chatbotAPI } from "@/api/impact-analysis";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  typing?: boolean;
  streaming?: boolean;
}

// Markdown renderer component for chat messages
const MarkdownMessage = ({ content, isStreaming }: { content: string; isStreaming?: boolean }) => {
  return (
    <div className="text-sm">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Customize markdown elements to fit chat style
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
          h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
          ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="text-sm">{children}</li>,
          code: ({ children }) => (
            <code className="bg-surface-subtle/50 px-1 py-0.5 rounded text-xs font-mono">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="bg-surface-subtle/50 p-2 rounded text-xs font-mono overflow-x-auto mb-2">
              {children}
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-primary/30 pl-2 italic mb-2">
              {children}
            </blockquote>
          ),
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          a: ({ href, children }) => (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-primary hover:underline"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
      {isStreaming && (
        <span className="ml-1 animate-pulse text-primary">|</span>
      )}
    </div>
  );
};

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm **DOBB Assistant**. I'm here to help you with your product development workflow.\n\nI can assist with:\n- 📋 **User Story Generation**\n- 🧪 **Test Case Creation**\n- 📊 **Impact Analysis**\n- 💡 **Feature Planning**\n\nHow can I assist you today?",
      sender: 'bot',
      timestamp: new Date(Date.now() - 5000)
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamingTimeoutRef = useRef<NodeJS.Timeout | null>(null);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const streamMessage = (messageId: string, fullText: string) => {
    setStreamingMessageId(messageId);
    let currentIndex = 0;
    
    const streamNextChar = () => {
      if (currentIndex < fullText.length) {
        const displayText = fullText.substring(0, currentIndex + 1);
        
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, text: displayText, streaming: true }
            : msg
        ));
        
        currentIndex++;
        streamingTimeoutRef.current = setTimeout(streamNextChar, 20 + Math.random() * 30); // Variable speed
      } else {
        // Streaming complete
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, streaming: false }
            : msg
        ));
        setStreamingMessageId(null);
      }
    };
    
    streamNextChar();
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isOpen && hasNewMessage) {
      const timer = setTimeout(() => setHasNewMessage(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, hasNewMessage]);

  // Cleanup streaming timeout on unmount
  useEffect(() => {
    return () => {
      if (streamingTimeoutRef.current) {
        clearTimeout(streamingTimeoutRef.current);
      }
    };
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    const currentMessage = inputValue;
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      // Call the real chatbot API
      const response = await chatbotAPI.sendMessage({
        message: currentMessage,
        conversationId: conversationId
      });

      // Update conversation ID if provided
      if (response.conversationId) {
        setConversationId(response.conversationId);
      }

      const botMessageId = (Date.now() + 1).toString();
      const botResponse: Message = {
        id: botMessageId,
        text: "", // Start with empty text for streaming
        sender: 'bot',
        timestamp: new Date(),
        streaming: true
      };
      
      // Add empty message first
      setMessages(prev => [...prev, botResponse]);
      
      // Start streaming the response
      setTimeout(() => {
        streamMessage(botMessageId, response.response);
      }, 500); // Small delay before streaming starts
      
      if (!isOpen) {
        setHasNewMessage(true);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Fallback response if API fails
      const errorMessageId = (Date.now() + 1).toString();
      const errorResponse: Message = {
        id: errorMessageId,
        text: "",
        sender: 'bot',
        timestamp: new Date(),
        streaming: true
      };
      
      setMessages(prev => [...prev, errorResponse]);
      
      // Stream the error message too
      setTimeout(() => {
        streamMessage(errorMessageId, "I'm sorry, I'm having trouble connecting right now. Please try again later.");
      }, 300);
      
      if (!isOpen) {
        setHasNewMessage(true);
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
    setHasNewMessage(false);
  };

  const minimizeChat = () => {
    setIsMinimized(true);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={toggleChat}
          className="relative h-14 w-14 rounded-full bg-gradient-primary text-white shadow-elegant hover:opacity-90 transition-all duration-300 hover:scale-105"
        >
          <MessageCircle className="h-6 w-6" />
          {hasNewMessage && (
            <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full animate-pulse" />
          )}
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Mobile overlay */}
      <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsOpen(false)} />
      
      <div className={`fixed z-50 ${isMinimized ? 'bottom-6 right-6' : 'md:bottom-6 md:right-6 inset-x-4 bottom-4 md:inset-auto'}`}>
        <Card 
          className={`bg-surface-elevated border border-border shadow-elegant transition-all duration-300 ${
            isMinimized ? 'w-80 h-16' : 'w-full h-[calc(100vh-2rem)] md:w-[500px] md:h-[650px]'
          }`}
        >
        <CardHeader 
          className={`flex flex-row items-center justify-between p-4 border-b border-border ${
            isMinimized ? 'cursor-pointer hover:bg-surface-subtle/50 transition-colors' : ''
          }`}
          onClick={isMinimized ? () => setIsMinimized(false) : undefined}
        >
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gradient-primary text-white">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-surface-elevated" />
            </div>
            <div className={isMinimized ? 'hidden' : 'block'}>
              <CardTitle className="text-sm font-semibold text-foreground">DOBB Assistant</CardTitle>
              <p className="text-xs text-muted-foreground">Online • Typically replies instantly</p>
            </div>
            {isMinimized && (
              <div className="flex items-center space-x-2">
                <CardTitle className="text-sm font-semibold text-foreground">DOBB Assistant</CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {messages.length > 1 ? `${messages.length - 1} messages` : 'Online'}
                </Badge>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-1">
            {!isMinimized && (
              <Button
                variant="ghost"
                size="sm"
                onClick={minimizeChat}
                className="h-8 w-8 p-0 hover:bg-surface-subtle"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0 hover:bg-surface-subtle"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-[calc(100vh-8rem)] md:h-[calc(650px-73px)]">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-2 ${
                      message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback 
                        className={
                          message.sender === 'bot' 
                            ? "bg-gradient-primary text-white" 
                            : "bg-surface-subtle text-foreground"
                        }
                      >
                        {message.sender === 'bot' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <div 
                      className={`max-w-[70%] rounded-xl px-3 py-2 ${
                        message.sender === 'user'
                          ? 'bg-primary text-primary-foreground ml-auto'
                          : 'bg-surface-subtle text-foreground'
                      }`}
                    >
                      {message.sender === 'bot' ? (
                        <MarkdownMessage 
                          content={message.text} 
                          isStreaming={message.streaming}
                        />
                      ) : (
                        <div className="text-sm">
                          {message.text}
                        </div>
                      )}
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex items-start space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-primary text-white">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-surface-subtle text-foreground rounded-xl px-3 py-2 max-w-[70%]">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </ScrollArea>

            <div className="border-t border-border p-4">
              <div className="flex items-center space-x-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 bg-surface-subtle border-border"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="bg-gradient-primary text-white hover:opacity-90"
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">
                  Powered by dobb.ai
                </p>
                <Badge variant="secondary" className="text-xs">
                  AI Assistant
                </Badge>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
    </>
  );
};

export default ChatBot;