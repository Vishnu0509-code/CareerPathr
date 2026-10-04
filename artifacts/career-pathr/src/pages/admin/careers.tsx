import React, { useState } from "react";
import { useListCareers, useCreateCareer, useUpdateCareer, useDeleteCareer, getListCareersQueryKey, Career, CareerInput } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, Loader2, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const careerSchema = z.object({
  title: z.string().min(2, "Title is required"),
  category: z.string().min(2, "Category is required"),
  description: z.string().min(10, "Description is required"),
  requiredSkills: z.array(z.string()).min(1, "At least one skill required"),
  avgSalary: z.string().min(2, "Avg Salary is required"),
  growthRate: z.string().min(1, "Growth rate is required"),
  learningTimeMonths: z.coerce.number().min(1, "Learning time must be > 0"),
  jobRoles: z.array(z.string()),
  futureOpportunities: z.string()
});

export default function AdminCareers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: careers, isLoading } = useListCareers(undefined, { query: { queryKey: getListCareersQueryKey() } });

  const createMutation = useCreateCareer({
    mutation: {
      onSuccess: () => {
        toast({ title: "Career created" });
        queryClient.invalidateQueries({ queryKey: getListCareersQueryKey() });
        setIsDialogOpen(false);
      }
    }
  });

  const updateMutation = useUpdateCareer({
    mutation: {
      onSuccess: () => {
        toast({ title: "Career updated" });
        queryClient.invalidateQueries({ queryKey: getListCareersQueryKey() });
        setIsDialogOpen(false);
      }
    }
  });

  const deleteMutation = useDeleteCareer({
    mutation: {
      onSuccess: () => {
        toast({ title: "Career deleted" });
        queryClient.invalidateQueries({ queryKey: getListCareersQueryKey() });
      }
    }
  });

  const form = useForm<z.infer<typeof careerSchema>>({
    resolver: zodResolver(careerSchema),
    defaultValues: {
      title: "", category: "", description: "", requiredSkills: [], 
      avgSalary: "", growthRate: "", learningTimeMonths: 6, jobRoles: [], futureOpportunities: ""
    }
  });

  const openNew = () => {
    setEditingId(null);
    form.reset({ title: "", category: "", description: "", requiredSkills: [], avgSalary: "", growthRate: "", learningTimeMonths: 6, jobRoles: [], futureOpportunities: "" });
    setIsDialogOpen(true);
  };

  const openEdit = (career: Career) => {
    setEditingId(career.id);
    // Cast/pad since detail fields might be missing in summary
    const fullCareer = career as any; 
    form.reset({
      title: career.title,
      category: career.category,
      description: career.description,
      requiredSkills: career.requiredSkills || [],
      avgSalary: career.avgSalary,
      growthRate: career.growthRate,
      learningTimeMonths: career.learningTimeMonths,
      jobRoles: fullCareer.jobRoles || [],
      futureOpportunities: fullCareer.futureOpportunities || ""
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (values: z.infer<typeof careerSchema>) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: values as CareerInput });
    } else {
      createMutation.mutate({ data: values as CareerInput });
    }
  };

  // Helper for arrays
  const [newSkill, setNewSkill] = useState("");
  const addSkill = () => {
    if (newSkill.trim() && !form.getValues("requiredSkills").includes(newSkill.trim())) {
      form.setValue("requiredSkills", [...form.getValues("requiredSkills"), newSkill.trim()]);
      setNewSkill("");
    }
  };
  const removeSkill = (sk: string) => {
    form.setValue("requiredSkills", form.getValues("requiredSkills").filter(s => s !== sk));
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Careers</h1>
        <Button onClick={openNew}><Plus className="w-4 h-4 mr-2" /> Add Career</Button>
      </div>

      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Avg Salary</TableHead>
              <TableHead>Growth</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground"/></TableCell></TableRow>
            ) : careers?.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No careers found.</TableCell></TableRow>
            ) : (
              careers?.map(career => (
                <TableRow key={career.id}>
                  <TableCell className="font-medium">{career.title}</TableCell>
                  <TableCell><span className="bg-muted px-2 py-1 rounded text-xs">{career.category}</span></TableCell>
                  <TableCell className="font-mono">{career.avgSalary}</TableCell>
                  <TableCell className="text-green-600">+{career.growthRate}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(career)}><Edit2 className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => { if(confirm('Delete?')) deleteMutation.mutate({id: career.id}) }}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Career" : "Add New Career"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="title" render={({field}) => (
                  <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field}/></FormControl><FormMessage/></FormItem>
                )}/>
                <FormField control={form.control} name="category" render={({field}) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                      <SelectContent>
                        {["Software Development", "Cybersecurity", "Data Science", "Artificial Intelligence", "Cloud Computing", "UI/UX Design", "Entrepreneurship"].map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage/>
                  </FormItem>
                )}/>
              </div>

              <FormField control={form.control} name="description" render={({field}) => (
                <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea rows={3} {...field}/></FormControl><FormMessage/></FormItem>
              )}/>

              <div className="grid grid-cols-3 gap-4">
                <FormField control={form.control} name="avgSalary" render={({field}) => (
                  <FormItem><FormLabel>Avg Salary</FormLabel><FormControl><Input placeholder="$100k" {...field}/></FormControl><FormMessage/></FormItem>
                )}/>
                <FormField control={form.control} name="growthRate" render={({field}) => (
                  <FormItem><FormLabel>Growth Rate</FormLabel><FormControl><Input placeholder="15%" {...field}/></FormControl><FormMessage/></FormItem>
                )}/>
                <FormField control={form.control} name="learningTimeMonths" render={({field}) => (
                  <FormItem><FormLabel>Learning Time (Mo)</FormLabel><FormControl><Input type="number" {...field}/></FormControl><FormMessage/></FormItem>
                )}/>
              </div>

              <FormField control={form.control} name="requiredSkills" render={({field}) => (
                <FormItem>
                  <FormLabel>Required Skills</FormLabel>
                  <div className="flex gap-2">
                    <Input value={newSkill} onChange={e=>setNewSkill(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault(); addSkill()}}} placeholder="Add skill"/>
                    <Button type="button" onClick={addSkill} variant="secondary">Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {field.value.map(sk => (
                      <span key={sk} className="bg-primary/10 text-primary px-2 py-1 rounded text-sm flex items-center gap-1">
                        {sk} <X className="w-3 h-3 cursor-pointer" onClick={() => removeSkill(sk)}/>
                      </span>
                    ))}
                  </div>
                  <FormMessage/>
                </FormItem>
              )}/>

              <FormField control={form.control} name="futureOpportunities" render={({field}) => (
                <FormItem><FormLabel>Future Opportunities</FormLabel><FormControl><Textarea rows={2} {...field}/></FormControl><FormMessage/></FormItem>
              )}/>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>Save Career</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
