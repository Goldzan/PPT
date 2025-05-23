import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  TrendingUp, 
  Trophy, 
  Calendar, 
  Clock, 
  Target,
  BarChart3,
  Award
} from "lucide-react";

interface EnhancedStats {
  totalPapers: number;
  averageScore: number;
  bestSubject: string | null;
  bestSubjectScore: number;
  weeklyCount: number;
  recentIncrease: number;
  totalTimeSpent: number;
  averageTimePerPaper: number;
  scoreDistribution: {
    excellent: number;
    good: number;
    average: number;
    needsWork: number;
  };
  subjectPerformance: Array<{
    subject: string;
    averageScore: number;
    paperCount: number;
    bestScore: number;
    latestScore: number;
  }>;
}

export function EnhancedStats() {
  const { data: stats, isLoading } = useQuery<EnhancedStats>({
    queryKey: ["/api/stats"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-16 mb-3" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!stats || !stats.scoreDistribution) return null;

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getGradeFromScore = (score: number) => {
    if (score >= 80) return { grade: "A", color: "bg-green-500" };
    if (score >= 70) return { grade: "B", color: "bg-blue-500" };
    if (score >= 60) return { grade: "C", color: "bg-yellow-500" };
    return { grade: "D", color: "bg-red-500" };
  };

  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Papers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPapers}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <FileText className="text-primary w-6 h-6" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-sm text-green-600">
                +{stats.recentIncrease} this month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900 font-mono">
                  {stats.averageScore}%
                </p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-green-600 w-6 h-6" />
              </div>
            </div>
            <div className="mt-3">
              <Badge variant="outline" className={`${getGradeFromScore(stats.averageScore).color} text-white border-none`}>
                Grade {getGradeFromScore(stats.averageScore).grade}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Study Time</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatTime(stats.totalTimeSpent)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Clock className="text-blue-600 w-6 h-6" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-sm text-gray-600">
                ~{formatTime(stats.averageTimePerPaper)} per paper
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-gray-900">{stats.weeklyCount}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Calendar className="text-primary w-6 h-6" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-sm text-gray-600">Papers completed</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Score Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Excellent (80%+)</span>
                </div>
                <span className="text-sm font-bold">{stats.scoreDistribution.excellent}</span>
              </div>
              <Progress value={(stats.scoreDistribution.excellent / stats.totalPapers) * 100} className="h-2" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium">Good (70-79%)</span>
                </div>
                <span className="text-sm font-bold">{stats.scoreDistribution.good}</span>
              </div>
              <Progress value={(stats.scoreDistribution.good / stats.totalPapers) * 100} className="h-2" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium">Average (60-69%)</span>
                </div>
                <span className="text-sm font-bold">{stats.scoreDistribution.average}</span>
              </div>
              <Progress value={(stats.scoreDistribution.average / stats.totalPapers) * 100} className="h-2" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium">Needs Work (&lt;60%)</span>
                </div>
                <span className="text-sm font-bold">{stats.scoreDistribution.needsWork}</span>
              </div>
              <Progress value={(stats.scoreDistribution.needsWork / stats.totalPapers) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Subject Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Subject Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.subjectPerformance.length > 0 ? (
                stats.subjectPerformance.slice(0, 5).map((subject, index) => (
                  <div key={subject.subject} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-orange-500' : 'bg-gray-300'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{subject.subject}</p>
                        <p className="text-sm text-gray-600">{subject.paperCount} papers</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{subject.averageScore}%</p>
                      <p className="text-sm text-gray-600">Best: {subject.bestScore}%</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No subjects tracked yet</p>
                  <p className="text-sm">Add your first past paper to see performance data</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Best Subject Highlight */}
      {stats.bestSubject && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <Trophy className="text-white w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Top Performing Subject</h3>
                  <p className="text-gray-600">Your strongest area right now</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{stats.bestSubject}</p>
                <p className="text-lg text-blue-600 font-semibold">{stats.bestSubjectScore}% average</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}