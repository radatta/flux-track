import type React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Activity,
  Camera,
  Target,
  TrendingUp,
  Timer,
  Zap,
} from "lucide-react";
import OneTapComponent from "@/components/OneTapComponent";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FF] text-[#2D3748]">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-[#6B8EFF] to-[#A0D8FF] bg-clip-text text-transparent">
            Perfect your rehab. Track your progress.
          </h1>
          <p className="text-lg md:text-xl mb-8 text-[#2D3748]/80">
            FluxTrack provides real-time exercise feedback using AI-powered pose detection
            to help you recover faster and more effectively.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              className="bg-[#6B8EFF] hover:bg-[#6B8EFF]/90 text-white px-8 py-6 rounded-lg text-lg"
            >
              <Link href="/auth/signup">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-[#6B8EFF] text-[#6B8EFF] hover:bg-[#6B8EFF]/10 px-8 py-6 rounded-lg text-lg"
            >
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      <OneTapComponent />

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Why FluxTrack?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Camera className="h-8 w-8 text-[#6B8EFF]" />}
            title="Real-Time Pose Detection"
            description="Get instant feedback on your exercise form using advanced AI pose estimation."
          />
          <FeatureCard
            icon={<Target className="h-8 w-8 text-[#6B8EFF]" />}
            title="Exercise Accuracy"
            description="Receive precise feedback on your posture and movement quality during exercises."
          />
          <FeatureCard
            icon={<Timer className="h-8 w-8 text-[#6B8EFF]" />}
            title="Session Tracking"
            description="Monitor your exercise sessions with detailed rep counting and hold-time measurements."
          />
          <FeatureCard
            icon={<Activity className="h-8 w-8 text-[#6B8EFF]" />}
            title="Exercise Library"
            description="Access a comprehensive library of rehabilitation exercises with video instructions."
          />
          <FeatureCard
            icon={<TrendingUp className="h-8 w-8 text-[#6B8EFF]" />}
            title="Progress Analytics"
            description="Track your improvement over time with detailed progress reports and insights."
          />
          <FeatureCard
            icon={<Zap className="h-8 w-8 text-[#6B8EFF]" />}
            title="Instant Feedback"
            description="Get immediate visual and audio feedback to correct your form in real-time."
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-r from-[#6B8EFF]/10 to-[#A0D8FF]/10 p-8 md:p-12 rounded-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Start your recovery journey today
          </h2>
          <p className="text-lg mb-8">
            Join thousands of others who are improving their rehabilitation outcomes with
            AI-powered exercise guidance.
          </p>
          <Button
            asChild
            className="bg-[#6B8EFF] hover:bg-[#6B8EFF]/90 text-white px-8 py-6 rounded-lg text-lg"
          >
            <Link href="/auth/signup">
              Create your account <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-[#6B8EFF]/10">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-[#2D3748]/60 mb-4 md:mb-0">
            © 2025 FluxTrack. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/terms" className="text-[#2D3748]/60 hover:text-[#6B8EFF]">
              Terms
            </Link>
            <Link href="/privacy" className="text-[#2D3748]/60 hover:text-[#6B8EFF]">
              Privacy
            </Link>
            <Link href="/contact" className="text-[#2D3748]/60 hover:text-[#6B8EFF]">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-[#6B8EFF]/10">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-[#2D3748]/70">{description}</p>
    </div>
  );
}
