import { cn } from "@/lib/utils";
import { Message } from "@shared/schema";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { PropertyCard } from "./property-card";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  const renderContent = () => {
    if (isUser) {
      return <p className="text-sm">{message.content}</p>;
    }

    try {
      const parsedContent = JSON.parse(message.content);
      if (parsedContent.properties && parsedContent.aiResponse) {
        return (
          <div className="space-y-4">
            <p className="text-sm">{parsedContent.aiResponse}</p>
            {parsedContent.properties.length > 0 && (
              <div className="space-y-4">
                {parsedContent.properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}
          </div>
        );
      }

      // Handle financial or general advice responses
      if (parsedContent.advice) {
        return (
          <div className="space-y-2">
            <p className="text-sm">{parsedContent.advice}</p>
            {parsedContent.recommendations && (
              <ul className="list-disc list-inside text-sm">
                {parsedContent.recommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            )}
          </div>
        );
      }

      if (parsedContent.answer) {
        return (
          <div className="space-y-2">
            <p className="text-sm">{parsedContent.answer}</p>
            {parsedContent.relatedTopics && (
              <div className="text-sm text-muted-foreground">
                Related topics: {parsedContent.relatedTopics.join(", ")}
              </div>
            )}
          </div>
        );
      }

      return <p className="text-sm">{message.content}</p>;
    } catch (e) {
      return <p className="text-sm">{message.content}</p>;
    }
  };

  return (
    <div className={cn("flex gap-3 mb-4", isUser ? "flex-row-reverse" : "flex-row")}>
      <Avatar className="h-8 w-8">
        <div className={cn(
          "h-full w-full rounded-full flex items-center justify-center",
          isUser ? "bg-primary" : "bg-secondary"
        )}>
          {isUser ? "U" : "A"}
        </div>
      </Avatar>

      <Card className={cn(
        "p-3 max-w-[80%]",
        isUser ? "bg-primary text-primary-foreground" : "bg-secondary"
      )}>
        {renderContent()}
      </Card>
    </div>
  );
}