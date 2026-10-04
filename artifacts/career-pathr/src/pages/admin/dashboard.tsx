import React from "react";
import { Link } from "wouter";
import { useGetAdminStats, getGetAdminStatsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, HelpCircle, BookOpen, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useGetAdminStats({
    query: { queryKey: getGetAdminStatsQueryKey() }
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-48 mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!stats) return <div className="p-8">Stats unavailable</div>;

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-3xl font-heading font-bold">Admin Mission Control</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard title="Total Students" value={stats.totalStudents} icon={Users} />
        <StatCard title="Total Careers" value={stats.totalCareers} icon={Briefcase} />
        <StatCard title="Total Questions" value={stats.totalQuestions} icon={HelpCircle} />
        <StatCard title="Total Courses" value={stats.totalCourses} icon={BookOpen} />
        <StatCard title="Assessments Done" value={stats.assessmentsCompleted} icon={BarChart3} />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2 shadow-sm border-muted-foreground/20">
          <CardHeader>
            <CardTitle>Top Careers by Student Match</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            {stats.topCareersByInterest && stats.topCareersByInterest.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topCareersByInterest} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="careerTitle" 
                    angle={-45} 
                    textAnchor="end" 
                    height={80} 
                    interval={0}
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">No data available yet</div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="font-heading font-semibold text-xl mb-2">Quick Navigation</h2>
          <Link href="/admin/careers">
            <Card className="hover:border-primary cursor-pointer transition-colors">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-lg text-primary"><Briefcase className="w-5 h-5"/></div>
                <div className="font-medium">Manage Careers</div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/questions">
            <Card className="hover:border-primary cursor-pointer transition-colors">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="bg-amber-500/10 p-3 rounded-lg text-amber-600"><HelpCircle className="w-5 h-5"/></div>
                <div className="font-medium">Manage Questions</div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/courses">
            <Card className="hover:border-primary cursor-pointer transition-colors">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="bg-green-500/10 p-3 rounded-lg text-green-600"><BookOpen className="w-5 h-5"/></div>
                <div className="font-medium">Manage Courses</div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon }: { title: string, value: number, icon: any }) {
  return (
    <Card className="shadow-sm border-muted-foreground/20">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-2">
          <div className="text-sm font-medium text-muted-foreground">{title}</div>
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="text-3xl font-bold font-mono">{value}</div>
      </CardContent>
    </Card>
  );
}
