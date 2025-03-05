import { useAuth } from "@/hooks/use-auth";
import { DeviceList } from "@/components/dashboard/device-list";
import { EnergyChart } from "@/components/dashboard/energy-chart";
import { Recommendations } from "@/components/dashboard/recommendations";
import { Leaderboard } from "@/components/dashboard/leaderboard";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function Dashboard() {
  const { user, logoutMutation } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">EcoSync Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">Welcome, {user?.username}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          <EnergyChart />
          <DeviceList />
        </div>
        <div className="grid gap-6 md:grid-cols-2 mt-6">
          <Recommendations />
          <Leaderboard />
        </div>
      </main>
    </div>
  );
}
