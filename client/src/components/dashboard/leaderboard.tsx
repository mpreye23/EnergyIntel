import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "@shared/schema";
import { Trophy, Medal, Award, Loader2 } from "lucide-react";

const getRankIcon = (index: number) => {
  switch (index) {
    case 0:
      return <Trophy className="h-5 w-5 text-yellow-500" />;
    case 1:
      return <Medal className="h-5 w-5 text-gray-400" />;
    case 2:
      return <Award className="h-5 w-5 text-amber-700" />;
    default:
      return null;
  }
};

export function Leaderboard() {
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/leaderboard"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Energy Savings Leaderboard</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Energy Savings Leaderboard</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users?.map((user, index) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-card"
            >
              <div className="flex items-center gap-3">
                {getRankIcon(index)}
                <span className="font-medium">{user.username}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{user.energyPoints}</span>
                <span className="text-xs text-muted-foreground">points</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
