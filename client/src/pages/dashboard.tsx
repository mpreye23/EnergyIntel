import { useAuth } from "@/hooks/use-auth";
import { DeviceList } from "@/components/dashboard/device-list";
import { RoomList } from "@/components/dashboard/room-list";
import { EnergyChart } from "@/components/dashboard/energy-chart";
import { Recommendations } from "@/components/dashboard/recommendations";
import { Leaderboard } from "@/components/dashboard/leaderboard";
import { Achievements } from "@/components/dashboard/achievements";
import { EnergyTutorial } from "@/components/tutorial/energy-tutorial";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useState, useEffect } from "react";

const TUTORIAL_SHOWN_KEY = "tutorial_shown";

export default function Dashboard() {
  const { user, logoutMutation } = useAuth();
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    const tutorialShown = localStorage.getItem(TUTORIAL_SHOWN_KEY);
    if (!tutorialShown) {
      setShowTutorial(true);
      localStorage.setItem(TUTORIAL_SHOWN_KEY, "true");
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">EcoSync Dashboard</h1>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTutorial(true)}
            >
              Show Tutorial
            </Button>
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
          <RoomList />
        </div>
        <div className="grid gap-6 md:grid-cols-2 mt-6">
          <DeviceList />
          <div className="grid gap-6">
            <Achievements />
            <Recommendations />
            <Leaderboard />
          </div>
        </div>
      </main>

      <EnergyTutorial
        open={showTutorial}
        onOpenChange={setShowTutorial}
      />
    </div>
  );
}