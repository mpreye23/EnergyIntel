import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  Lightbulb,
  Home,
  BarChart3,
  Trophy,
  ArrowRight,
  Check,
} from "lucide-react";

const tutorialSteps = [
  {
    title: "Welcome to EcoSync",
    description: "Let's get started with managing your home energy usage smartly!",
    icon: Home,
    content: [
      "Monitor your devices in real-time",
      "Get AI-powered recommendations",
      "Track your energy savings",
      "Compete with other users",
    ],
  },
  {
    title: "Device Management",
    description: "Add and organize your smart devices by rooms",
    icon: Lightbulb,
    content: [
      "Add devices using the 'Add Device' button",
      "Group devices by rooms for better organization",
      "Control devices with simple toggles",
      "Monitor real-time energy usage",
    ],
  },
  {
    title: "Energy Analytics",
    description: "Track and understand your energy consumption",
    icon: BarChart3,
    content: [
      "View daily energy usage patterns",
      "Identify peak consumption hours",
      "Compare usage across devices",
      "Set energy-saving goals",
    ],
  },
  {
    title: "Leaderboard & Rewards",
    description: "Compete and earn points for energy savings",
    icon: Trophy,
    content: [
      "Earn points for reducing energy usage",
      "Compare your progress with others",
      "Get rewarded for consistent savings",
      "Share your achievements",
    ],
  },
];

interface TutorialProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EnergyTutorial({ open, onOpenChange }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

  const CurrentIcon = tutorialSteps[currentStep].icon;

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-full bg-primary/10">
              <CurrentIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle>{tutorialSteps[currentStep].title}</DialogTitle>
              <DialogDescription>
                {tutorialSteps[currentStep].description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {tutorialSteps[currentStep].content.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Check className="h-4 w-4 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">{item}</p>
            </div>
          ))}
        </div>

        <DialogFooter className="mt-6">
          <div className="w-full space-y-4">
            <Progress value={progress} />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {tutorialSteps.length}
              </span>
              <Button onClick={handleNext}>
                {currentStep === tutorialSteps.length - 1 ? (
                  "Get Started"
                ) : (
                  <>
                    Next Step
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
