import { format } from "date-fns";
import { Calendar, Phone, CheckCircle2, Edit2, Trash2, Clock, Send, Repeat, MessageSquare } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type Reminder } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ReminderCardProps {
  reminder: Reminder;
  onEdit: (reminder: Reminder) => void;
  isOverdue?: boolean;
}

export function ReminderCard({ reminder, onEdit, isOverdue }: ReminderCardProps) {
  const { toast } = useToast();

  const completeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("PATCH", `/api/reminders/${reminder.id}/complete`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      toast({
        title: "Reminder completed",
        description: "The reminder has been marked as complete.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to complete reminder. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", `/api/reminders/${reminder.id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      toast({
        title: "Reminder deleted",
        description: "The reminder has been permanently deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete reminder. Please try again.",
        variant: "destructive",
      });
    },
  });

  const scheduledDate = new Date(reminder.scheduledFor);
  const formattedDate = format(scheduledDate, "MMM d, yyyy");
  const formattedTime = format(scheduledDate, "h:mm a");

  const getStatusBadge = () => {
    if (reminder.completed) {
      return (
        <Badge variant="secondary" className="gap-1.5 px-3 py-1 shadow-sm" data-testid={`badge-status-${reminder.id}`}>
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span className="font-medium">Completed</span>
        </Badge>
      );
    }
    if (isOverdue) {
      return (
        <Badge variant="destructive" className="gap-1.5 px-3 py-1 shadow-sm shadow-destructive/20" data-testid={`badge-status-${reminder.id}`}>
          <Clock className="h-3.5 w-3.5" />
          <span className="font-medium">Overdue</span>
        </Badge>
      );
    }
    if (reminder.status === "sent") {
      const method = reminder.notificationMethod || 'sms';
      const methodLabel = method === 'sms' ? 'SMS Sent' : 'Call Made';
      return (
        <Badge variant="default" className="gap-1.5 px-3 py-1 shadow-sm shadow-primary/20" data-testid={`badge-status-${reminder.id}`}>
          <Send className="h-3.5 w-3.5" />
          <span className="font-medium">{methodLabel}</span>
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1.5 px-3 py-1" data-testid={`badge-status-${reminder.id}`}>
        <Clock className="h-3.5 w-3.5" />
        <span className="font-medium">Scheduled</span>
      </Badge>
    );
  };

  const getNotificationMethodBadge = () => {
    const method = reminder.notificationMethod || 'sms';
    const config: Record<string, { icon: any, label: string, className: string }> = {
      sms: { icon: MessageSquare, label: 'SMS', className: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300' },
      call: { icon: Phone, label: 'Call', className: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300' },
    };
    const { icon: Icon, label, className } = config[method] || config.sms;
    return (
      <Badge variant="outline" className={`gap-1 px-2 py-0.5 text-xs ${className}`}>
        <Icon className="h-3 w-3" />
        <span>{label}</span>
      </Badge>
    );
  };

  return (
    <Card className="hover-elevate transition-all duration-200 hover:shadow-lg" data-testid={`card-reminder-${reminder.id}`}>
      <CardHeader className="flex flex-row items-start justify-between gap-2 sm:gap-4 space-y-0 pb-3 sm:pb-4 p-4 sm:p-6">
        <div className="flex-1 space-y-1.5 sm:space-y-2">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-card-foreground leading-tight tracking-tight" data-testid={`text-title-${reminder.id}`}>
              {reminder.title}
            </h3>
            {getNotificationMethodBadge()}
            {reminder.recurrenceType && reminder.recurrenceType !== 'none' && (
              <Badge variant="outline" className="gap-1 px-2 py-0.5 text-xs bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300">
                <Repeat className="h-3 w-3" />
                <span className="capitalize">{reminder.recurrenceType}</span>
              </Badge>
            )}
          </div>
          {reminder.description && (
            <p className="text-sm text-muted-foreground leading-relaxed" data-testid={`text-description-${reminder.id}`}>
              {reminder.description}
            </p>
          )}
        </div>
        {getStatusBadge()}
      </CardHeader>
      <CardContent className="pb-3 sm:pb-4 p-4 sm:p-6 pt-0">
        <div className="flex flex-wrap gap-3 sm:gap-6">
          <div className="flex items-center gap-2 sm:gap-2.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-card-foreground/5">
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-md bg-primary/10">
              <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">Date & Time</span>
              <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                <span className="text-xs sm:text-sm font-semibold text-foreground" data-testid={`text-date-${reminder.id}`}>{formattedDate}</span>
                <span className="text-[10px] sm:text-xs text-muted-foreground">at</span>
                <span className="text-xs sm:text-sm font-semibold text-foreground" data-testid={`text-time-${reminder.id}`}>{formattedTime}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-2.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-card-foreground/5">
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-md bg-primary/10">
              <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">Phone Number</span>
              <span className="text-xs sm:text-sm font-mono font-semibold text-foreground" data-testid={`text-phone-${reminder.id}`}>{reminder.phoneNumber}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-1.5 sm:gap-2 pt-3 sm:pt-4 border-t bg-card-foreground/[0.02] p-4 sm:p-6">
        {!reminder.completed && (
          <Button
            size="sm"
            variant="default"
            className="gap-2 shadow-sm"
            onClick={() => completeMutation.mutate()}
            disabled={completeMutation.isPending}
            data-testid={`button-complete-${reminder.id}`}
          >
            <CheckCircle2 className="h-4 w-4" />
            <span className="font-medium">Mark Complete</span>
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          className="gap-2"
          onClick={() => onEdit(reminder)}
          data-testid={`button-edit-${reminder.id}`}
        >
          <Edit2 className="h-4 w-4" />
          <span className="font-medium">Edit</span>
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="gap-2 text-destructive"
              data-testid={`button-delete-${reminder.id}`}
            >
              <Trash2 className="h-4 w-4" />
              <span className="font-medium">Delete</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="sm:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl">Delete Reminder</AlertDialogTitle>
              <AlertDialogDescription className="text-base">
                Are you sure you want to delete "{reminder.title}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteMutation.mutate()}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                data-testid="button-confirm-delete"
              >
                Delete Reminder
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
