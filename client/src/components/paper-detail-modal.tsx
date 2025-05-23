import { Calculator, Clock, Edit, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { PastPaper } from "@shared/schema";

interface PaperDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  paper: PastPaper | null;
  onEdit: (paper: PastPaper) => void;
  onDelete: () => void;
}

const subjectIcons: Record<string, any> = {
  Mathematics: Calculator,
  Physics: () => <span className="text-lg">⚛️</span>,
  Chemistry: () => <span className="text-lg">⚗️</span>,
  Biology: () => <span className="text-lg">🧬</span>,
};

const subjectColors: Record<string, string> = {
  Mathematics: "bg-blue-100 text-blue-600",
  Physics: "bg-purple-100 text-purple-600",
  Chemistry: "bg-green-100 text-green-600", 
  Biology: "bg-emerald-100 text-emerald-600",
};

export function PaperDetailModal({ isOpen, onClose, paper, onEdit, onDelete }: PaperDetailModalProps) {
  if (!paper) return null;

  const IconComponent = subjectIcons[paper.subject] || Calculator;
  const iconColorClass = subjectColors[paper.subject] || "bg-gray-100 text-gray-600";

  const getScoreColor = (score: string) => {
    const numScore = parseFloat(score);
    if (numScore >= 80) return "bg-green-500";
    if (numScore >= 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const formatTime = (minutes: number | null) => {
    if (!minutes) return "Not recorded";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconColorClass}`}>
                <IconComponent className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{paper.subject}</h3>
                <p className="text-sm text-gray-500">
                  {paper.year} · Paper {paper.paperNumber} · {formatDate(paper.dateCompleted)}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Score Achieved</span>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-gray-900 font-mono">
                    {paper.score}%
                  </span>
                  <div className="w-12 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getScoreColor(paper.score)}`}
                      style={{ width: `${Math.min(parseFloat(paper.score), 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Time Spent</span>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-2xl font-bold text-gray-900">
                    {formatTime(paper.timeSpent)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Challenging Areas & Notes</h4>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 min-h-[100px]">
              {paper.notes ? (
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {paper.notes}
                </p>
              ) : (
                <p className="text-sm text-gray-500 italic">No notes recorded for this paper.</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button 
              variant="outline"
              onClick={() => onEdit(paper)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button 
              variant="outline"
              onClick={onDelete}
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
