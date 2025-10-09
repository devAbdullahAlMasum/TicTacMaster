"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { UserAvatar } from "@/components/user-avatar";
import { Save, User, Palette, Bell, Shield, CheckCircle2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSoundEffects } from "@/lib/sound-manager";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { user } = useUser();
  const { playClickSound } = useSoundEffects();
  const { toast } = useToast();

  const currentUser = useQuery(api.users.getCurrentUser);
  const updateProfile = useMutation(api.users.updateUserProfile);

  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [selectedAvatarId, setSelectedAvatarId] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form when data loads
  useState(() => {
    if (currentUser) {
      setUsername(currentUser.username || "");
      setName(currentUser.name || "");
      setSelectedAvatarId(currentUser.avatarId || 1);
    }
  });

  const handleSave = async () => {
    if (!username.trim()) {
      toast({
        title: "Error",
        description: "Username cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    playClickSound();

    try {
      await updateProfile({
        username: username.trim(),
        name: name.trim() || undefined,
        avatarId: selectedAvatarId,
      });

      toast({
        title: "Success",
        description: "Your profile has been updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const avatarIds = Array.from({ length: 15 }, (_, i) => i + 1);

  return (
    <DashboardShell>
      <div className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Settings</h1>
          <Badge variant="outline" className="text-xs">
            v2.2
          </Badge>
        </div>

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <CardTitle>Profile Settings</CardTitle>
            </div>
            <CardDescription>
              Update your profile information and avatar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Avatar Preview */}
            <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg">
              <UserAvatar
                avatarId={selectedAvatarId}
                username={username || "Player"}
                size="xl"
                className="border-4 border-white dark:border-slate-800"
              />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Current Avatar
                </p>
                <p className="text-2xl font-bold">{username || "Player"}</p>
              </div>
            </div>

            <Separator />

            {/* Username Input */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                maxLength={20}
              />
              <p className="text-xs text-muted-foreground">
                This is your display name visible to other players
              </p>
            </div>

            {/* Full Name Input */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name (Optional)</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                maxLength={50}
              />
            </div>

            {/* Email Display */}
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={user?.primaryEmailAddress?.emailAddress || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed here. Manage it in your account
                settings.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Avatar Selection */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              <CardTitle>Choose Your Avatar</CardTitle>
            </div>
            <CardDescription>
              Select an avatar that represents you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 md:grid-cols-8 gap-4">
              {avatarIds.map((id) => (
                <button
                  key={id}
                  onClick={() => {
                    setSelectedAvatarId(id);
                    playClickSound();
                  }}
                  className={cn(
                    "relative rounded-lg p-2 transition-all hover:scale-110",
                    selectedAvatarId === id
                      ? "bg-blue-500/20 ring-2 ring-blue-500"
                      : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700",
                  )}
                >
                  <UserAvatar
                    avatarId={id}
                    username={username || "Player"}
                    size="md"
                    className="border-2"
                  />
                  {selectedAvatarId === id && (
                    <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center">
                      <CheckCircle2 className="h-3 w-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Preferences</CardTitle>
            </div>
            <CardDescription>Customize your gaming experience</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Sound Effects</p>
                  <p className="text-sm text-muted-foreground">
                    Play sounds during gameplay
                  </p>
                </div>
                <Badge variant="outline">Enabled</Badge>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Animations</p>
                  <p className="text-sm text-muted-foreground">
                    Enable smooth transitions and effects
                  </p>
                </div>
                <Badge variant="outline">Enabled</Badge>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Chat Filter</p>
                  <p className="text-sm text-muted-foreground">
                    Filter inappropriate language
                  </p>
                </div>
                <Badge variant="outline">Enabled</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Privacy & Security</CardTitle>
            </div>
            <CardDescription>Manage your privacy settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Profile Visibility</p>
                  <p className="text-sm text-muted-foreground">
                    Allow others to view your profile
                  </p>
                </div>
                <Badge variant="outline">Public</Badge>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Show Online Status</p>
                  <p className="text-sm text-muted-foreground">
                    Let others see when you're online
                  </p>
                </div>
                <Badge variant="outline">Enabled</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <Button
            size="lg"
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </DashboardShell>
  );
}
