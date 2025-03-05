import { useQuery, useMutation } from "@tanstack/react-query";
import { Room, InsertRoom, insertRoomSchema } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Plus, Home } from "lucide-react";

export function RoomList() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: rooms, isLoading } = useQuery<Room[]>({
    queryKey: ["/api/rooms"],
  });

  const form = useForm({
    resolver: zodResolver(insertRoomSchema.omit({ userId: true })),
    defaultValues: {
      name: "",
      type: "living",
      floor: 1,
    },
  });

  const addRoomMutation = useMutation({
    mutationFn: async (data: { name: string; type: string; floor: number }) => {
      if (!user) throw new Error("User not authenticated");
      const res = await apiRequest("POST", "/api/rooms", {
        ...data,
        userId: user.id,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rooms"] });
      setOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Room added successfully",
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rooms</CardTitle>
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
        <CardTitle>Rooms</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Room
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Room</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => addRoomMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Living Room" {...field} />
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
                      <FormLabel>Room Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a room type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="living">Living Room</SelectItem>
                          <SelectItem value="bedroom">Bedroom</SelectItem>
                          <SelectItem value="kitchen">Kitchen</SelectItem>
                          <SelectItem value="bathroom">Bathroom</SelectItem>
                          <SelectItem value="office">Office</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="floor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Floor</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={addRoomMutation.isPending}>
                  {addRoomMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Room
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {rooms?.map((room) => (
            <div
              key={room.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-card"
            >
              <div className="flex items-center gap-3">
                <Home className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{room.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {room.type.charAt(0).toUpperCase() + room.type.slice(1)} • Floor {room.floor}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {(!rooms || rooms.length === 0) && (
            <div className="text-center text-muted-foreground py-8">
              No rooms added yet. Click the "Add Room" button to get started.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
