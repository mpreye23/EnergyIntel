import { useQuery, useMutation } from "@tanstack/react-query";
import { Preset, Device } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Plus, Zap, Settings2 } from "lucide-react";

export function EnergyPresets() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: presets, isLoading: isLoadingPresets } = useQuery<Preset[]>({
    queryKey: ["/api/presets"],
  });

  const { data: devices } = useQuery<Device[]>({
    queryKey: ["/api/devices"],
  });

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      isDefault: false,
      settings: {},
    },
  });

  const createPresetMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!user) throw new Error("User not authenticated");
      const res = await apiRequest("POST", "/api/presets", {
        ...data,
        userId: user.id,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/presets"] });
      setOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Preset created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const applyPresetMutation = useMutation({
    mutationFn: async (presetId: number) => {
      const res = await apiRequest("POST", `/api/presets/${presetId}/apply`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      toast({
        title: "Success",
        description: "Preset applied successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoadingPresets) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Energy-Saving Presets</CardTitle>
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
        <CardTitle>Energy-Saving Presets</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Preset
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Preset</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) => {
                  const settings = {};
                  devices?.forEach((device) => {
                    settings[device.id] = {
                      status: form.watch(`device_${device.id}_status`) || false,
                      targetUsage: form.watch(`device_${device.id}_usage`),
                    };
                  });
                  createPresetMutation.mutate({ ...data, settings });
                })}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preset Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Night Mode" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Settings for energy saving during night time"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isDefault"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel>Set as Default</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Device Settings</h3>
                  {devices?.map((device) => (
                    <div key={device.id} className="space-y-2">
                      <p className="text-sm font-medium">{device.name}</p>
                      <div className="flex items-center gap-4">
                        <FormField
                          control={form.control}
                          name={`device_${device.id}_status`}
                          render={({ field }) => (
                            <FormItem className="flex items-center gap-2">
                              <FormLabel className="text-sm">Status</FormLabel>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`device_${device.id}_usage`}
                          render={({ field }) => (
                            <FormItem className="flex items-center gap-2">
                              <FormLabel className="text-sm">Usage (W)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  className="w-24"
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={createPresetMutation.isPending}
                >
                  {createPresetMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Preset
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {presets?.map((preset) => (
            <div
              key={preset.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-card"
            >
              <div className="flex items-center gap-3">
                <Settings2 className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{preset.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {preset.description}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyPresetMutation.mutate(preset.id)}
                disabled={applyPresetMutation.isPending}
              >
                <Zap className="h-4 w-4 mr-2" />
                Apply
              </Button>
            </div>
          ))}
          {(!presets || presets.length === 0) && (
            <div className="text-center text-muted-foreground py-8">
              No presets created yet. Click the "Create Preset" button to get started.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
