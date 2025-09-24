import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, X, Bot, User, Minimize2 } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  typing?: boolean;
}

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm DOBB Assistant. I'm here to help you with your product development workflow. How can I assist you today?",
      sender: 'bot',
      timestamp: new Date(Date.now() - 5000)
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const dummyResponses = [
    "I can help you generate user stories, create test cases, and analyze feature impact. What would you like to work on?",
    "Great question! DOBB.ai specializes in automating product development tasks. Would you like me to show you around?",
    "I can assist with PRD analysis, user story generation, test case creation, and impact analysis. What's your current project about?",
    "That's an interesting point! Let me help you break that down into actionable user stories.",
    "I'd be happy to help you with that! DOBB.ai can streamline your entire product development lifecycle.",
    "Absolutely! I can help you identify potential gaps and technical impacts for your feature requirements.",
    "Good thinking! Let's work together to create comprehensive test cases for your user stories.",
    "I understand your concern. DOBB.ai is designed to integrate seamlessly with your existing workflow tools like GitHub, Figma, and Atlassian."
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate bot typing and response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: dummyResponses[Math.floor(Math.random() * dummyResponses.length)],
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
      
      if (!isOpen) {
        setHasNewMessage(true);
      }
    }, 1000 + Math.random() * 2000);
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
    <div className="fixed bottom-6 right-6 z-50">
      <Card 
        className={`bg-surface-elevated border border-border shadow-elegant transition-all duration-300 ${
          isMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'
        }`}
      >
        <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gradient-primary text-white">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-surface-elevated" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">DOBB Assistant</CardTitle>
              <p className="text-xs text-muted-foreground">Online • Typically replies instantly</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={minimizeChat}
              className="h-8 w-8 p-0 hover:bg-surface-subtle"
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
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
          <CardContent className="p-0 flex flex-col h-[calc(500px-73px)]">
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
                      <p className="text-sm">{message.text}</p>
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
                  Powered by DOBB.ai
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
  );
};

export default ChatBot;