import { useI18n } from "@/hooks/use-i18n";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckSquare, Calendar, User } from "lucide-react";

export function Sidebar() {
  const { t } = useI18n();
  const [location] = useLocation();

  const navItems = [
    {
      href: "/",
      label: t('nav.todayTasks'),
      icon: CheckSquare,
      active: location === "/"
    },
    {
      href: "/history",
      label: t('nav.history'),
      icon: Calendar,
      active: location === "/history"
    },
    {
      href: "/profile",
      label: t('nav.profile'),
      icon: User,
      active: location === "/profile"
    }
  ];

  return (
    <aside className="hidden md:flex h-screen w-14 lg:w-64 flex-col bg-sidebar border-r border-sidebar-border fixed left-0 top-0 z-30">
      <div className="flex h-16 items-center border-b border-sidebar-border px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-sidebar-foreground">
          <CheckSquare className="h-6 w-6 text-sidebar-primary" />
          <span className="hidden lg:inline">{t('app.title')}</span>
        </Link>
      </div>
      <nav className="flex-1 overflow-auto py-6 px-2">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    item.active ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""
                  )}
                >
                  <item.icon className="h-5 w-5 lg:mr-2" />
                  <span className="hidden lg:inline">{item.label}</span>
                </Button>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto p-4 border-t border-sidebar-border">
        <div className="text-center text-xs text-sidebar-foreground opacity-70 hidden lg:block">
          &copy; {new Date().getFullYear()} {t('app.copyright')}
        </div>
      </div>
    </aside>
  );
}
