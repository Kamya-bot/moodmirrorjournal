import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import ErrorBoundary from "@/components/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import { Loader2 } from "lucide-react";

const Index = lazy(() => import("./pages/Index"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const CalendarPage = lazy(() => import("./pages/CalendarPage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const AchievementsPageRoute = lazy(() => import("./pages/AchievementsPageRoute"));
const FavoritesPage = lazy(() => import("./pages/FavoritesPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const ChallengesPage = lazy(() => import("./pages/ChallengesPage"));
const VaultPage = lazy(() => import("./pages/VaultPage"));
const RemindersPage = lazy(() => import("./pages/RemindersPage"));
const CollectionsPage = lazy(() => import("./pages/CollectionsPageRoute"));
const PromptLibraryPage = lazy(() => import("./pages/PromptLibraryPage"));
const ProgressPage = lazy(() => import("./pages/ProgressPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

function ProtectedPage({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute><AppLayout>{children}</AppLayout></ProtectedRoute>;
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  <Route path="/" element={<ProtectedPage><Index /></ProtectedPage>} />
                  <Route path="/dashboard" element={<ProtectedPage><DashboardPage /></ProtectedPage>} />
                  <Route path="/calendar" element={<ProtectedPage><CalendarPage /></ProtectedPage>} />
                  <Route path="/search" element={<ProtectedPage><SearchPage /></ProtectedPage>} />
                  <Route path="/achievements" element={<ProtectedPage><AchievementsPageRoute /></ProtectedPage>} />
                  <Route path="/favorites" element={<ProtectedPage><FavoritesPage /></ProtectedPage>} />
                  <Route path="/challenges" element={<ProtectedPage><ChallengesPage /></ProtectedPage>} />
                  <Route path="/vault" element={<ProtectedPage><VaultPage /></ProtectedPage>} />
                  <Route path="/reminders" element={<ProtectedPage><RemindersPage /></ProtectedPage>} />
                  <Route path="/collections" element={<ProtectedPage><CollectionsPage /></ProtectedPage>} />
                  <Route path="/prompts" element={<ProtectedPage><PromptLibraryPage /></ProtectedPage>} />
                  <Route path="/progress" element={<ProtectedPage><ProgressPage /></ProtectedPage>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
