import React from "react";
import { Link, useLocation } from "wouter";
import { useGetCurrentUser, useLogout, getGetCurrentUserQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Navigation, LogOut, User, LayoutDashboard, Brain, BookOpen, Settings } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useGetCurrentUser({
    query: {
      queryKey: getGetCurrentUserQueryKey(),
      retry: false, // Don't retry if not logged in
    }
  });

  const logout = useLogout({
    mutation: {
      onSuccess: () => {
        queryClient.clear();
        setLocation("/");
      }
    }
  });

  const isPublicPage = location === "/" || location === "/login" || location === "/register";

  return (
    <div className="min-h-[100dvh] flex flex-col w-full">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto h-16 flex items-center justify-between px-4 md:px-8">
          <Link href={user ? (user.role === "admin" ? "/admin" : "/dashboard") : "/"} className="flex items-center gap-2 group">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg group-hover:scale-105 transition-transform">
              <Navigation className="w-5 h-5" />
            </div>
            <span className="font-heading font-bold tracking-tight text-lg">CareerPathr</span>
          </Link>
          
          <div className="flex items-center gap-4">
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            ) : user ? (
              <>
                <nav className="hidden md:flex items-center gap-6 mr-4 text-sm font-medium">
                  {user.role === 'admin' ? (
                    <>
                      <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors">Admin Dashboard</Link>
                      <Link href="/admin/users" className="text-muted-foreground hover:text-foreground transition-colors">Users</Link>
                      <Link href="/admin/careers" className="text-muted-foreground hover:text-foreground transition-colors">Careers</Link>
                      <Link href="/admin/questions" className="text-muted-foreground hover:text-foreground transition-colors">Questions</Link>
                      <Link href="/admin/courses" className="text-muted-foreground hover:text-foreground transition-colors">Courses</Link>
                    </>
                  ) : (
                    <>
                      <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"><LayoutDashboard className="w-4 h-4"/> Dashboard</Link>
                      <Link href="/careers" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"><BookOpen className="w-4 h-4"/> Explore Careers</Link>
                      <Link href="/assessment" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"><Brain className="w-4 h-4"/> Assessment</Link>
                    </>
                  )}
                </nav>
                <div className="h-6 w-px bg-border hidden md:block"></div>
                
                {user.role !== 'admin' && (
                  <Button variant="ghost" size="icon" onClick={() => setLocation('/profile')} className="rounded-full">
                    <User className="w-5 h-5" />
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => logout.mutate()} className="hidden md:flex gap-2">
                  <LogOut className="w-4 h-4" />
                  Log out
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild>
                  <Link href="/login">Log in</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Sign up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}
