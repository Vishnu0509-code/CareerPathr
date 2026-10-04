import React from "react";
import { Link, useParams } from "wouter";
import { useGetCareer, getGetCareerQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Briefcase, TrendingUp, DollarSign, Clock, CheckCircle2, PlayCircle, Map, Award } from "lucide-react";
import { getCategoryColor } from "@/lib/colors";
import { Skeleton } from "@/components/ui/skeleton";
import { CourseType } from "@workspace/api-client-react";

export default function CareerDetail() {
  const { id } = useParams();
  const careerId = parseInt(id || "0", 10);

  const { data: career, isLoading } = useGetCareer(careerId, {
    query: { enabled: !!careerId, queryKey: getGetCareerQueryKey(careerId) }
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-8 max-w-4xl">
        <Skeleton className="h-10 w-48 mb-8" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!career) return <div className="p-8 text-center">Career not found.</div>;

  const colorClass = getCategoryColor(career.category);

  return (
    <div className="container mx-auto p-6 md:p-8 max-w-5xl space-y-8">
      <Button variant="ghost" className="mb-2 -ml-4 text-muted-foreground" asChild>
        <Link href="/careers"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Directory</Link>
      </Button>

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl border bg-card p-8 md:p-12 shadow-sm">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Briefcase className="w-64 h-64" />
        </div>
        
        <div className="relative z-10 max-w-3xl">
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-4 ${colorClass}`}>
            {career.category}
          </span>
          <h1 className="text-4xl md:text-5xl font-heading font-extrabold tracking-tight mb-4">{career.title}</h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            {career.description}
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-primary/5 border-primary/10">
          <CardContent className="p-6 flex items-start gap-4">
            <DollarSign className="w-8 h-8 text-primary shrink-0" />
            <div>
              <div className="text-sm font-medium text-muted-foreground">Avg Salary</div>
              <div className="text-xl font-mono font-bold mt-1">{career.avgSalary}</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
          <CardContent className="p-6 flex items-start gap-4">
            <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-500 shrink-0" />
            <div>
              <div className="text-sm font-medium text-muted-foreground">Job Growth</div>
              <div className="text-xl font-bold mt-1 text-green-700 dark:text-green-400">+{career.growthRate}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-start gap-4">
            <Clock className="w-8 h-8 text-amber-500 shrink-0" />
            <div>
              <div className="text-sm font-medium text-muted-foreground">Learning Time</div>
              <div className="text-xl font-bold mt-1">{career.learningTimeMonths} Months</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
             <Button className="w-full h-full text-base font-semibold py-4" asChild>
                <Link href={`/recommendations/${career.id}/skill-gap`}>Analyze My Gap</Link>
             </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-8">
          
          <section>
            <h2 className="text-2xl font-heading font-bold mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-primary" /> Core Skills Required
            </h2>
            <div className="flex flex-wrap gap-2">
              {career.requiredSkills.map(skill => (
                <Badge key={skill} variant="outline" className="text-sm py-1.5 px-4 bg-card shadow-sm border-muted-foreground/20">
                  {skill}
                </Badge>
              ))}
            </div>
          </section>

          <section className="bg-muted/30 p-6 rounded-2xl border">
            <h2 className="text-2xl font-heading font-bold mb-4">Future Opportunities</h2>
            <p className="text-muted-foreground leading-relaxed">{career.futureOpportunities}</p>
          </section>

          <section>
            <h2 className="text-2xl font-heading font-bold mb-4">Common Job Roles</h2>
            <ul className="grid sm:grid-cols-2 gap-3">
              {career.jobRoles?.map(role => (
                <li key={role} className="flex items-center gap-2 bg-card border p-3 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  <span className="font-medium text-sm">{role}</span>
                </li>
              ))}
            </ul>
          </section>

        </div>

        {/* Sidebar: Courses */}
        <div className="space-y-6">
          <h2 className="text-2xl font-heading font-bold">Recommended Learning</h2>
          {career.courses && career.courses.length > 0 ? (
            <div className="space-y-4">
              {career.courses.map(course => (
                <Card key={course.id} className="shadow-sm">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between mb-1">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground flex items-center gap-1">
                        {course.type === 'course' ? <PlayCircle className="w-3 h-3"/> : 
                         course.type === 'certification' ? <Award className="w-3 h-3"/> : 
                         <Map className="w-3 h-3"/>}
                        {course.type}
                      </span>
                      <span className="text-[10px] font-mono bg-muted px-1.5 rounded">{course.level}</span>
                    </div>
                    <CardTitle className="text-base line-clamp-2 leading-tight">{course.title}</CardTitle>
                    <CardDescription className="text-xs mt-1">{course.provider}</CardDescription>
                  </CardHeader>
                  <CardFooter className="p-4 pt-0">
                    <Button variant="link" className="px-0 h-auto text-sm text-primary" asChild>
                      <a href={course.url} target="_blank" rel="noopener noreferrer">Start Learning</a>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
             <div className="text-sm text-muted-foreground italic bg-muted p-4 rounded-lg">
               No specific courses mapped yet. Use the skill gap analysis to find custom recommendations.
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
