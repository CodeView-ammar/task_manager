import { useState } from "react";
import { useI18n } from "@/hooks/use-i18n";
import { format } from "date-fns";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { TaskSheet } from "@/components/layout/task-sheet";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarIcon, LayoutDashboard } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function Dashboard() {
  const { t } = useI18n();
  const [date, setDate] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 md:ml-14 lg:ml-64">
        <Header />
        <main className="container py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold gradient-heading">{t('dashboard.title')}</h1>
              <p className="text-muted-foreground">{t('dashboard.subtitle')}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" className="hidden md:flex">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                {t('dashboard.viewMode')}
              </Button>
              
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-[240px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(date, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => {
                      if (newDate) {
                        setDate(newDate);
                        setCalendarOpen(false);
                      }
                    }}
                    initialFocus
                    className="task-date-picker"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <Card className="mb-6">
            <CardContent className="p-6">
              <TaskSheet date={date} />
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
