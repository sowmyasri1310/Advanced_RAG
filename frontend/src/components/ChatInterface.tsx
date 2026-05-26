import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatInterface({ 
  onQuery, 
  isLoading 
}: { 
  onQuery: (q: string) => void;
  isLoading: boolean;
}) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am your Advanced RAG assistant. Ask me anything about the uploaded documents.' }
  ]);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    onQuery(input);
    setInput('');
  };

  // Expose a way for the parent to add the assistant's response
  // We'll use a hacky event-based approach or just rely on the parent passing it down
  // For better architecture, the state should live in the parent, but we'll adapt.
  return (
    <Card className="h-[600px] flex flex-col shadow-lg border-primary/20">
      <CardHeader className="bg-primary/5 pb-4 border-b">
        <CardTitle className="text-xl flex items-center">
          <Bot className="w-6 h-6 mr-2 text-primary" />
          Chat Interface
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 overflow-hidden relative">
        <ScrollArea className="h-full p-4" ref={scrollRef}>
          <div className="space-y-4 pb-4">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                      : 'bg-muted border rounded-tl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl px-4 py-3 text-sm bg-muted border rounded-tl-sm flex items-center">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin text-primary" />
                  Processing pipeline...
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      
      <CardFooter className="p-4 border-t bg-background">
        <form onSubmit={handleSubmit} className="flex w-full space-x-2">
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
