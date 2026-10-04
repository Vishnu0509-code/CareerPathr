import React, { useState } from "react";
import { useListQuestions, useCreateQuestion, useUpdateQuestion, useDeleteQuestion, getListQuestionsQueryKey, QuestionInput } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, Loader2, X } from "lucide-react";

const questionSchema = z.object({
  text: z.string().min(5, "Question text required"),
  category: z.string().min(2, "Category required"),
  options: z.array(z.object({
    value: z.string().min(1),
    label: z.string().min(1),
    careerTags: z.array(z.string())
  })).length(4, "Must have exactly 4 options")
});

export default function AdminQuestions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: questions, isLoading } = useListQuestions({ query: { queryKey: getListQuestionsQueryKey() } });

  const createMutation = useCreateQuestion({ mutation: { onSuccess: () => onSuccess("Created") } });
  const updateMutation = useUpdateQuestion({ mutation: { onSuccess: () => onSuccess("Updated") } });
  const deleteMutation = useDeleteQuestion({ mutation: { onSuccess: () => { toast({title:"Deleted"}); queryClient.invalidateQueries({queryKey: getListQuestionsQueryKey()}) } } });

  function onSuccess(msg: string) {
    toast({ title: msg });
    queryClient.invalidateQueries({ queryKey: getListQuestionsQueryKey() });
    setIsDialogOpen(false);
  }

  const form = useForm<z.infer<typeof questionSchema>>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      text: "", category: "Problem Solving",
      options: [
        {value: "a", label: "", careerTags: []},
        {value: "b", label: "", careerTags: []},
        {value: "c", label: "", careerTags: []},
        {value: "d", label: "", careerTags: []}
      ]
    }
  });

  const openNew = () => {
    setEditingId(null);
    form.reset({
      text: "", category: "Problem Solving",
      options: [{value: "a", label: "", careerTags: []},{value: "b", label: "", careerTags: []},{value: "c", label: "", careerTags: []},{value: "d", label: "", careerTags: []}]
    });
    setIsDialogOpen(true);
  };

  const openEdit = (q: any) => {
    setEditingId(q.id);
    form.reset({
      text: q.text, category: q.category,
      options: q.options.length === 4 ? q.options : [
        {value: "a", label: "", careerTags: []},{value: "b", label: "", careerTags: []},{value: "c", label: "", careerTags: []},{value: "d", label: "", careerTags: []}
      ]
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (values: z.infer<typeof questionSchema>) => {
    if (editingId) updateMutation.mutate({ id: editingId, data: values as QuestionInput });
    else createMutation.mutate({ data: values as QuestionInput });
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Assessment Questions</h1>
        <Button onClick={openNew}><Plus className="w-4 h-4 mr-2" /> Add Question</Button>
      </div>

      <div className="border rounded-lg bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Question Text</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={3} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground"/></TableCell></TableRow>
            ) : questions?.map(q => (
              <TableRow key={q.id}>
                <TableCell><span className="bg-muted px-2 py-1 rounded text-xs">{q.category}</span></TableCell>
                <TableCell className="font-medium max-w-md truncate">{q.text}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(q)}><Edit2 className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => { if(confirm('Delete?')) deleteMutation.mutate({id: q.id}) }}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Question" : "Add Question"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <FormField control={form.control} name="text" render={({field}) => (
                    <FormItem><FormLabel>Question Text</FormLabel><FormControl><Input {...field}/></FormControl><FormMessage/></FormItem>
                  )}/>
                </div>
                <FormField control={form.control} name="category" render={({field}) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                      <SelectContent>
                        {["Problem Solving", "Work Style", "Interests", "Abstract Reasoning"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}/>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-sm">Options (4 Required)</h4>
                {form.watch("options").map((_, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-muted/20 flex flex-col gap-3">
                    <div className="flex gap-4 items-start">
                      <div className="font-mono bg-muted w-8 h-8 rounded flex items-center justify-center font-bold shrink-0">{['A','B','C','D'][index]}</div>
                      <FormField control={form.control} name={`options.${index}.label`} render={({field}) => (
                        <FormItem className="flex-1 space-y-1"><FormLabel className="sr-only">Label</FormLabel><FormControl><Input placeholder="Option text" {...field}/></FormControl><FormMessage/></FormItem>
                      )}/>
                    </div>
                    <FormField control={form.control} name={`options.${index}.careerTags`} render={({field}) => (
                      <FormItem className="pl-12">
                        <FormLabel className="text-xs">Associated Career Tags (comma separated)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g. Software Development, AI" 
                            value={field.value.join(", ")}
                            onChange={e => field.onChange(e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                          />
                        </FormControl>
                      </FormItem>
                    )}/>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Save Question</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
