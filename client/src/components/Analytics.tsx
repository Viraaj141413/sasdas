import { type Reminder } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { CheckCircle, Clock, AlertCircle, TrendingUp } from "lucide-react";

interface AnalyticsProps {
  reminders: Reminder[];
}

export function Analytics({ reminders }: AnalyticsProps) {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const totalReminders = reminders.length;
  const sentReminders = reminders.filter(r => r.status === "sent").length;
  const failedReminders = reminders.filter(r => r.status === "failed").length;
  const pendingReminders = reminders.filter(r => r.status === "pending" && !r.completed).length;
  const upcomingReminders = reminders.filter(r => !r.completed && new Date(r.scheduledFor) > now).length;
  
  const sentThisWeek = reminders.filter(r => 
    r.status === "sent" && new Date(r.scheduledFor) >= oneWeekAgo
  ).length;
  
  const sentThisMonth = reminders.filter(r => 
    r.status === "sent" && new Date(r.scheduledFor) >= oneMonthAgo
  ).length;

  const successRate = totalReminders > 0 
    ? ((sentReminders / totalReminders) * 100).toFixed(1) 
    : "0";

  const statusData = [
    { name: "Sent", value: sentReminders, color: "#3b82f6" },
    { name: "Pending", value: pendingReminders, color: "#a855f7" },
    { name: "Failed", value: failedReminders, color: "#ef4444" },
  ].filter(item => item.value > 0);

  const stats = [
    {
      title: "Total Reminders",
      value: totalReminders,
      icon: TrendingUp,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-950",
    },
    {
      title: "Successfully Sent",
      value: sentReminders,
      icon: CheckCircle,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-950",
    },
    {
      title: "Pending",
      value: pendingReminders,
      icon: Clock,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-950",
    },
    {
      title: "Failed",
      value: failedReminders,
      icon: AlertCircle,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-100 dark:bg-red-950",
    },
  ];

  const weeklyData = [
    { name: "This Week", sent: sentThisWeek },
    { name: "This Month", sent: sentThisMonth },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Reminder Status Distribution</CardTitle>
            <CardDescription>Overview of all reminders by status</CardDescription>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reminders Sent Over Time</CardTitle>
            <CardDescription>SMS notifications sent this week and month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sent" fill="#3b82f6" name="Reminders Sent" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Key performance indicators for your reminder system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Success Rate</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-green-600 dark:text-green-400">{successRate}%</span>
                <span className="text-sm text-muted-foreground">({sentReminders}/{totalReminders})</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Upcoming Reminders</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">{upcomingReminders}</span>
                <span className="text-sm text-muted-foreground">scheduled</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Sent This Week</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-purple-600 dark:text-purple-400">{sentThisWeek}</span>
                <span className="text-sm text-muted-foreground">notifications</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
