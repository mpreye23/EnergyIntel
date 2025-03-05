import { useQuery } from "@tanstack/react-query";
import { Achievement, PointHistory } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Trophy, Star, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function Achievements() {
  const { user } = useAuth();
  
  const { data: achievements, isLoading: isLoadingAchievements } = useQuery<Achievement[]>({
    queryKey: ["/api/achievements"],
  });

  const { data: pointHistory, isLoading: isLoadingHistory } = useQuery<PointHistory[]>({
    queryKey: ["/api/points/history"],
  });

  if (isLoadingAchievements || isLoadingHistory) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Achievements</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Your Achievements</CardTitle>
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          <span className="font-medium">{user?.energyPoints || 0} points</span>
          <span className="text-sm text-muted-foreground">Level {user?.level || 1}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {achievements?.map((achievement) => (
            <div
              key={achievement.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-card"
            >
              <div className="flex items-center gap-3">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="font-medium">{achievement.name}</p>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">+{achievement.points}</span>
                <span className="text-xs text-muted-foreground">points</span>
              </div>
            </div>
          ))}

          <div className="mt-6">
            <h3 className="text-sm font-medium mb-3">Recent Point History</h3>
            {pointHistory?.slice(0, 5).map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between py-2"
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{entry.reason}</span>
                </div>
                <span className="text-sm font-medium">
                  {entry.points > 0 ? "+" : ""}{entry.points}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
