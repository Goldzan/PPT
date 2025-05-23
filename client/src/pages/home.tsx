import { useState } from "react";
import { EnhancedStats } from "@/components/enhanced-stats";
import { ActionBar } from "@/components/action-bar";
import { PapersTable } from "@/components/papers-table";
import { AddPaperModal } from "@/components/add-paper-modal";
import { PaperDetailModal } from "@/components/paper-detail-modal";
import { useQuery } from "@tanstack/react-query";
import type { PastPaper } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Download, GraduationCap, User } from "lucide-react";

export default function Home() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState<PastPaper | null>(null);
  const [editingPaper, setEditingPaper] = useState<PastPaper | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");

  const { data: papers = [], isLoading, refetch } = useQuery<PastPaper[]>({
    queryKey: ["/api/papers"],
  });

  const handleAddPaper = () => {
    setEditingPaper(null);
    setIsAddModalOpen(true);
  };

  const handleEditPaper = (paper: PastPaper) => {
    setEditingPaper(paper);
    setIsAddModalOpen(true);
  };

  const handleViewPaper = (paper: PastPaper) => {
    setSelectedPaper(paper);
    setIsDetailModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsAddModalOpen(false);
    setIsDetailModalOpen(false);
    setSelectedPaper(null);
    setEditingPaper(null);
  };

  const handleSuccess = () => {
    refetch();
    handleCloseModals();
  };

  const handleExport = () => {
    if (papers.length === 0) return;
    
    const csv = [
      "Subject,Year,Paper,Score,Date Completed,Time Spent,Notes",
      ...papers.map(paper => [
        paper.subject,
        paper.year,
        paper.paperNumber,
        `${paper.score}%`,
        paper.dateCompleted,
        paper.timeSpent ? `${paper.timeSpent} minutes` : "",
        paper.notes ? `"${paper.notes.replace(/"/g, '""')}"` : ""
      ].join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "past-papers-export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filter papers
  const filteredPapers = papers.filter(paper => {
    const matchesSearch = !searchTerm || 
      paper.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paper.paperNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSubject = !subjectFilter || subjectFilter === "all" || paper.subject === subjectFilter;
    const matchesYear = !yearFilter || yearFilter === "all" || paper.year.toString() === yearFilter;
    
    return matchesSearch && matchesSubject && matchesYear;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="text-white w-4 h-4" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Past Papers Tracker</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={handleExport}
                className="text-gray-600 hover:text-gray-900"
              >
                <Download className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="text-gray-600 w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EnhancedStats />
        
        <ActionBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          subjectFilter={subjectFilter}
          onSubjectFilterChange={setSubjectFilter}
          yearFilter={yearFilter}
          onYearFilterChange={setYearFilter}
          onAddPaper={handleAddPaper}
        />

        <PapersTable
          papers={filteredPapers}
          isLoading={isLoading}
          onViewPaper={handleViewPaper}
          onEditPaper={handleEditPaper}
          onDeletePaper={handleSuccess}
        />

        {/* Floating Action Button (Mobile) */}
        <Button
          onClick={handleAddPaper}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg hover:shadow-xl sm:hidden"
          size="lg"
        >
          <span className="text-lg">+</span>
        </Button>
      </main>

      <AddPaperModal
        isOpen={isAddModalOpen}
        onClose={handleCloseModals}
        onSuccess={handleSuccess}
        editingPaper={editingPaper}
      />

      <PaperDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseModals}
        paper={selectedPaper}
        onEdit={handleEditPaper}
        onDelete={handleSuccess}
      />
    </div>
  );
}
