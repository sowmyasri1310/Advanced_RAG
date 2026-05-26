import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function RetrievalVisualizer({ data }: { data: any }) {
  if (!data) return null;

  return (
    <Card className="h-[600px] flex flex-col shadow-lg border-primary/20">
      <CardHeader className="bg-primary/5 pb-4 border-b">
        <CardTitle className="text-xl flex items-center justify-between">
          <span>Retrieval Pipeline</span>
          <Badge variant="outline" className="ml-2 bg-background">LangSmith Traced</Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 overflow-hidden">
        <Tabs defaultValue="query" className="h-full flex flex-col">
          <TabsList className="w-full justify-start rounded-none border-b bg-background px-4 py-6">
            <TabsTrigger value="query">Optimization</TabsTrigger>
            <TabsTrigger value="hybrid">Hybrid Search</TabsTrigger>
            <TabsTrigger value="rerank">Reranking</TabsTrigger>
          </TabsList>
          
          <div className="flex-1 overflow-hidden">
            <TabsContent value="query" className="h-full m-0 p-4">
              <ScrollArea className="h-full pr-4">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Original User Query</h3>
                    <div className="p-3 bg-muted rounded-md border text-sm">
                      {data.user_query}
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-none">LLM Rewriting (Groq)</Badge>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-primary mb-2">Optimized Query (Sent to VectorDB)</h3>
                    <div className="p-4 bg-primary/10 rounded-md border border-primary/30 text-sm font-medium">
                      {data.optimized_query}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Notice how the query is expanded for better semantic and keyword matching.
                    </p>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="hybrid" className="h-full m-0 p-4">
              <ScrollArea className="h-full pr-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-4 border rounded-lg bg-card">
                      <div className="text-2xl font-bold text-blue-500">{data.semantic_results_count}</div>
                      <div className="text-xs font-medium text-muted-foreground uppercase mt-1">Vector Matches</div>
                    </div>
                    <div className="p-4 border rounded-lg bg-card">
                      <div className="text-2xl font-bold text-green-500">{data.hybrid_results_count}</div>
                      <div className="text-xs font-medium text-muted-foreground uppercase mt-1">BM25 Matches</div>
                    </div>
                  </div>
                  
                  <Separator />
                  <p className="text-xs text-muted-foreground text-center">
                    Reciprocal Rank Fusion (RRF) used to merge results.
                  </p>
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="rerank" className="h-full m-0 p-4">
              <ScrollArea className="h-full pr-4">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Top {data.reranked_chunks?.length || 0} Chunks (CrossEncoder Reranked)</h3>
                  
                  {data.reranked_chunks?.map((chunk: any, idx: number) => (
                    <Card key={idx} className="overflow-hidden border-primary/20">
                      <div className="bg-muted px-3 py-2 border-b flex justify-between items-center text-xs">
                        <span className="font-semibold">Rank #{idx + 1}</span>
                        <div className="flex space-x-2">
                          <Badge variant="secondary" className="text-[10px]">Score: {chunk.rerank_score?.toFixed(4)}</Badge>
                          <Badge variant="outline" className="text-[10px]">Page {chunk.metadata?.page_number}</Badge>
                        </div>
                      </div>
                      <div className="p-3 text-xs leading-relaxed text-muted-foreground line-clamp-4">
                        {chunk.text}
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
