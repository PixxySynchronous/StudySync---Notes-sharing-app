import { useEffect, useState } from "react";
import { FileText, Share2, Users, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient } from "@/lib/api";

const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [recentNotes, setRecentNotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [dashboardStats, notes] = await Promise.all([
          apiClient.getDashboardStats(),
          apiClient.getNotes()
        ]);
        
        setStats(dashboardStats);
        // Get the 5 most recent notes
        const sortedNotes = notes
          .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 5);
        setRecentNotes(sortedNotes);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const statsCards = [
    {
      title: "My Notes",
      value: stats?.totalNotes?.toString() || "0",
      description: "Total notes created",
      icon: FileText,
      trend: "+3 this week",
      link: "/my-notes",
    },
    {
      title: "Shared Notes",
      value: stats?.sharedNotes?.toString() || "0",
      description: "Notes shared with you",
      icon: Share2,
      trend: "+2 new",
      link: "/shared-notes",
    },
    {
      title: "Notes Shared By Me",
      value: stats?.notesSharedByUser?.toString() || "0",
      description: "Notes you've shared",
      icon: Users,
      trend: "+1 this month",
      link: "/notes-shared-by-me",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome back!</h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your studies today.
          </p>
        </div>
        <Link to="/add-note">
          <Button className="btn-gradient gap-2">
            <Plus className="h-4 w-4" />
            New Note
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {statsCards.map((stat) => (
          <Link key={stat.title} to={stat.link} className="group">
            <Card className="card-elevated hover:shadow-xl transition-all duration-300 cursor-pointer group-hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium group-hover:text-primary transition-colors">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold group-hover:text-primary transition-colors">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
                <p className="text-xs text-primary font-medium mt-1">
                  {stat.trend}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Notes */}
      <Card className="card-elevated">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Notes</CardTitle>
              <CardDescription>
                Your latest study materials and notes
              </CardDescription>
            </div>
            <Link to="/my-notes">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentNotes.map((note) => (
              <Link key={note.id || note._id} to={`/edit-note/${note._id}`} className="block">
                <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 hover:border-primary/50 transition-all cursor-pointer group">
                  <div className="flex-1">
                    <h3 className="font-medium group-hover:text-primary transition-colors">{note.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {note.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs rounded-md bg-primary/10 text-primary"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link to="/add-note">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-dashed border-2 border-muted-foreground/25 hover:border-primary/50">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <Plus className="h-8 w-8 text-muted-foreground mb-2" />
              <h3 className="font-medium">Create New Note</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Start writing your next study note
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/shared-notes">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <Share2 className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-medium">Browse Shared Notes</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Explore notes shared by others
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/profile">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <Users className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-medium">Manage Profile</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Update your account settings
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;