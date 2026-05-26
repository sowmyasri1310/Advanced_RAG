'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, FileText, Database, Settings2, Trash2 } from 'lucide-react';
import UploadModal from '@/components/UploadModal';
import RetrievalVisualizer from '@/components/RetrievalVisualizer';
import { queryRAG, clearDatabase } from '@/lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Home() {
  const [pipelineData, setPipelineData] = useState<any>(null);
  const [isQuerying, setIsQuerying] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [dbVersion, setDbVersion] = useState(0);
  
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am your Advanced RAG assistant. Upload some PDFs, then ask me anything about them.' }
  ]);
  
  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isQuerying) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsQuerying(true);
    setPipelineData(null); // reset visualizer
    
    try {
      const result = await queryRAG(userMsg);
      setPipelineData(result);
      setMessages(prev => [...prev, { role: 'assistant', content: result.answer }]);
    } catch (error) {
      console.error("Query failed", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error while processing your request." }]);
    } finally {
      setIsQuerying(false);
    }
  };

  const handleClearDatabase = async () => {
    if (!confirm("Are you sure you want to clear the entire vector database? This cannot be undone.")) return;
    setIsClearing(true);
    try {
      await clearDatabase();
      setDbVersion(v => v + 1);
      alert("Database cleared successfully!");
    } catch (error) {
      console.error("Failed to clear DB", error);
      alert("Failed to clear the database.");
    } finally {
      setIsClearing(false);
    }
  };

  const handleClearChat = () => {
    if (!confirm("Are you sure you want to clear the chat history?")) return;
    setMessages([{ role: 'assistant', content: 'Hello! I am your Advanced RAG assistant. Upload some PDFs, then ask me anything about them.' }]);
    setPipelineData(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8 font-sans">
      <header className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg">
            <Bot className="text-primary-foreground w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Advanced RAG System</h1>
            <p className="text-sm text-muted-foreground">Hybrid Search + Query Optimization + Reranking</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Upload & Chat */}
        <div className="lg:col-span-5 space-y-8 flex flex-col">
          
          {/* Upload Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center">
                <FileText className="w-5 h-5 mr-2 text-primary" /> 
                Knowledge Base
              </h2>
              <Button variant="destructive" size="sm" onClick={handleClearDatabase} disabled={isClearing}>
                <Database className="w-4 h-4 mr-2" />
                Clear Database
              </Button>
            </div>
            <UploadModal key={dbVersion} onUploadComplete={() => alert("Knowledge Base updated successfully!")} />
          </section>

          {/* Chat Section */}
          <section className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center">
                <Bot className="w-5 h-5 mr-2 text-primary" />
                Assistant
              </h2>
              <Button variant="outline" size="sm" onClick={handleClearChat}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Chat
              </Button>
            </div>
            
            <Card className="flex-1 flex flex-col shadow-lg border-primary/20 min-h-[500px]">
              <CardContent className="flex-1 p-0 overflow-hidden relative">
                <ScrollArea className="h-[400px] lg:h-[500px] p-4">
                  <div className="space-y-4 pb-4">
                    {messages.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                            msg.role === 'user' 
                              ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                              : 'bg-muted border rounded-tl-sm whitespace-pre-wrap'
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {isQuerying && (
                      <div className="flex justify-start">
                        <div className="max-w-[80%] rounded-2xl px-4 py-3 text-sm bg-muted border rounded-tl-sm flex items-center animate-pulse">
                          <Settings2 className="w-4 h-4 mr-2 animate-spin text-primary" />
                          Running Pipeline...
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
              
              <CardFooter className="p-4 border-t bg-background">
                <form onSubmit={handleQuery} className="flex w-full space-x-2">
                  <Input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about the uploaded documents..."
                    disabled={isQuerying}
                    className="flex-1"
                  />
                  <Button type="submit" size="icon" disabled={isQuerying || !input.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </section>
        </div>

        {/* Right Column: Visualization */}
        <div className="lg:col-span-7 space-y-8 flex flex-col">
          <section className="flex-1 flex flex-col">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Database className="w-5 h-5 mr-2 text-primary" />
              Pipeline Telemetry
            </h2>
            {pipelineData ? (
              <RetrievalVisualizer data={pipelineData} />
            ) : (
              <Card className="h-full min-h-[500px] flex items-center justify-center shadow-inner border-dashed bg-muted/30">
                <div className="text-center text-muted-foreground p-8 max-w-sm">
                  <Database className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p className="font-medium">No Telemetry Data</p>
                  <p className="text-sm mt-2">Ask a question to see how the RAG pipeline processes your query.</p>
                </div>
              </Card>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
