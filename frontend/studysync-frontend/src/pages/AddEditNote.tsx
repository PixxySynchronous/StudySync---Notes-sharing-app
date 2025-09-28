import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save, Tag, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";

const AddEditNote = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = Boolean(id);

  const [isLoading, setIsLoading] = useState(false);
  const [noteData, setNoteData] = useState({
    title: "",
    content: "",
    tags: [] as string[],
  });
  const [newTag, setNewTag] = useState("");

  // Load existing note data if editing
  useEffect(() => {
    const loadNote = async () => {
      if (isEditing && id) {
        try {
          setIsLoading(true);
          const note = await apiClient.getNote(id);
          setNoteData({
            title: note.title || "",
            content: note.content || "",
            tags: note.tags || [],
          });
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to load note",
            variant: "destructive",
          });
          navigate("/my-notes");
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadNote();
  }, [isEditing, id, navigate, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNoteData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !noteData.tags.includes(newTag.trim())) {
      setNoteData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNoteData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Basic validation
    if (!noteData.title.trim() || !noteData.content.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in both title and content.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      if (isEditing && id) {
        // Update existing note
        await apiClient.updateNote(id, noteData.title, noteData.content, noteData.tags);
        toast({
          title: "Note updated",
          description: "Your note has been updated successfully.",
        });
      } else {
        // Create new note
        await apiClient.createNote(noteData.title, noteData.content, noteData.tags);
        toast({
          title: "Note created",
          description: "Your note has been created successfully.",
        });
      }
      navigate("/my-notes");
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} note`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/my-notes">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">
            {isEditing ? "Edit Note" : "Create New Note"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEditing ? "Update your study note" : "Add a new study note to your collection"}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle>Note Details</CardTitle>
              <CardDescription>
                Fill in the information for your study note
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    type="text"
                    placeholder="Enter note title..."
                    value={noteData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <Label htmlFor="content">Content *</Label>
                  <Textarea
                    id="content"
                    name="content"
                    placeholder="Write your note content here..."
                    value={noteData.content}
                    onChange={handleInputChange}
                    className="min-h-[400px] resize-y"
                    required
                  />
                </div>

                {/* Tags */}
                <div className="space-y-3">
                  <Label htmlFor="tags">Tags</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="tags"
                        type="text"
                        placeholder="Add a tag..."
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="pl-10"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddTag}
                      disabled={!newTag.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {noteData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {noteData.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="gap-1">
                          {tag}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-3 w-3 hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => handleRemoveTag(tag)}
                          >
                            <X className="h-2 w-2" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    className="btn-gradient gap-2"
                    disabled={isLoading}
                  >
                    <Save className="h-4 w-4" />
                    {isLoading 
                      ? (isEditing ? "Updating..." : "Creating...") 
                      : (isEditing ? "Update Note" : "Create Note")
                    }
                  </Button>
                  <Link to="/my-notes">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Writing Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <h4 className="font-medium mb-1">📝 Structure Your Notes</h4>
                <p className="text-muted-foreground">Use headings, bullet points, and numbered lists for better organization.</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">🏷️ Use Relevant Tags</h4>
                <p className="text-muted-foreground">Tags help you find and organize your notes quickly.</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">🔍 Be Descriptive</h4>
                <p className="text-muted-foreground">Clear titles and detailed content make notes more useful.</p>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          {noteData.title && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h3 className="font-semibold line-clamp-2">{noteData.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {noteData.content}
                  </p>
                  {noteData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {noteData.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {noteData.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{noteData.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddEditNote;