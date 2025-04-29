import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useI18n } from "@/hooks/use-i18n";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Save, Trash2, Clock } from "lucide-react";
import { Priority, Todo, Note, Learning, Reminder, CompleteTaskSheet } from "@shared/schema";
import { Loader2 } from "lucide-react";

interface TaskSheetProps {
  date: Date;
}

export function TaskSheet({ date }: TaskSheetProps) {
  const { t } = useI18n();
  const { toast } = useToast();
  const [newTodo, setNewTodo] = useState("");
  const [newPriority, setNewPriority] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [learningContent, setLearningContent] = useState("");
  const [newReminder, setNewReminder] = useState("");
  const [reminderTime, setReminderTime] = useState("");
  
  // Format date for API
  const formattedDate = format(date, "yyyy-MM-dd");
  
  // Fetch task sheet
  const { data: taskSheet, isLoading } = useQuery<CompleteTaskSheet>({
    queryKey: ["/api/task-sheets", formattedDate],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(`/api/task-sheets/${queryKey[1]}`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to fetch task sheet");
      }
      return res.json();
    },
  });
  
  // Add Priority Mutation
  const addPriorityMutation = useMutation({
    mutationFn: async (priority: { title: string; taskSheetId: number; order: number }) => {
      const res = await apiRequest("POST", "/api/priorities", priority);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/task-sheets", formattedDate] });
      setNewPriority("");
      toast({
        title: t("taskSheet.priorityAdded"),
        description: t("taskSheet.priorityAddedDescription"),
      });
    },
  });
  
  // Toggle Priority Completion Mutation
  const togglePriorityMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: number; completed: boolean }) => {
      const res = await apiRequest("PATCH", `/api/priorities/${id}`, { completed });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/task-sheets", formattedDate] });
    },
  });
  
  // Add Todo Mutation
  const addTodoMutation = useMutation({
    mutationFn: async (todo: { title: string; taskSheetId: number }) => {
      const res = await apiRequest("POST", "/api/todos", todo);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/task-sheets", formattedDate] });
      setNewTodo("");
    },
  });
  
  // Toggle Todo Completion Mutation
  const toggleTodoMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: number; completed: boolean }) => {
      const res = await apiRequest("PATCH", `/api/todos/${id}`, { completed });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/task-sheets", formattedDate] });
    },
  });
  
  // Delete Todo Mutation
  const deleteTodoMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/todos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/task-sheets", formattedDate] });
    },
  });
  
  // Update Note Mutation
  const updateNoteMutation = useMutation({
    mutationFn: async ({ id, content }: { id?: number; content: string }) => {
      if (id) {
        const res = await apiRequest("PATCH", `/api/notes/${id}`, { content });
        return res.json();
      } else {
        const res = await apiRequest("POST", "/api/notes", { 
          content, 
          taskSheetId: taskSheet?.id 
        });
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/task-sheets", formattedDate] });
      toast({
        title: t("taskSheet.notesSaved"),
        description: t("taskSheet.notesSavedDescription"),
      });
    },
  });
  
  // Update Learning Mutation
  const updateLearningMutation = useMutation({
    mutationFn: async ({ id, content }: { id?: number; content: string }) => {
      if (id) {
        const res = await apiRequest("PATCH", `/api/learnings/${id}`, { content });
        return res.json();
      } else {
        const res = await apiRequest("POST", "/api/learnings", { 
          content, 
          taskSheetId: taskSheet?.id 
        });
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/task-sheets", formattedDate] });
      toast({
        title: t("taskSheet.learningSaved"),
        description: t("taskSheet.learningSavedDescription"),
      });
    },
  });
  
  // Add Reminder Mutation
  const addReminderMutation = useMutation({
    mutationFn: async (reminder: { content: string; time?: string; taskSheetId: number }) => {
      const res = await apiRequest("POST", "/api/reminders", reminder);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/task-sheets", formattedDate] });
      setNewReminder("");
      setReminderTime("");
    },
  });
  
  // Delete Reminder Mutation
  const deleteReminderMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/reminders/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/task-sheets", formattedDate] });
    },
  });
  
  const handleAddPriority = () => {
    if (!newPriority.trim() || !taskSheet) return;
    
    const prioritiesCount = taskSheet.priorities.length;
    if (prioritiesCount >= 3) {
      toast({
        title: t("taskSheet.tooManyPriorities"),
        description: t("taskSheet.maxThreePriorities"),
        variant: "destructive",
      });
      return;
    }
    
    addPriorityMutation.mutate({
      title: newPriority,
      taskSheetId: taskSheet.id,
      order: prioritiesCount,
    });
  };
  
  const handleTogglePriority = (priority: Priority) => {
    togglePriorityMutation.mutate({
      id: priority.id,
      completed: !priority.completed,
    });
  };
  
  const handleAddTodo = () => {
    if (!newTodo.trim() || !taskSheet) return;
    
    addTodoMutation.mutate({
      title: newTodo,
      taskSheetId: taskSheet.id,
    });
  };
  
  const handleToggleTodo = (todo: Todo) => {
    toggleTodoMutation.mutate({
      id: todo.id,
      completed: !todo.completed,
    });
  };
  
  const handleDeleteTodo = (id: number) => {
    deleteTodoMutation.mutate(id);
  };
  
  const handleSaveNote = () => {
    if (!taskSheet) return;
    
    const note = taskSheet.notes[0];
    updateNoteMutation.mutate({
      id: note?.id,
      content: noteContent || note?.content || "",
    });
  };
  
  const handleSaveLearning = () => {
    if (!taskSheet) return;
    
    const learning = taskSheet.learnings[0];
    updateLearningMutation.mutate({
      id: learning?.id,
      content: learningContent || learning?.content || "",
    });
  };
  
  const handleAddReminder = () => {
    if (!newReminder.trim() || !taskSheet) return;
    
    addReminderMutation.mutate({
      content: newReminder,
      time: reminderTime || undefined,
      taskSheetId: taskSheet.id,
    });
  };
  
  const handleDeleteReminder = (id: number) => {
    deleteReminderMutation.mutate(id);
  };
  
  // Set initial values for note and learning when data is loaded
  useState(() => {
    if (taskSheet) {
      const note = taskSheet.notes[0];
      if (note && note.content && !noteContent) {
        setNoteContent(note.content);
      }
      
      const learning = taskSheet.learnings[0];
      if (learning && learning.content && !learningContent) {
        setLearningContent(learning.content);
      }
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!taskSheet) {
    return (
      <div className="text-center py-8">
        <p>{t("taskSheet.errorLoading")}</p>
      </div>
    );
  }

  return (
    <div className="task-sheet-container">
      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="tasks">{t("taskSheet.tasks")}</TabsTrigger>
          <TabsTrigger value="priorities">{t("taskSheet.priorities")}</TabsTrigger>
          <TabsTrigger value="notes">{t("taskSheet.notes")}</TabsTrigger>
          <TabsTrigger value="learning">{t("taskSheet.learning")}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("taskSheet.toDoList")}</CardTitle>
              <CardDescription>{t("taskSheet.toDoDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder={t("taskSheet.newTaskPlaceholder")}
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddTodo()}
                />
                <Button onClick={handleAddTodo} disabled={addTodoMutation.isPending}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t("taskSheet.add")}
                </Button>
              </div>
              
              <div className="space-y-2">
                {taskSheet.todos.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2 text-center">
                    {t("taskSheet.noTasks")}
                  </p>
                ) : (
                  taskSheet.todos.map((todo) => (
                    <div key={todo.id} className="flex items-center justify-between py-2 border-b">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id={`todo-${todo.id}`} 
                          checked={todo.completed}
                          onCheckedChange={() => handleToggleTodo(todo)}
                        />
                        <Label 
                          htmlFor={`todo-${todo.id}`}
                          className={todo.completed ? "line-through text-muted-foreground" : ""}
                        >
                          {todo.title}
                        </Label>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeleteTodo(todo.id)}
                        disabled={deleteTodoMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{t("taskSheet.reminders")}</CardTitle>
              <CardDescription>{t("taskSheet.remindersDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="grid w-full gap-2">
                  <Input
                    placeholder={t("taskSheet.reminderContentPlaceholder")}
                    value={newReminder}
                    onChange={(e) => setNewReminder(e.target.value)}
                  />
                  <Input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                  />
                </div>
                <Button onClick={handleAddReminder} disabled={addReminderMutation.isPending}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t("taskSheet.add")}
                </Button>
              </div>
              
              <div className="space-y-2">
                {taskSheet.reminders.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2 text-center">
                    {t("taskSheet.noReminders")}
                  </p>
                ) : (
                  taskSheet.reminders.map((reminder) => (
                    <div key={reminder.id} className="flex items-center justify-between py-2 border-b">
                      <div className="flex items-center">
                        <div>
                          <p className="font-medium">{reminder.content}</p>
                          {reminder.time && (
                            <p className="text-xs text-muted-foreground flex items-center mt-1">
                              <Clock className="h-3 w-3 mr-1" />
                              {reminder.time}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeleteReminder(reminder.id)}
                        disabled={deleteReminderMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="priorities">
          <Card>
            <CardHeader>
              <CardTitle>{t("taskSheet.topPriorities")}</CardTitle>
              <CardDescription>{t("taskSheet.prioritiesDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder={t("taskSheet.newPriorityPlaceholder")}
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddPriority()}
                />
                <Button onClick={handleAddPriority} disabled={addPriorityMutation.isPending}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t("taskSheet.add")}
                </Button>
              </div>
              
              <div className="space-y-4">
                {taskSheet.priorities.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2 text-center">
                    {t("taskSheet.noPriorities")}
                  </p>
                ) : (
                  taskSheet.priorities.map((priority, index) => (
                    <div 
                      key={priority.id} 
                      className={`p-4 border rounded-md ${
                        priority.completed ? "opacity-70 bg-muted" : "border-primary"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{index + 1}</Badge>
                        <div className="flex-1">
                          <h4 className={`font-medium ${priority.completed ? "line-through" : ""}`}>
                            {priority.title}
                          </h4>
                        </div>
                        <Checkbox 
                          id={`priority-${priority.id}`} 
                          checked={priority.completed}
                          onCheckedChange={() => handleTogglePriority(priority)}
                        />
                      </div>
                    </div>
                  ))
                )}
                
                {taskSheet.priorities.length > 0 && taskSheet.priorities.length < 3 && (
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    {t("taskSheet.prioritiesRemaining", { count: 3 - taskSheet.priorities.length })}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>{t("taskSheet.notes")}</CardTitle>
              <CardDescription>{t("taskSheet.notesDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder={t("taskSheet.notesPlaceholder")}
                className="min-h-[200px]"
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
              />
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleSaveNote} 
                disabled={updateNoteMutation.isPending}
                className="ml-auto"
              >
                <Save className="h-4 w-4 mr-2" />
                {t("taskSheet.save")}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="learning">
          <Card>
            <CardHeader>
              <CardTitle>{t("taskSheet.dailyLearning")}</CardTitle>
              <CardDescription>{t("taskSheet.learningDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder={t("taskSheet.learningPlaceholder")}
                className="min-h-[200px]"
                value={learningContent}
                onChange={(e) => setLearningContent(e.target.value)}
              />
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleSaveLearning} 
                disabled={updateLearningMutation.isPending}
                className="ml-auto"
              >
                <Save className="h-4 w-4 mr-2" />
                {t("taskSheet.save")}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
