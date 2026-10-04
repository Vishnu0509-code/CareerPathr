import React, { useState } from "react";
import { Link } from "wouter";
import { useListCareers, getListCareersQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Search, Compass, ChevronRight } from "lucide-react";
import { getCategoryColor } from "@/lib/colors";

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

export default function CareerList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const { data: careers, isLoading } = useListCareers(
    activeCategory !== "All" ? { category: activeCategory } : undefined,
    { query: { queryKey: getListCareersQueryKey(activeCategory !== "All" ? { category: activeCategory } : undefined) } }
  );

  const filteredCareers = careers?.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="container mx-auto p-6 md:p-8 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold">Career Directory</h1>
          <p className="text-muted-foreground mt-2 text-lg">Explore high-growth tech roles and their requirements.</p>
        </div>
        <div className="w-full md:w-72 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search careers..." 
            className="pl-9 bg-card"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map(cat => (
          <Button 
            key={cat}
            variant={activeCategory === cat ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(cat)}
            className="rounded-full"
          >
            {cat}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : filteredCareers.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCareers.map(career => {
            const colorClass = getCategoryColor(career.category);
            return (
              <Card key={career.id} className="hover:shadow-lg transition-all duration-300 flex flex-col">
                <CardHeader className="pb-4">
                  <div className="mb-3">
                    <span className={`text-[11px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-sm ${colorClass}`}>
                      {career.category}
                    </span>
                  </div>
                  <CardTitle className="text-xl line-clamp-1">{career.title}</CardTitle>
                  <CardDescription className="line-clamp-2 mt-2">{career.description}</CardDescription>
                </CardHeader>
                <div className="px-6 py-4 mt-auto border-t bg-muted/20 flex gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground text-xs uppercase tracking-wide">Avg Salary</div>
                    <div className="font-mono font-medium mt-1">{career.avgSalary}</div>
                  </div>
                  <div className="w-px bg-border"></div>
                  <div>
                    <div className="text-muted-foreground text-xs uppercase tracking-wide">Growth</div>
                    <div className="font-medium mt-1 text-green-600 dark:text-green-400">+{career.growthRate}</div>
                  </div>
                </div>
                <CardFooter className="pt-4 pb-4">
                  <Button className="w-full group" variant="secondary" asChild>
                    <Link href={`/careers/${career.id}`}>
                      View Details <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="py-20 text-center border rounded-2xl bg-card">
          <Compass className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-heading font-semibold">No careers found</h3>
          <p className="text-muted-foreground">Try adjusting your search or category filter.</p>
        </div>
      )}
    </div>
  );
}
