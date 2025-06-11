"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  Volume2,
  Bell,
  User,
  Save,
  RotateCcw,
  Monitor,
  Smartphone,
} from "lucide-react";
import { toast } from "react-hot-toast";

export function RehabSettings() {
  // Pose Detection Settings
  const [poseThreshold, setPoseThreshold] = useState([75]);
  const [holdTimeThreshold, setHoldTimeThreshold] = useState([3]);
  const [repCountSensitivity, setRepCountSensitivity] = useState([80]);
  const [enablePoseOverlay, setEnablePoseOverlay] = useState(true);
  const [enableConfidenceDisplay, setEnableConfidenceDisplay] = useState(true);

  // Audio & Visual Settings
  const [enableVoiceFeedback, setEnableVoiceFeedback] = useState(true);
  const [voiceVolume, setVoiceVolume] = useState([70]);
  const [enableSoundEffects, setEnableSoundEffects] = useState(true);
  const [feedbackFrequency, setFeedbackFrequency] = useState("medium");

  // Notification Settings
  const [enableDailyReminders, setEnableDailyReminders] = useState(true);
  const [reminderTime, setReminderTime] = useState("09:00");
  const [enableProgressNotifications, setEnableProgressNotifications] = useState(true);
  const [enableStreakReminders, setEnableStreakReminders] = useState(true);

  // Accessibility Settings
  const [fontSize, setFontSize] = useState("medium");
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [screenReader, setScreenReader] = useState(false);

  // Profile Settings
  const [userName, setUserName] = useState("Alex");
  const [preferredDevice, setPreferredDevice] = useState("desktop");
  const [sessionGoal, setSessionGoal] = useState("15");

  const handleSaveSettings = () => {
    // Save settings to localStorage or API
    const settings = {
      poseDetection: {
        threshold: poseThreshold[0],
        holdTimeThreshold: holdTimeThreshold[0],
        repCountSensitivity: repCountSensitivity[0],
        enablePoseOverlay,
        enableConfidenceDisplay,
      },
      audio: {
        enableVoiceFeedback,
        voiceVolume: voiceVolume[0],
        enableSoundEffects,
        feedbackFrequency,
      },
      notifications: {
        enableDailyReminders,
        reminderTime,
        enableProgressNotifications,
        enableStreakReminders,
      },
      accessibility: {
        fontSize,
        highContrast,
        reducedMotion,
        screenReader,
      },
      profile: {
        userName,
        preferredDevice,
        sessionGoal,
      },
    };

    localStorage.setItem("fluxtrack-rehab-settings", JSON.stringify(settings));

    toast.success("Settings saved successfully! ✅");
  };

  const handleResetSettings = () => {
    // Reset to defaults
    setPoseThreshold([75]);
    setHoldTimeThreshold([3]);
    setRepCountSensitivity([80]);
    setEnablePoseOverlay(true);
    setEnableConfidenceDisplay(true);
    setEnableVoiceFeedback(true);
    setVoiceVolume([70]);
    setEnableSoundEffects(true);
    setFeedbackFrequency("medium");
    setEnableDailyReminders(true);
    setReminderTime("09:00");
    setEnableProgressNotifications(true);
    setEnableStreakReminders(true);
    setFontSize("medium");
    setHighContrast(false);
    setReducedMotion(false);
    setScreenReader(false);
    setPreferredDevice("desktop");
    setSessionGoal("15");

    toast.success("Settings reset");
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#2D3748] mb-2">Rehab Settings</h1>
        <p className="text-[#2D3748]/70">Customize your rehabilitation experience</p>
      </div>

      <div className="space-y-6">
        {/* Pose Detection Settings */}
        <Card className="bg-white border-[#6B8EFF]/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Camera className="h-5 w-5 text-[#6B8EFF]" />
              <span>Pose Detection Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Pose Accuracy Threshold</Label>
                <div className="px-3">
                  <Slider
                    value={poseThreshold}
                    onValueChange={setPoseThreshold}
                    max={100}
                    min={50}
                    step={5}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-between text-sm text-[#2D3748]/60">
                  <span>Less Strict</span>
                  <Badge variant="secondary">{poseThreshold[0]}%</Badge>
                  <span>More Strict</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Hold Time Threshold</Label>
                <div className="px-3">
                  <Slider
                    value={holdTimeThreshold}
                    onValueChange={setHoldTimeThreshold}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-between text-sm text-[#2D3748]/60">
                  <span>1 second</span>
                  <Badge variant="secondary">{holdTimeThreshold[0]}s</Badge>
                  <span>10 seconds</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Rep Count Sensitivity</Label>
                <div className="px-3">
                  <Slider
                    value={repCountSensitivity}
                    onValueChange={setRepCountSensitivity}
                    max={100}
                    min={50}
                    step={5}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-between text-sm text-[#2D3748]/60">
                  <span>Less Sensitive</span>
                  <Badge variant="secondary">{repCountSensitivity[0]}%</Badge>
                  <span>More Sensitive</span>
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Pose Overlay</Label>
                  <p className="text-sm text-[#2D3748]/60">Show pose detection lines</p>
                </div>
                <Switch
                  checked={enablePoseOverlay}
                  onCheckedChange={setEnablePoseOverlay}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Confidence Display</Label>
                  <p className="text-sm text-[#2D3748]/60">Show accuracy percentage</p>
                </div>
                <Switch
                  checked={enableConfidenceDisplay}
                  onCheckedChange={setEnableConfidenceDisplay}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audio & Visual Feedback */}
        <Card className="bg-white border-[#6B8EFF]/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Volume2 className="h-5 w-5 text-[#6B8EFF]" />
              <span>Audio & Visual Feedback</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Voice Feedback</Label>
                    <p className="text-sm text-[#2D3748]/60">
                      Spoken instructions and corrections
                    </p>
                  </div>
                  <Switch
                    checked={enableVoiceFeedback}
                    onCheckedChange={setEnableVoiceFeedback}
                  />
                </div>

                {enableVoiceFeedback && (
                  <div className="space-y-2 ml-4">
                    <Label>Voice Volume</Label>
                    <div className="px-3">
                      <Slider
                        value={voiceVolume}
                        onValueChange={setVoiceVolume}
                        max={100}
                        min={0}
                        step={10}
                        className="w-full"
                      />
                    </div>
                    <div className="flex justify-between text-sm text-[#2D3748]/60">
                      <span>Quiet</span>
                      <Badge variant="secondary">{voiceVolume[0]}%</Badge>
                      <span>Loud</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Sound Effects</Label>
                    <p className="text-sm text-[#2D3748]/60">Success sounds and alerts</p>
                  </div>
                  <Switch
                    checked={enableSoundEffects}
                    onCheckedChange={setEnableSoundEffects}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Feedback Frequency</Label>
                  <Select value={feedbackFrequency} onValueChange={setFeedbackFrequency}>
                    <SelectTrigger className="border-[#6B8EFF]/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - Every 10 seconds</SelectItem>
                      <SelectItem value="medium">Medium - Every 5 seconds</SelectItem>
                      <SelectItem value="high">High - Every 2 seconds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="bg-white border-[#6B8EFF]/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-[#6B8EFF]" />
              <span>Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Daily Reminders</Label>
                  <p className="text-sm text-[#2D3748]/60">Remind me to do exercises</p>
                </div>
                <Switch
                  checked={enableDailyReminders}
                  onCheckedChange={setEnableDailyReminders}
                />
              </div>

              {enableDailyReminders && (
                <div className="space-y-2">
                  <Label>Reminder Time</Label>
                  <Input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="border-[#6B8EFF]/20 focus:border-[#6B8EFF]"
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <Label>Progress Notifications</Label>
                  <p className="text-sm text-[#2D3748]/60">Celebrate achievements</p>
                </div>
                <Switch
                  checked={enableProgressNotifications}
                  onCheckedChange={setEnableProgressNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Streak Reminders</Label>
                  <p className="text-sm text-[#2D3748]/60">Maintain exercise streaks</p>
                </div>
                <Switch
                  checked={enableStreakReminders}
                  onCheckedChange={setEnableStreakReminders}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accessibility */}
        <Card className="bg-white border-[#6B8EFF]/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Monitor className="h-5 w-5 text-[#6B8EFF]" />
              <span>Accessibility</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Font Size</Label>
                <Select value={fontSize} onValueChange={setFontSize}>
                  <SelectTrigger className="border-[#6B8EFF]/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                    <SelectItem value="extra-large">Extra Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>High Contrast</Label>
                  <p className="text-sm text-[#2D3748]/60">Improve visibility</p>
                </div>
                <Switch checked={highContrast} onCheckedChange={setHighContrast} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Reduced Motion</Label>
                  <p className="text-sm text-[#2D3748]/60">Minimize animations</p>
                </div>
                <Switch checked={reducedMotion} onCheckedChange={setReducedMotion} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Screen Reader Support</Label>
                  <p className="text-sm text-[#2D3748]/60">Enhanced accessibility</p>
                </div>
                <Switch checked={screenReader} onCheckedChange={setScreenReader} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Settings */}
        <Card className="bg-white border-[#6B8EFF]/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-[#6B8EFF]" />
              <span>Profile Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Display Name</Label>
                <Input
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="border-[#6B8EFF]/20 focus:border-[#6B8EFF]"
                />
              </div>

              <div className="space-y-2">
                <Label>Preferred Device</Label>
                <Select value={preferredDevice} onValueChange={setPreferredDevice}>
                  <SelectTrigger className="border-[#6B8EFF]/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desktop">
                      <div className="flex items-center space-x-2">
                        <Monitor className="h-4 w-4" />
                        <span>Desktop</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="mobile">
                      <div className="flex items-center space-x-2">
                        <Smartphone className="h-4 w-4" />
                        <span>Mobile</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Daily Session Goal (minutes)</Label>
                <Input
                  type="number"
                  value={sessionGoal}
                  onChange={(e) => setSessionGoal(e.target.value)}
                  min="5"
                  max="120"
                  className="border-[#6B8EFF]/20 focus:border-[#6B8EFF]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <Button
            onClick={handleResetSettings}
            variant="outline"
            className="border-[#6B8EFF]/20 hover:bg-[#6B8EFF]/10"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>

          <Button
            onClick={handleSaveSettings}
            className="bg-[#6B8EFF] hover:bg-[#6B8EFF]/90"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
