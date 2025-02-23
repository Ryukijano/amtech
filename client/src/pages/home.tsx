import { ChatInterface } from "@/components/chat/chat-interface";

export default function Home() {
  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Amreal Property Assistant</h1>
        <p className="text-muted-foreground">
          Ask me anything about properties, financing, or real estate in general.
        </p>
      </div>
      
      <ChatInterface />
    </div>
  );
}
