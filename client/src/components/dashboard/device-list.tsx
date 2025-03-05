import { useQuery, useMutation } from "@tanstack/react-query";
import { Device } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Power } from "lucide-react";

export function DeviceList() {
  const { data: devices, isLoading } = useQuery<Device[]>({
    queryKey: ["/api/devices"],
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: boolean }) => {
      const res = await apiRequest("POST", `/api/devices/${id}/toggle`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Devices</CardTitle>
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
        <CardTitle>Your Devices</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {devices?.map((device) => (
            <div
              key={device.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-card"
            >
              <div className="flex items-center gap-3">
                <Power className={device.status ? "text-green-500" : "text-muted-foreground"} />
                <div>
                  <p className="font-medium">{device.name}</p>
                  <p className="text-sm text-muted-foreground">{device.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  {device.currentUsage}W
                </span>
                <Switch
                  checked={device.status}
                  onCheckedChange={(status) =>
                    toggleMutation.mutate({ id: device.id, status })
                  }
                  disabled={toggleMutation.isPending}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
