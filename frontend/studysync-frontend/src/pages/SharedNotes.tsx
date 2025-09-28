import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, Eye, Share2, Tag, User, Edit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";

const SharedNotes = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [sharedNotes, setSharedNotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [allTags, setAllTags] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchSharedNotes();
  }, []);

  const fetchSharedNotes = async () => {
    try {
      setIsLoading(true);
      const notesData = await apiClient.getSharedNotes();
      setSharedNotes(notesData);
      
      // Extract unique tags
      const tags = new Set<string>();
      notesData.forEach((sharedNote: any) => {
        sharedNote.note?.tags?.forEach((tag: string) => tags.add(tag));
      });
      setAllTags(["all", ...Array.from(tags)]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch shared notes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  // Filter notes by selected tag and search query
  const filteredNotes = sharedNotes.filter((sharedNote: any) => {
    const note = sharedNote.note;
    if (!note) return false;
    
    const matchesSearch = note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.content?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === "all" || note.tags?.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Shared Notes</h1>
          <p className="text-muted-foreground mt-1">
            Notes that have been shared with you by other users
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search shared notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              {selectedTag === "all" ? "All Tags" : selectedTag}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {allTags.map((tag) => (
              <DropdownMenuItem
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={selectedTag === tag ? "bg-muted" : ""}
              >
                <Tag className="h-4 w-4 mr-2" />
                {tag === "all" ? "All Tags" : tag}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Shared Notes Grid */}
      {filteredNotes.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.map((sharedNote: any) => (
            <Card key={sharedNote._id} className="card-elevated hover:shadow-xl transition-all duration-300 group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                      {sharedNote.note?.title || "Untitled"}
                    </CardTitle>
                    <CardDescription className="mt-1 flex items-center gap-2">
                      <User className="h-3 w-3" />
                      Shared by {sharedNote.sharedBy?.name || "Unknown"}
                      <span className="mx-1">•</span>
                      {formatDate(sharedNote.createdAt)}
                    </CardDescription>
                  </div>
                  <Share2 className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {sharedNote.note?.content || "No content available"}
                </p>
                
                {sharedNote.note?.tags && sharedNote.note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {sharedNote.note.tags.slice(0, 3).map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {sharedNote.note.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{sharedNote.note.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={sharedNote.sharedBy?.avatar} />
                      <AvatarFallback className="text-xs">
                        {sharedNote.sharedBy?.name?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">
                      {sharedNote.permission === 'edit' ? 'Can edit' : 'Read only'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {sharedNote.permission === 'edit' && (
                      <Link to={`/edit-note/${sharedNote.note?._id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Share2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No shared notes found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || selectedTag !== "all" 
              ? "Try adjusting your search or filter criteria."
              : "No notes have been shared with you yet."
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default SharedNotes;
