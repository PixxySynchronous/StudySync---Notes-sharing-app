import { ReactNode } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex">
      {/* Theme toggle */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="hover:bg-muted"
        >
          {theme === "dark" ? 
            <Sun className="h-5 w-5" /> : 
            <Moon className="h-5 w-5" />
          }
        </Button>
      </div>

      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-8">
        <div className="mx-auto max-w-md text-center">
          <div className="flex justify-center mb-8">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-hero shadow-lg">
              <BookOpen className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gradient mb-4">StudySync</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Your ultimate study companion for organizing, managing, and sharing notes with ease.
          </p>
          <div className="mt-8 space-y-4 text-left">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-primary"></div>
              <span className="text-sm text-muted-foreground">Organize your study materials</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-primary"></div>
              <span className="text-sm text-muted-foreground">Share notes with classmates</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-primary"></div>
              <span className="text-sm text-muted-foreground">Access anywhere, anytime</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="mx-auto w-full max-w-sm lg:max-w-md">
          {/* Mobile branding */}
          <div className="flex justify-center mb-8 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-hero">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gradient">StudySync</span>
            </div>
          </div>
          
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;