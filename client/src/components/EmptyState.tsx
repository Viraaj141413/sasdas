import { BellOff, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: "default" | "success";
}

export function EmptyState({ 
  title, 
  description, 
  actionLabel, 
  onAction,
  variant = "default"
}: EmptyStateProps) {
  const Icon = variant === "success" ? CheckCircle : BellOff;
  const iconColor = variant === "success" ? "text-primary" : "text-muted-foreground";
  const bgColor = variant === "success" ? "bg-primary/10" : "bg-muted";

  return (
    <Card className="border-dashed" data-testid="empty-state">
      <CardContent className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className={`mb-6 rounded-2xl ${bgColor} p-6 ${iconColor} shadow-sm`}>
          <Icon className="h-12 w-12" />
        </div>
        <h3 className="mb-3 text-2xl font-bold text-foreground">
          {title}
        </h3>
        <p className="mb-8 max-w-md text-base text-muted-foreground leading-relaxed">
          {description}
        </p>
        {actionLabel && onAction && (
          <Button 
            onClick={onAction} 
            size="lg"
            className="shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200"
            data-testid="button-empty-action"
          >
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
