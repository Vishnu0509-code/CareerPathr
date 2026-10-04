import React from "react";
import { Link } from "wouter";
import { useGetCurrentUser, useGetAssessmentResults, useGetUserRecommendations, useGetStudentProfile, getGetCurrentUserQueryKey, getGetAssessmentResultsQueryKey, getGetUserRecommendationsQueryKey, getGetStudentProfileQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Brain, AlertCircle, BookOpen, Target, CheckCircle2 } from "lucide-react";
import { getCategoryColor } from "@/lib/colors";
import { Skeleton } from "@/components/ui/skeleton";

export default function StudentDashboard() {
  const { data: user } = useGetCurrentUser({ query: { queryKey: getGetCurrentUserQueryKey() } });
  const userId = user?.id;

  const { data: profile, isLoading: isProfileLoading } = useGetStudentProfile(userId!, {
    query: { enabled: !!userId, queryKey: getGetStudentProfileQueryKey(userId!) }
  });

  const { data: assessmentRes, isLoading: isAssessmentLoading } = useGetAssessmentResults(userId!, {
    // A 404 is expected for a new student who has not taken the assessment.
    query: { enabled: !!userId, queryKey: getGetAssessmentResultsQueryKey(userId!), retry: false }
  });

  const { data: recommendations, isLoading: isRecLoading } = useGetUserRecommendations(userId!, {
    query: { enabled: !!userId, queryKey: getGetUserRecommendationsQueryKey(userId!) }
  });

  const isLoading = isProfileLoading || isAssessmentLoading || isRecLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 md:p-8 space-y-8">
        <Skeleton className="h-12 w-64" />
        <div className="grid md:grid-cols-3 gap-6">
          <Skeleton className="h-48 col-span-2" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  const hasTakenAssessment = !!assessmentRes;
  const topRecommendations = recommendations?.slice(0, 3) || [];

  return (
    <div className="container mx-auto p-6 md:p-8 space-y-8 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold">Welcome back, {user?.name.split(' ')[0]}</h1>
          <p className="text-muted-foreground mt-1">Here is your career trajectory overview.</p>
        </div>
        {!hasTakenAssessment && (
          <Button size="lg" className="shrink-0" asChild>
            <Link href="/assessment"><Brain className="w-4 h-4 mr-2" /> Take Assessment</Link>
          </Button>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle>Assessment Status</CardTitle>
          </CardHeader>
          <CardContent>
            {hasTakenAssessment ? (
              <div className="flex items-center gap-4 bg-green-50 dark:bg-green-950/20 p-4 rounded-xl border border-green-200 dark:border-green-900">
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-500 shrink-0" />
                <div>
                  <h4 className="font-semibold text-green-900 dark:text-green-400">Assessment Completed</h4>
                  <p className="text-sm text-green-700 dark:text-green-600 mt-1">
                    Your profile indicates strong alignment with: <span className="font-medium">{assessmentRes?.topCareerTags?.join(', ')}</span>.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 bg-amber-50 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-200 dark:border-amber-900">
                <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-500 shrink-0" />
                <div>
                  <h4 className="font-semibold text-amber-900 dark:text-amber-400">Action Required</h4>
                  <p className="text-sm text-amber-700 dark:text-amber-600 mt-1">
                    Take the 10-minute assessment to unlock personalized career paths and course roadmaps.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-0">
            {hasTakenAssessment && (
              <Button variant="outline" size="sm" asChild>
                <Link href="/assessment">Retake Assessment</Link>
              </Button>
            )}
          </CardFooter>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle>Profile Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Current Focus</div>
              <div className="font-medium">{profile?.major || "Not set"} • {profile?.yearOfStudy || "Year not set"}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Declared Skills</div>
              <div className="flex flex-wrap gap-1">
                {profile?.skills?.length ? profile.skills.map(s => (
                  <span key={s} className="bg-secondary text-secondary-foreground text-xs px-2 py-0.5 rounded-md">{s}</span>
                )) : <span className="text-sm text-muted-foreground italic">None added</span>}
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="ghost" size="sm" className="w-full" asChild>
              <Link href="/profile">Edit Profile</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {hasTakenAssessment && topRecommendations.length > 0 && (
        <div className="space-y-6 pt-6 border-t">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-heading font-bold">Top Recommended Paths</h2>
            <Button variant="link" asChild>
              <Link href="/recommendations">View All <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {topRecommendations.map((rec) => {
              const colorClass = getCategoryColor(rec.career.category);
              return (
                <Card key={rec.id} className="shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${colorClass}`}>
                        {rec.career.category}
                      </span>
                      <div className="bg-primary/10 text-primary text-sm font-bold px-2 py-1 rounded-md">
                        {rec.matchScore}% Match
                      </div>
                    </div>
                    <CardTitle className="text-xl leading-tight line-clamp-2">{rec.career.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{rec.career.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto space-y-4 pb-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Skill Alignment</span>
                        <span className="font-medium">{Math.round(rec.matchScore * 0.8)}%</span>
                      </div>
                      <Progress value={rec.matchScore * 0.8} className="h-1.5" />
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2 pt-0">
                    <Button variant="default" className="flex-1" asChild>
                      <Link href={`/recommendations/${rec.careerId}/skill-gap`}>Gap Analysis</Link>
                    </Button>
                    <Button variant="outline" size="icon" title="View Career Details" asChild>
                      <Link href={`/careers/${rec.careerId}`}><Target className="w-4 h-4" /></Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
