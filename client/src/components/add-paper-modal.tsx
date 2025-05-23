import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertPastPaperSchema, type InsertPastPaper, type PastPaper } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useEffect, useState } from "react";

interface AddPaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingPaper?: PastPaper | null;
}

const commonSubjects = [
  "AQA Mathematics",
  "OCR Physics",
  "OCR Chemistry"
];

const years = ["2024", "2023", "2022", "2021", "2020", "2019", "2018", "2017"];
const paperNumbers = ["1", "2", "3"];

export function AddPaperModal({ isOpen, onClose, onSuccess, editingPaper }: AddPaperModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [customSubject, setCustomSubject] = useState("");
  const [showCustomSubject, setShowCustomSubject] = useState(false);

  const form = useForm<InsertPastPaper>({
    resolver: zodResolver(insertPastPaperSchema),
    defaultValues: {
      subject: "",
      year: new Date().getFullYear(),
      paperNumber: "",
      score: "",
      dateCompleted: new Date().toISOString().split('T')[0],
      timeSpent: undefined,
      notes: "",
    },
  });

  useEffect(() => {
    if (editingPaper) {
      form.reset({
        subject: editingPaper.subject,
        year: editingPaper.year,
        paperNumber: editingPaper.paperNumber,
        score: editingPaper.score,
        dateCompleted: editingPaper.dateCompleted,
        timeSpent: editingPaper.timeSpent || undefined,
        notes: editingPaper.notes || "",
      });
    } else {
      form.reset({
        subject: "",
        year: new Date().getFullYear(),
        paperNumber: "",
        score: "",
        dateCompleted: new Date().toISOString().split('T')[0],
        timeSpent: undefined,
        notes: "",
      });
    }
  }, [editingPaper, form]);

  const createMutation = useMutation({
    mutationFn: async (data: InsertPastPaper) => {
      if (editingPaper) {
        return await apiRequest("PATCH", `/api/papers/${editingPaper.id}`, data);
      } else {
        return await apiRequest("POST", "/api/papers", data);
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: editingPaper ? "Paper updated successfully" : "Paper added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/papers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      onSuccess();
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || (editingPaper ? "Failed to update paper" : "Failed to add paper"),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertPastPaper) => {
    createMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingPaper ? "Edit Past Paper" : "Add New Past Paper"}</DialogTitle>
          <DialogDescription>
            {editingPaper ? "Update your past paper details." : "Track your academic progress by logging a completed past paper."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject *</FormLabel>
                    {showCustomSubject ? (
                      <div className="space-y-2">
                        <FormControl>
                          <Input
                            placeholder="Enter custom subject"
                            value={field.value}
                            onChange={(e) => {
                              field.onChange(e.target.value);
                              setCustomSubject(e.target.value);
                            }}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setShowCustomSubject(false);
                            field.onChange("");
                          }}
                        >
                          Choose from list instead
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Select onValueChange={(value) => {
                          if (value === "custom") {
                            setShowCustomSubject(true);
                            field.onChange("");
                          } else {
                            field.onChange(value);
                          }
                        }} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Subject" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {commonSubjects.map(subject => (
                              <SelectItem key={subject} value={subject}>
                                {subject}
                              </SelectItem>
                            ))}
                            <SelectItem value="custom">+ Add custom subject</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year *</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Year" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {years.map(year => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paperNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Paper Number *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Paper" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {paperNumbers.map(num => (
                          <SelectItem key={num} value={num}>
                            Paper {num}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Score (%) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        placeholder="85.5"
                        className="font-mono"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateCompleted"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date Completed *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timeSpent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Spent (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="120"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes on Challenging Areas</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="Describe which sections or topics you found challenging, what mistakes you made, or areas to review..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <div className="text-sm text-gray-500">
                    This will help you identify patterns and focus your future study sessions.
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                <Save className="w-4 h-4 mr-2" />
                {createMutation.isPending 
                  ? (editingPaper ? "Updating..." : "Saving...") 
                  : (editingPaper ? "Update Paper" : "Save Paper")
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
