import { useQuery, useMutation } from "@tanstack/react-query";
import { Device, insertDeviceSchema } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Power, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

export function DeviceList() {
  const [open, setOpen] = useState(false);
  const { data: devices, isLoading } = useQuery<Device[]>({
    queryKey: ["/api/devices"],
  });

  const form = useForm({
    resolver: zodResolver(insertDeviceSchema),
    defaultValues: {
      name: "",
      type: "light",
    },
  });

  const addDeviceMutation = useMutation({
    mutationFn: async (data: { name: string; type: string }) => {
      const res = await apiRequest("POST", "/api/devices", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      setOpen(false);
      form.reset();
    },
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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Your Devices</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Device
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Device</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => addDeviceMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Device Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Living Room Light" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Device Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a device type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="thermostat">Thermostat</SelectItem>
                          <SelectItem value="tv">TV</SelectItem>
                          <SelectItem value="computer">Computer</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={addDeviceMutation.isPending}>
                  {addDeviceMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Device
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
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
          {(!devices || devices.length === 0) && (
            <div className="text-center text-muted-foreground py-8">
              No devices added yet. Click the "Add Device" button to get started.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}