import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, Edit, Trash2, Calculator, Atom, Dna, ArrowUpDown, Beaker } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { PastPaper } from "@shared/schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PapersTableProps {
  papers: PastPaper[];
  isLoading: boolean;
  onViewPaper: (paper: PastPaper) => void;
  onEditPaper: (paper: PastPaper) => void;
  onDeletePaper: () => void;
}

const subjectIcons: Record<string, any> = {
  Mathematics: Calculator,
  Physics: Atom,
  Chemistry: Beaker,
  Biology: Dna,
};

const subjectColors: Record<string, string> = {
  Mathematics: "bg-blue-100 text-blue-600",
  Physics: "bg-purple-100 text-purple-600", 
  Chemistry: "bg-green-100 text-green-600",
  Biology: "bg-emerald-100 text-emerald-600",
};

export function PapersTable({ papers, isLoading, onViewPaper, onEditPaper, onDeletePaper }: PapersTableProps) {
  const [sortField, setSortField] = useState<keyof PastPaper | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [deletingPaper, setDeletingPaper] = useState<PastPaper | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/papers/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Paper deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/papers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      onDeletePaper();
      setDeletingPaper(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete paper",
        variant: "destructive",
      });
    },
  });

  const handleSort = (field: keyof PastPaper) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedPapers = [...papers].sort((a, b) => {
    if (!sortField) return 0;
    
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];
    
    if (sortField === "score") {
      aValue = parseFloat(a.score);
      bValue = parseFloat(b.score);
    } else if (sortField === "dateCompleted") {
      aValue = new Date(a.dateCompleted).getTime();
      bValue = new Date(b.dateCompleted).getTime();
    }
    
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const getScoreColor = (score: string) => {
    const numScore = parseFloat(score);
    if (numScore >= 80) return "bg-green-500";
    if (numScore >= 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <div className="p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
              <div className="flex space-x-2">
                <Skeleton className="w-8 h-8" />
                <Skeleton className="w-8 h-8" />
                <Skeleton className="w-8 h-8" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (papers.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calculator className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No past papers yet</h3>
          <p className="text-gray-600 mb-4">
            Start tracking your academic progress by adding your first past paper.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("subject")}
                >
                  <div className="flex items-center">
                    Subject
                    <ArrowUpDown className="ml-2 w-3 h-3 text-gray-400" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("year")}
                >
                  <div className="flex items-center">
                    Year
                    <ArrowUpDown className="ml-2 w-3 h-3 text-gray-400" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paper
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("score")}
                >
                  <div className="flex items-center">
                    Score
                    <ArrowUpDown className="ml-2 w-3 h-3 text-gray-400" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("dateCompleted")}
                >
                  <div className="flex items-center">
                    Date Completed
                    <ArrowUpDown className="ml-2 w-3 h-3 text-gray-400" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedPapers.map((paper) => {
                const IconComponent = subjectIcons[paper.subject] || Calculator;
                const iconColorClass = subjectColors[paper.subject] || "bg-gray-100 text-gray-600";
                
                return (
                  <tr key={paper.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${iconColorClass}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{paper.subject}</div>
                          <div className="text-sm text-gray-500">A-Level</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                      {paper.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="secondary">
                        Paper {paper.paperNumber}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900 font-mono mr-2">
                          {paper.score}%
                        </span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getScoreColor(paper.score)}`}
                            style={{ width: `${Math.min(parseFloat(paper.score), 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(paper.dateCompleted)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewPaper(paper)}
                          className="text-primary hover:text-primary/80"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditPaper(paper)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingPaper(paper)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <AlertDialog open={!!deletingPaper} onOpenChange={() => setDeletingPaper(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Past Paper</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this past paper entry? This action cannot be undone.
              {deletingPaper && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                  <strong>{deletingPaper.subject}</strong> {deletingPaper.year} - Paper {deletingPaper.paperNumber}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingPaper && deleteMutation.mutate(deletingPaper.id)}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
