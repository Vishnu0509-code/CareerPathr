import React, { useEffect, useRef, useState } from "react";
import { useGetStudentProfile, useUpdateStudentProfile, useGetCurrentUser, getGetStudentProfileQueryKey } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const profileSchema = z.object({
  yearOfStudy: z.string().min(1, "Year is required"),
  major: z.string().min(2, "Major is required"),
  skills: z.array(z.string()),
  interests: z.array(z.string())
});

export default function Profile() {
  const { data: user } = useGetCurrentUser();
  const userId = user?.id;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useGetStudentProfile(userId!, {
    query: { enabled: !!userId, queryKey: getGetStudentProfileQueryKey(userId!) }
  });

  const updateMutation = useUpdateStudentProfile({
    mutation: {
      onSuccess: (data) => {
        toast({ title: "Profile updated successfully" });
        queryClient.setQueryData(getGetStudentProfileQueryKey(userId!), data);
      },
      onError: () => {
        toast({ title: "Failed to update profile", variant: "destructive" });
      }
    }
  });

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      yearOfStudy: "",
      major: "",
      skills: [],
      interests: []
    }
  });

  const initialized = useRef(false);
  useEffect(() => {
    if (profile && !initialized.current) {
      form.reset({
        yearOfStudy: profile.yearOfStudy,
        major: profile.major,
        skills: profile.skills || [],
        interests: profile.interests || []
      });
      initialized.current = true;
    }
  }, [profile, form]);

  const [newSkill, setNewSkill] = useState("");
  const [newInterest, setNewInterest] = useState("");

  const onSubmit = (values: z.infer<typeof profileSchema>) => {
    if (!userId) return;
    updateMutation.mutate({ userId, data: values });
  };

  const addArrayItem = (fieldName: "skills" | "interests", value: string, setter: (v: string) => void) => {
    const val = value.trim();
    if (!val) return;
    const current = form.getValues(fieldName);
    if (!current.includes(val)) {
      form.setValue(fieldName, [...current, val], { shouldDirty: true });
    }
    setter("");
  };

  const removeArrayItem = (fieldName: "skills" | "interests", valueToRemove: string) => {
    const current = form.getValues(fieldName);
    form.setValue(fieldName, current.filter(item => item !== valueToRemove), { shouldDirty: true });
  };

  if (isLoading) return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>;

  return (
    <div className="container mx-auto p-6 md:p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold">Your Profile</h1>
        <p className="text-muted-foreground mt-1">Keep this updated for better career matches.</p>
      </div>

      <div className="bg-card border rounded-2xl shadow-sm p-6 md:p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            <div className="grid md:grid-cols-2 gap-6">
              <FormField control={form.control} name="yearOfStudy" render={({ field }) => (
                <FormItem>
                  <FormLabel>Year of Study</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1st Year">1st Year</SelectItem>
                      <SelectItem value="2nd Year">2nd Year</SelectItem>
                      <SelectItem value="3rd Year">3rd Year</SelectItem>
                      <SelectItem value="4th Year">4th Year</SelectItem>
                      <SelectItem value="Graduate">Graduate</SelectItem>
                      <SelectItem value="Alumni">Alumni</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="major" render={({ field }) => (
                <FormItem>
                  <FormLabel>Major / Field of Study</FormLabel>
                  <FormControl><Input placeholder="e.g. Computer Science" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="space-y-6 pt-6 border-t">
              {/* Skills */}
              <FormField control={form.control} name="skills" render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Skills</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input 
                        placeholder="Add a skill (e.g. Python, Figma)" 
                        value={newSkill} 
                        onChange={e => setNewSkill(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addArrayItem('skills', newSkill, setNewSkill); } }}
                      />
                    </FormControl>
                    <Button type="button" onClick={() => addArrayItem('skills', newSkill, setNewSkill)} variant="secondary">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {field.value.map(skill => (
                      <div key={skill} className="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm flex items-center gap-2">
                        {skill}
                        <button type="button" onClick={() => removeArrayItem('skills', skill)} className="hover:text-destructive transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {field.value.length === 0 && <span className="text-sm text-muted-foreground italic">No skills added yet.</span>}
                  </div>
                </FormItem>
              )} />

              {/* Interests */}
              <FormField control={form.control} name="interests" render={({ field }) => (
                <FormItem>
                  <FormLabel>Interests & Hobbies</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input 
                        placeholder="Add an interest (e.g. Robotics, Startups)" 
                        value={newInterest} 
                        onChange={e => setNewInterest(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addArrayItem('interests', newInterest, setNewInterest); } }}
                      />
                    </FormControl>
                    <Button type="button" onClick={() => addArrayItem('interests', newInterest, setNewInterest)} variant="secondary">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {field.value.map(interest => (
                      <div key={interest} className="bg-accent/20 text-accent-foreground px-3 py-1.5 rounded-full text-sm flex items-center gap-2">
                        {interest}
                        <button type="button" onClick={() => removeArrayItem('interests', interest)} className="hover:text-destructive transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {field.value.length === 0 && <span className="text-sm text-muted-foreground italic">No interests added yet.</span>}
                  </div>
                </FormItem>
              )} />
            </div>

            <div className="pt-6 flex justify-end">
              <Button type="submit" size="lg" disabled={updateMutation.isPending || !form.formState.isDirty}>
                {updateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Save Changes
              </Button>
            </div>

          </form>
        </Form>
      </div>
    </div>
  );
}
