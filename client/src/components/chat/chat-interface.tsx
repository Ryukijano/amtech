import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Message } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./message-bubble";
import { Send } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SUGGESTED_PROMPTS = {
  property: [
    "Search for 4 bedroom houses in London under £2000 a month",
    "What properties are available for sale?",
    "Show me properties with 3 bedrooms",
    "Find properties under £500,000",
    "What amenities are available in downtown properties?"
  ],
  financial: [
    "What is the estimated monthly mortgage payment for a £200,000 house?",
    "I earn £40,000 a year and have £30,000 for deposit. What properties can I afford?",
    "What are the current interest rates for mortgages?",
    "Are there any hidden costs or maintenance fees?"
  ],
  legal: [
    "What documents do I need to buy a house?",
    "What's the difference between freehold and leasehold?",
    "How long does the home-buying process usually take?",
    "What are my rights as a tenant?"
  ],
  market: [
    "How is the real estate market performing in this area?",
    "What areas are expected to grow in value?",
    "Is it currently a buyer's or seller's market?",
    "What are the best areas for investment?"
  ],
  condition: [
    "What is the property condition?",
    "Are there any structural issues?",
    "When was the last inspection conducted?",
    "What kind of heating system does the property have?"
  ]
};

export function ChatInterface() {
  const [input, setInput] = useState("");
  const [activeTab, setActiveTab] = useState("property");

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
  });

  const mutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/chat", {
        message,
        type: "property_search",
      });
      return response.json();
    },
  });

  const handleSend = async () => {
    if (!input.trim()) return;

    const message = input;
    setInput("");
    await mutation.mutateAsync(message);
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
  };

  // Show suggested prompts only when there are no messages
  const showSuggestions = messages.length === 0;

  return (
    <div className="flex flex-col h-[600px] max-w-2xl mx-auto border rounded-lg">
      <ScrollArea className="flex-1 p-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {mutation.isPending && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="animate-spin">⌛</div>
            Thinking...
          </div>
        )}
        {showSuggestions && (
          <div className="space-y-4 p-4">
            <p className="text-sm text-muted-foreground mb-2">
              I can help you with various real estate queries. Choose a category and try asking:
            </p>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-5 w-full">
                <TabsTrigger value="property">Properties</TabsTrigger>
                <TabsTrigger value="financial">Financial</TabsTrigger>
                <TabsTrigger value="legal">Legal</TabsTrigger>
                <TabsTrigger value="market">Market</TabsTrigger>
                <TabsTrigger value="condition">Condition</TabsTrigger>
              </TabsList>
              {Object.entries(SUGGESTED_PROMPTS).map(([category, prompts]) => (
                <TabsContent key={category} value={category} className="mt-2">
                  <div className="flex flex-wrap gap-2">
                    {prompts.map((prompt, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="text-sm"
                        onClick={() => handlePromptClick(prompt)}
                      >
                        {prompt}
                      </Button>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        )}
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about properties..."
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
          />
          <Button onClick={handleSend} disabled={mutation.isPending}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}