import React, { useState } from "react";
import { useListCourses, useCreateCourse, useUpdateCourse, useDeleteCourse, useListCareers, getListCoursesQueryKey, getListCareersQueryKey, CourseInput } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, Loader2, ExternalLink } from "lucide-react";

const courseSchema = z.object({
  careerId: z.coerce.number().min(1, "Career mapping required"),
  title: z.string().min(2, "Title required"),
  provider: z.string().min(2, "Provider required"),
  url: z.string().url("Must be a valid URL"),
  type: z.enum(["course", "certification", "roadmap"]),
  duration: z.string().min(1, "Duration required"),
  level: z.enum(["beginner", "intermediate", "advanced"])
});

export default function AdminCourses() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: courses, isLoading: isCoursesLoading } = useListCourses(undefined, { query: { queryKey: getListCoursesQueryKey({}) } });
  const { data: careers } = useListCareers(undefined, { query: { queryKey: getListCareersQueryKey() } });

  const createMutation = useCreateCourse({ mutation: { onSuccess: () => onSuccess("Created") } });
  const updateMutation = useUpdateCourse({ mutation: { onSuccess: () => onSuccess("Updated") } });
  const deleteMutation = useDeleteCourse({ mutation: { onSuccess: () => { toast({title:"Deleted"}); queryClient.invalidateQueries({queryKey: getListCoursesQueryKey({})}) } } });

  function onSuccess(msg: string) {
    toast({ title: msg });
    queryClient.invalidateQueries({ queryKey: getListCoursesQueryKey({}) });
    setIsDialogOpen(false);
  }

  const form = useForm<z.infer<typeof courseSchema>>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      careerId: 0, title: "", provider: "", url: "", type: "course", duration: "10 hours", level: "beginner"
    }
  });

  const openNew = () => {
    setEditingId(null);
    form.reset({ careerId: 0, title: "", provider: "", url: "", type: "course", duration: "10 hours", level: "beginner" });
    setIsDialogOpen(true);
  };

  const openEdit = (c: any) => {
    setEditingId(c.id);
    form.reset({
      careerId: c.careerId, title: c.title, provider: c.provider, url: c.url, type: c.type, duration: c.duration, level: c.level
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (values: z.infer<typeof courseSchema>) => {
    if (editingId) updateMutation.mutate({ id: editingId, data: values as CourseInput });
    else createMutation.mutate({ data: values as CourseInput });
  };

  const getCareerName = (id: number) => careers?.find(c => c.id === id)?.title || `ID: ${id}`;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Courses & Roadmaps</h1>
        <Button onClick={openNew}><Plus className="w-4 h-4 mr-2" /> Add Resource</Button>
      </div>

      <div className="border rounded-lg bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Mapped Career</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isCoursesLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground"/></TableCell></TableRow>
            ) : courses?.map(c => (
              <TableRow key={c.id}>
                <TableCell><span className="uppercase text-[10px] tracking-wider font-bold bg-muted px-2 py-1 rounded">{c.type}</span></TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {c.title}
                    <a href={c.url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground"><ExternalLink className="w-3 h-3"/></a>
                  </div>
                </TableCell>
                <TableCell>{c.provider}</TableCell>
                <TableCell className="text-muted-foreground">{getCareerName(c.careerId)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Edit2 className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => { if(confirm('Delete?')) deleteMutation.mutate({id: c.id}) }}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Resource" : "Add New Resource"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              <FormField control={form.control} name="careerId" render={({field}) => (
                <FormItem>
                  <FormLabel>Map to Career</FormLabel>
                  <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value.toString()}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a career" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {careers?.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage/>
                </FormItem>
              )}/>

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="title" render={({field}) => (
                  <FormItem><FormLabel>Resource Title</FormLabel><FormControl><Input {...field}/></FormControl><FormMessage/></FormItem>
                )}/>
                <FormField control={form.control} name="provider" render={({field}) => (
                  <FormItem><FormLabel>Provider (e.g. Coursera, AWS)</FormLabel><FormControl><Input {...field}/></FormControl><FormMessage/></FormItem>
                )}/>
              </div>

              <FormField control={form.control} name="url" render={({field}) => (
                <FormItem><FormLabel>URL</FormLabel><FormControl><Input type="url" placeholder="https://" {...field}/></FormControl><FormMessage/></FormItem>
              )}/>

              <div className="grid grid-cols-3 gap-4">
                <FormField control={form.control} name="type" render={({field}) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="course">Course</SelectItem>
                        <SelectItem value="certification">Certification</SelectItem>
                        <SelectItem value="roadmap">Roadmap</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}/>
                <FormField control={form.control} name="level" render={({field}) => (
                  <FormItem>
                    <FormLabel>Level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}/>
                <FormField control={form.control} name="duration" render={({field}) => (
                  <FormItem><FormLabel>Duration</FormLabel><FormControl><Input placeholder="4 weeks" {...field}/></FormControl><FormMessage/></FormItem>
                )}/>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Save Resource</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
