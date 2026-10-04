import React from "react";
import { Link, useParams } from "wouter";
import { useGetSkillGapAnalysis, useListCourses, useGetCurrentUser, getGetSkillGapAnalysisQueryKey, getListCoursesQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, CheckCircle2, XCircle, BookOpen, ExternalLink, PlayCircle, Award, Map } from "lucide-react";
import { CourseType } from "@workspace/api-client-react";

// Ring Chart component using simple SVG
const RingChart = ({ percentage }: { percentage: number }) => {
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-48 h-48 mx-auto my-6">
      <svg className="circular-chart w-full h-full transform -rotate-90" viewBox="0 0 200 200">
        <circle 
          className="circle-bg"
          cx="100" cy="100" r={radius} 
        />
        <circle 
          className="circle stroke-primary"
          cx="100" cy="100" r={radius} 
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-4xl font-heading font-extrabold text-foreground">{percentage}%</span>
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">Skill Match</span>
      </div>
    </div>
  );
};

const CourseTypeIcon = ({ type }: { type: string }) => {
  switch(type) {
    case 'course': return <PlayCircle className="w-4 h-4" />;
    case 'certification': return <Award className="w-4 h-4" />;
    case 'roadmap': return <Map className="w-4 h-4" />;
    default: return <BookOpen className="w-4 h-4" />;
  }
};

export default function SkillGap() {
  const params = useParams();
  const careerId = parseInt(params.careerId || "0", 10);
  const { data: user } = useGetCurrentUser();
  const userId = user?.id;

  const { data: analysis, isLoading: isGapLoading } = useGetSkillGapAnalysis(userId!, {
    query: { enabled: !!userId && !!careerId, queryKey: getGetSkillGapAnalysisQueryKey(userId!) }
  });

  const { data: courses, isLoading: isCoursesLoading } = useListCourses({ careerId }, {
    query: { enabled: !!careerId, queryKey: getListCoursesQueryKey({ careerId }) }
  });

  if (isGapLoading || isCoursesLoading) {
    return (
      <div className="container mx-auto p-6 space-y-8 max-w-5xl">
        <Skeleton className="h-8 w-32 mb-8" />
        <div className="grid md:grid-cols-3 gap-8">
          <Skeleton className="h-[400px] col-span-1" />
          <Skeleton className="h-[400px] col-span-2" />
        </div>
      </div>
    );
  }

  // Fallback if analysis is empty (e.g. mock backend not returning correct record)
  // The backend might return an array or single object based on how it's mocked, let's handle gracefully.
  const gapData = Array.isArray(analysis) ? analysis.find(a => a.careerId === careerId) : analysis;

  if (!gapData) {
    return (
      <div className="container mx-auto p-6 max-w-4xl text-center mt-20">
        <h2 className="text-2xl font-bold">Analysis not available</h2>
        <Button variant="outline" className="mt-4" asChild><Link href="/recommendations">Back to Recommendations</Link></Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 md:p-8 max-w-6xl space-y-8">
      <Button variant="ghost" className="mb-2 -ml-4 text-muted-foreground" asChild>
        <Link href="/recommendations"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Recommendations</Link>
      </Button>

      <div>
        <h1 className="text-3xl md:text-4xl font-heading font-bold">Gap Analysis: {gapData.careerTitle}</h1>
        <p className="text-muted-foreground mt-2 text-lg">Compare your current profile against industry requirements.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Left Column: Visual Ring */}
        <Card className="col-span-1 border-muted-foreground/20 shadow-md">
          <CardHeader className="text-center pb-0">
            <CardTitle className="text-lg">Readiness Score</CardTitle>
          </CardHeader>
          <CardContent>
            <RingChart percentage={Math.round(gapData.matchPercentage)} />
            <div className="text-center text-sm text-muted-foreground px-4">
              You have {gapData.matchedSkills.length} of {gapData.requiredSkills.length} required core skills for this role.
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Skills Detail */}
        <Card className="col-span-1 md:col-span-2 border-muted-foreground/20 shadow-md">
          <CardHeader>
            <CardTitle>Skill Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <h3 className="font-semibold text-lg text-foreground">Matched Skills</h3>
              </div>
              {gapData.matchedSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {gapData.matchedSkills.map((skill: string) => (
                    <Badge key={skill} variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800 text-sm py-1 px-3">
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic bg-muted/50 p-3 rounded-md">None matched yet. Starting fresh!</p>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <XCircle className="w-5 h-5 text-destructive" />
                <h3 className="font-semibold text-lg text-foreground">Missing Skills (Target these)</h3>
              </div>
              {gapData.missingSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {gapData.missingSkills.map((skill: string) => (
                    <Badge key={skill} variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-sm py-1 px-3">
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-green-600 font-medium bg-green-50 dark:bg-green-950/20 p-3 rounded-md border border-green-200 dark:border-green-900">You have all required base skills!</p>
              )}
            </div>

          </CardContent>
        </Card>

      </div>

      {/* Courses Section */}
      <div className="pt-8 border-t">
        <div className="mb-6">
          <h2 className="text-2xl font-heading font-bold">Action Plan</h2>
          <p className="text-muted-foreground mt-1">Curated resources to close your skill gap.</p>
        </div>

        {courses && courses.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <Card key={course.id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="flex items-center gap-1.5 uppercase text-[10px] tracking-wider font-bold">
                      <CourseTypeIcon type={course.type} />
                      {course.type}
                    </Badge>
                    <span className="text-xs font-mono text-muted-foreground">{course.level}</span>
                  </div>
                  <CardTitle className="text-lg leading-tight">{course.title}</CardTitle>
                  <CardDescription>{course.provider}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto pb-4">
                  <div className="text-sm font-medium">Duration: {course.duration}</div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button variant="outline" className="w-full group" asChild>
                    <a href={course.url} target="_blank" rel="noopener noreferrer">
                      View Resource <ExternalLink className="w-4 h-4 ml-2 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-muted/30 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <BookOpen className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium">No courses mapped yet.</p>
              <p className="text-muted-foreground max-w-sm mt-1">Our curriculum team is actively mapping resources for this career path.</p>
            </CardContent>
          </Card>
        )}
      </div>

    </div>
  );
}
