import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Device } from "@shared/schema";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { Loader2 } from "lucide-react";

// Simulate hourly data for the last 24 hours
const generateHourlyData = (devices: Device[]) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  return hours.map((hour) => {
    const usage = devices.reduce((acc, device) => {
      // Simulate usage pattern based on device status and time of day
      const baseUsage = device.currentUsage;
      const multiplier = hour >= 8 && hour <= 20 ? 1.5 : 0.5;
      return acc + (device.status ? baseUsage * multiplier : 0);
    }, 0);

    return {
      hour: `${hour}:00`,
      usage,
    };
  });
};

export function EnergyChart() {
  const { data: devices, isLoading } = useQuery<Device[]>({
    queryKey: ["/api/devices"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Energy Usage</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const data = generateHourlyData(devices || []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Energy Usage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="usage"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
