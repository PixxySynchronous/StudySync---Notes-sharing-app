import { useState, useEffect } from "react";
import { Search, Filter, Eye, Share2, Tag, User, Trash2, UserX, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";

const NotesSharedByMe = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [sharedNotes, setSharedNotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [editPermissionDialogOpen, setEditPermissionDialogOpen] = useState(false);
  const [editingShare, setEditingShare] = useState<any>(null);
  const [newPermission, setNewPermission] = useState<'read' | 'edit'>('read');
  const [isUpdatingPermission, setIsUpdatingPermission] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchNotesSharedByMe();
  }, []);

  const fetchNotesSharedByMe = async () => {
    try {
      setIsLoading(true);
      // We need to create this endpoint in the backend
      const notesData = await apiClient.getNotesSharedByMe();
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

  const handleRevokeAccess = async (shareId: string, recipientName: string) => {
    try {
      await apiClient.removeShare(shareId);
      toast({
        title: "Access revoked",
        description: `Sharing access revoked from ${recipientName}`,
      });
      // Refresh the list
      fetchNotesSharedByMe();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to revoke access",
        variant: "destructive",
      });
    }
  };

  const handleEditPermission = (sharedNote: any) => {
    setEditingShare(sharedNote);
    setNewPermission(sharedNote.permission);
    setEditPermissionDialogOpen(true);
  };

  const handleUpdatePermission = async () => {
    if (!editingShare) return;

    try {
      setIsUpdatingPermission(true);
      await apiClient.updateSharePermission(editingShare._id, newPermission);
      toast({
        title: "Permission updated",
        description: `Permission changed to ${newPermission === 'edit' ? 'Can Edit' : 'Read Only'}`,
      });
      setEditPermissionDialogOpen(false);
      // Refresh the list
      fetchNotesSharedByMe();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update permission",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingPermission(false);
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
                         note.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         sharedNote.sharedWith?.name?.toLowerCase().includes(searchQuery.toLowerCase());
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
          <h1 className="text-3xl font-bold">Notes Shared By Me</h1>
          <p className="text-muted-foreground mt-1">
            Manage notes you have shared with other users
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search shared notes or recipients..."
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
                      Shared with {sharedNote.sharedWith?.name || "Unknown"}
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
                      <AvatarImage src={sharedNote.sharedWith?.avatar} />
                      <AvatarFallback className="text-xs">
                        {sharedNote.sharedWith?.name?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">
                      {sharedNote.permission === 'edit' ? 'Can edit' : 'Read only'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleEditPermission(sharedNote)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Revoke Access</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to revoke access for "{sharedNote.sharedWith?.name}" 
                            to the note "{sharedNote.note?.title}"? They will no longer be able to view or edit this note.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRevokeAccess(sharedNote._id, sharedNote.sharedWith?.name)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Revoke Access
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
              : "You haven't shared any notes yet."
            }
          </p>
        </div>
      )}

      {/* Edit Permission Dialog */}
      <Dialog open={editPermissionDialogOpen} onOpenChange={setEditPermissionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Permission</DialogTitle>
            <DialogDescription>
              Change the permission level for "{editingShare?.sharedWith?.name}" on the note "{editingShare?.note?.title}".
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="permission">Permission Level</Label>
              <Select value={newPermission} onValueChange={(value: 'read' | 'edit') => setNewPermission(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="read">Read Only</SelectItem>
                  <SelectItem value="edit">Can Edit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setEditPermissionDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdatePermission} disabled={isUpdatingPermission}>
                {isUpdatingPermission ? "Updating..." : "Update Permission"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotesSharedByMe;