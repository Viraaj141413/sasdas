import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Bell, Sparkles, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { type Reminder } from "@shared/schema";
import { ReminderCard } from "@/components/ReminderCard";
import { ReminderDialog } from "@/components/ReminderDialog";
import { EmptyState } from "@/components/EmptyState";
import { Analytics } from "@/components/Analytics";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";
import { queryClient } from "@/lib/queryClient";

export default function Home() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const { user, signOut } = useAuth();

  const { data: reminders, isLoading } = useQuery<Reminder[]>({
    queryKey: ["/api/reminders"],
  });

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('reminders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reminders',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const getUserInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const handleEdit = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingReminder(null);
  };

  const now = new Date();
  const activeReminders = reminders?.filter(r => !r.completed && new Date(r.scheduledFor) > now) || [];
  const overdueReminders = reminders?.filter(r => !r.completed && new Date(r.scheduledFor) <= now) || [];
  const completedReminders = reminders?.filter(r => r.completed) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-950/60 shadow-lg shadow-blue-500/5">
        <div className="container max-w-6xl mx-auto px-3 sm:px-6">
          <div className="flex h-16 sm:h-20 items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="relative flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 shadow-xl shadow-blue-500/30 transform hover:scale-110 transition-transform duration-300">
                <Bell className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
                <div className="absolute -right-1 -top-1 sm:-right-1.5 sm:-top-1.5 h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-gradient-to-br from-green-400 to-green-500 ring-2 ring-white dark:ring-slate-950 animate-pulse" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  QA Reminders
                </h1>
                <p className="text-xs text-slate-600 dark:text-slate-400 hidden sm:block font-medium">Never miss a testing deadline</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              <div className="hidden md:flex items-center gap-3 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-white to-blue-50 dark:from-slate-800 dark:to-slate-700 border border-slate-200 dark:border-slate-700 shadow-md">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-blue-500 animate-pulse shadow-lg shadow-blue-500/50" />
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{activeReminders.length}</span>
                  <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">Active</span>
                </div>
                {overdueReminders.length > 0 && (
                  <>
                    <div className="h-4 sm:h-5 w-px bg-slate-300 dark:bg-slate-600" />
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-red-500 animate-pulse shadow-lg shadow-red-500/50" />
                      <span className="text-xs sm:text-sm font-bold text-red-600 dark:text-red-400">{overdueReminders.length}</span>
                      <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">Overdue</span>
                    </div>
                  </>
                )}
              </div>
              <Button
                onClick={() => setIsDialogOpen(true)}
                size="sm"
                className="gap-1.5 sm:gap-2 h-9 sm:h-11 px-3 sm:px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-purple-500/40 transform hover:scale-105 transition-all duration-200"
                data-testid="button-create-reminder"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-sm sm:text-base font-bold">New</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-12 sm:w-12 rounded-full hover:scale-110 transition-transform duration-200">
                    <Avatar className="h-8 w-8 sm:h-10 sm:w-10 ring-2 ring-blue-500/20">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-white font-bold text-sm sm:text-base shadow-lg">
                        {user?.email ? getUserInitials(user.email) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60 bg-white dark:bg-slate-900 shadow-xl border-slate-200 dark:border-slate-800">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-2 p-2">
                      <p className="text-sm font-bold leading-none">Account</p>
                      <p className="text-xs leading-none text-slate-600 dark:text-slate-400 truncate font-medium">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
                  <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300 focus:bg-red-50 dark:focus:bg-red-950/20 font-medium p-3">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-3 sm:px-6 py-6 sm:py-8 md:py-12">
        <div className="mb-6 sm:mb-10 space-y-2 sm:space-y-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500 animate-pulse" />
            <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Manage Your Reminders</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
            Schedule QA tasks and receive automated notifications via SMS or Call
          </p>
        </div>

        <Tabs defaultValue="active" className="space-y-4 sm:space-y-8">
          <TabsList className="grid w-full max-w-2xl grid-cols-4 h-12 sm:h-14 p-1 sm:p-1.5 bg-gradient-to-r from-white to-blue-50 dark:from-slate-900 dark:to-indigo-950 border border-slate-200 dark:border-slate-800 shadow-lg" data-testid="tabs-reminder-filter">
            <TabsTrigger value="active" className="gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:shadow-md" data-testid="tab-active">
              <span>Active</span>
              {activeReminders.length > 0 && (
                <span className="flex h-4 min-w-4 sm:h-5 sm:min-w-5 items-center justify-center rounded-full bg-primary px-1 sm:px-1.5 text-[10px] sm:text-xs font-semibold text-primary-foreground">
                  {activeReminders.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="overdue" className="gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:shadow-md" data-testid="tab-overdue">
              <span>Overdue</span>
              {overdueReminders.length > 0 && (
                <span className="flex h-4 min-w-4 sm:h-5 sm:min-w-5 items-center justify-center rounded-full bg-destructive px-1 sm:px-1.5 text-[10px] sm:text-xs font-semibold text-destructive-foreground">
                  {overdueReminders.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:shadow-md" data-testid="tab-completed">
              <span className="hidden sm:inline">Completed</span>
              <span className="sm:hidden">Done</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:shadow-md" data-testid="tab-analytics">
              <span className="hidden sm:inline">Analytics</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4 animate-in fade-in-50 duration-300">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-48 w-full rounded-xl" />
                ))}
              </div>
            ) : activeReminders.length === 0 ? (
              <EmptyState
                title="No active reminders"
                description="Create your first QA reminder to get started with automated SMS notifications."
                actionLabel="Create Reminder"
                onAction={() => setIsDialogOpen(true)}
              />
            ) : (
              <div className="space-y-4">
                {activeReminders.map((reminder, index) => (
                  <div
                    key={reminder.id}
                    className="animate-in fade-in-50 slide-in-from-bottom-4 duration-300"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <ReminderCard
                      reminder={reminder}
                      onEdit={handleEdit}
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="overdue" className="space-y-4 animate-in fade-in-50 duration-300">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-48 w-full rounded-xl" />
                ))}
              </div>
            ) : overdueReminders.length === 0 ? (
              <EmptyState
                title="No overdue reminders"
                description="You're all caught up! All your reminders are scheduled for the future."
                variant="success"
              />
            ) : (
              <div className="space-y-4">
                {overdueReminders.map((reminder, index) => (
                  <div
                    key={reminder.id}
                    className="animate-in fade-in-50 slide-in-from-bottom-4 duration-300"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <ReminderCard
                      reminder={reminder}
                      onEdit={handleEdit}
                      isOverdue
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4 animate-in fade-in-50 duration-300">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-48 w-full rounded-xl" />
                ))}
              </div>
            ) : completedReminders.length === 0 ? (
              <EmptyState
                title="No completed reminders"
                description="Completed reminders will appear here once you mark them as done."
              />
            ) : (
              <div className="space-y-4">
                {completedReminders.map((reminder, index) => (
                  <div
                    key={reminder.id}
                    className="animate-in fade-in-50 slide-in-from-bottom-4 duration-300"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <ReminderCard
                      reminder={reminder}
                      onEdit={handleEdit}
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4 animate-in fade-in-50 duration-300">
            {reminders && reminders.length > 0 ? (
              <Analytics reminders={reminders} />
            ) : (
              <EmptyState
                title="No data available"
                description="Create some reminders to see analytics and insights about your QA workflow."
                actionLabel="Create Reminder"
                onAction={() => setIsDialogOpen(true)}
              />
            )}
          </TabsContent>
        </Tabs>
      </main>

      <ReminderDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        reminder={editingReminder}
      />
    </div>
  );
}
