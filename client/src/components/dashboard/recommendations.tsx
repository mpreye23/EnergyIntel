import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Recommendation } from "@shared/schema";
import { LightbulbIcon, Loader2 } from "lucide-react";

export function Recommendations() {
  const { data: recommendations, isLoading } = useQuery<Recommendation[]>({
    queryKey: ["/api/recommendations"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Recommendations</CardTitle>
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
        <CardTitle>AI Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations?.map((rec) => (
            <div
              key={rec.id}
              className="flex items-start gap-3 p-4 rounded-lg border bg-card"
            >
              <LightbulbIcon className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <p className="text-sm">{rec.content}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(rec.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
