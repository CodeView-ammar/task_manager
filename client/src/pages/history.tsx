import { useState } from "react";
import { useI18n } from "@/hooks/use-i18n";
import { useQuery } from "@tanstack/react-query";
import { format, isEqual, parseISO } from "date-fns";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { TaskSheet } from "@/components/layout/task-sheet";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Search, BookOpen } from "lucide-react";
import { TaskSheet as TaskSheetType } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function History() {
  const { t } = useI18n();
  const [date, setDate] = useState<Date>(new Date());
  const [search, setSearch] = useState("");
  
  // Fetch task sheet history
  const { data: taskSheets, isLoading } = useQuery<TaskSheetType[]>({
    queryKey: ["/api/task-sheets"],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(queryKey[0] as string, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to fetch task sheets");
      }
      return res.json();
    },
  });
  
  const filteredTaskSheets = taskSheets?.filter(taskSheet => {
    const taskDate = parseISO(taskSheet.date.toString());
    const formattedDate = format(taskDate, "MMMM d, yyyy").toLowerCase();
    return formattedDate.includes(search.toLowerCase());
  });
  
  const handleDateClick = (taskSheetDate: Date) => {
    setDate(taskSheetDate);
  };
  
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 md:ml-14 lg:ml-64">
        <Header />
        <main className="container py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold gradient-heading">{t('history.title')}</h1>
              <p className="text-muted-foreground">{t('history.subtitle')}</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('history.calendar')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => {
                      if (newDate) {
                        setDate(newDate);
                      }
                    }}
                    className="task-date-picker"
                    modifiers={{
                      booked: taskSheets?.map(ts => new Date(ts.date)) || [],
                    }}
                    modifiersStyles={{
                      booked: {
                        fontWeight: "bold",
                        backgroundColor: "hsl(var(--primary) / 0.1)",
                        borderRadius: "0",
                      }
                    }}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    {t('history.taskSheetHistory')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder={t('history.searchByDate')}
                      className="pl-8"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                    {isLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : filteredTaskSheets && filteredTaskSheets.length > 0 ? (
                      filteredTaskSheets.map((taskSheet) => {
                        const taskDate = new Date(taskSheet.date);
                        const isSelected = isEqual(
                          new Date(taskDate).setHours(0, 0, 0, 0),
                          new Date(date).setHours(0, 0, 0, 0)
                        );
                        
                        return (
                          <div
                            key={taskSheet.id}
                            className={`p-3 rounded-md cursor-pointer transition-colors ${
                              isSelected 
                                ? "bg-primary text-primary-foreground" 
                                : "hover:bg-muted"
                            }`}
                            onClick={() => handleDateClick(taskDate)}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium">
                                {format(taskDate, "MMMM d, yyyy")}
                              </span>
                              <Badge variant={isSelected ? "outline" : "secondary"}>
                                {format(taskDate, "EEE")}
                              </Badge>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-center text-muted-foreground py-4">
                        {t('history.noTaskSheetsFound')}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {format(date, "EEEE, MMMM d, yyyy")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TaskSheet date={date} />
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
