import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { AppShell } from '@/components/layout/AppShell';

import Home from '@/pages/home';
import Login from '@/pages/auth/login';
import Register from '@/pages/auth/register';
import ForgotPassword from '@/pages/auth/forgot-password';

import StudentDashboard from '@/pages/student/dashboard';
import Assessment from '@/pages/student/assessment';
import Recommendations from '@/pages/student/recommendations';
import SkillGap from '@/pages/student/skill-gap';
import CareerList from '@/pages/student/careers';
import CareerDetail from '@/pages/student/career-detail';
import Profile from '@/pages/student/profile';

import AdminDashboard from '@/pages/admin/dashboard';
import AdminUsers from '@/pages/admin/users';
import AdminCareers from '@/pages/admin/careers';
import AdminQuestions from '@/pages/admin/questions';
import AdminCourses from '@/pages/admin/courses';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Keep recently loaded data while users move between pages.
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <AppShell>
      <Switch>
        {/* Public / Auth */}
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/forgot-password" component={ForgotPassword} />

        {/* Student */}
        <Route path="/dashboard" component={StudentDashboard} />
        <Route path="/assessment" component={Assessment} />
        <Route path="/recommendations" component={Recommendations} />
        <Route path="/recommendations/:careerId/skill-gap" component={SkillGap} />
        <Route path="/careers" component={CareerList} />
        <Route path="/careers/:id" component={CareerDetail} />
        <Route path="/profile" component={Profile} />

        {/* Admin */}
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/users" component={AdminUsers} />
        <Route path="/admin/careers" component={AdminCareers} />
        <Route path="/admin/questions" component={AdminQuestions} />
        <Route path="/admin/courses" component={AdminCourses} />

        <Route component={NotFound} />
      </Switch>
    </AppShell>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
