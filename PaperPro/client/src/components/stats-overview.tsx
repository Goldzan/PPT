import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, TrendingUp, Trophy, Calendar } from "lucide-react";

interface Stats {
  totalPapers: number;
  averageScore: number;
  bestSubject: string | null;
  bestSubjectScore: number;
  weeklyCount: number;
  recentIncrease: number;
}

export function StatsOverview() {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Papers</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalPapers || 0}</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <FileText className="text-primary w-6 h-6" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-sm text-green-600">
              <span className="inline-block w-0 h-0 border-l-2 border-r-2 border-b-4 border-l-transparent border-r-transparent border-b-green-600 mr-1"></span>
              {stats?.recentIncrease || 0} this month
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
                {stats?.averageScore ? `${stats.averageScore}%` : "0%"}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-green-600 w-6 h-6" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-sm text-green-600">
              <span className="inline-block w-0 h-0 border-l-2 border-r-2 border-b-4 border-l-transparent border-r-transparent border-b-green-600 mr-1"></span>
              Improving steadily
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Best Subject</p>
              <p className="text-lg font-semibold text-gray-900">
                {stats?.bestSubject || "N/A"}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
              <Trophy className="text-yellow-600 w-6 h-6" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-sm text-gray-600 font-mono">
              {stats?.bestSubjectScore ? `${stats.bestSubjectScore}% avg` : "0% avg"}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.weeklyCount || 0}</p>
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
  );
}
