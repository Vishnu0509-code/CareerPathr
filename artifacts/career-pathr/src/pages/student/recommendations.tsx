import React, { useState } from "react";
import { Link } from "wouter";
import { useGetUserRecommendations, useGetCurrentUser, getGetCurrentUserQueryKey, getGetUserRecommendationsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, ChevronRight, Filter } from "lucide-react";
import { getCategoryColor } from "@/lib/colors";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const CATEGORIES = [
  "All",
  "Software Development", 
  "Cybersecurity", 
  "Data Science", 
  "Artificial Intelligence", 
  "Cloud Computing", 
  "UI/UX Design", 
  "Entrepreneurship"
];

export default function Recommendations() {
  const { data: user } = useGetCurrentUser({ query: { queryKey: getGetCurrentUserQueryKey() } });
  const userId = user?.id;

  const { data: recommendations, isLoading } = useGetUserRecommendations(userId!, {
    query: { enabled: !!userId, queryKey: getGetUserRecommendationsQueryKey(userId!) }
  });

  const [activeTab, setActiveTab] = useState("All");

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-8 max-w-6xl">
        <Skeleton className="h-12 w-64" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-64" />)}
        </div>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="container mx-auto p-6 max-w-4xl text-center mt-20">
        <h2 className="text-3xl font-heading font-bold mb-4">No recommendations yet</h2>
        <p className="text-muted-foreground mb-8 text-lg">Take the career assessment to get personalized path recommendations.</p>
        <Button size="lg" asChild>
          <Link href="/assessment">Start Assessment</Link>
        </Button>
      </div>
    );
  }

  const filteredRecs = activeTab === "All" 
    ? recommendations 
    : recommendations.filter(r => r.career.category === activeTab);

  return (
    <div className="container mx-auto p-6 md:p-8 max-w-7xl space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-heading font-bold">Your Path Recommendations</h1>
        <p className="text-muted-foreground mt-2 text-lg">Sorted by algorithmic match to your cognitive profile and interests.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center mb-6 overflow-x-auto pb-2 scrollbar-hide">
          <Filter className="w-4 h-4 text-muted-foreground mr-3 shrink-0" />
          <TabsList className="bg-transparent space-x-2">
            {CATEGORIES.map(cat => (
              <TabsTrigger 
                key={cat} 
                value={cat}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 border"
              >
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="mt-0 border-none p-0 outline-none">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecs.map((rec) => {
              const colorClass = getCategoryColor(rec.career.category);
              return (
                <Card key={rec.id} className="shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full border-muted-foreground/20">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-3">
                      <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${colorClass}`}>
                        {rec.career.category}
                      </span>
                      <div className="flex flex-col items-end">
                        <span className="text-2xl font-heading font-extrabold text-primary leading-none">{rec.matchScore}%</span>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Match</span>
                      </div>
                    </div>
                    <CardTitle className="text-xl leading-tight line-clamp-2">{rec.career.title}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-2 text-sm">{rec.career.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="mt-auto space-y-5 pb-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-muted-foreground font-medium text-xs uppercase tracking-wider">Aptitude Alignment</span>
                      </div>
                      <Progress value={rec.matchScore} className="h-2 bg-muted/50" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                      <div>
                        <div className="text-[10px] uppercase text-muted-foreground font-bold tracking-wide">Avg Salary</div>
                        <div className="font-mono text-sm font-medium mt-0.5">{rec.career.avgSalary}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-muted-foreground font-bold tracking-wide">Learning Time</div>
                        <div className="font-medium text-sm mt-0.5">{rec.career.learningTimeMonths} mo</div>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex gap-3 pt-0">
                    <Button variant="default" className="flex-1 group" asChild>
                      <Link href={`/recommendations/${rec.careerId}/skill-gap`}>
                        Gap Analysis <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                    <Button variant="outline" size="icon" title="View Career Overview" asChild>
                      <Link href={`/careers/${rec.careerId}`}><Target className="w-4 h-4" /></Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
          
          {filteredRecs.length === 0 && (
            <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed">
              <p className="text-muted-foreground font-medium">No highly matched careers found in this category.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
