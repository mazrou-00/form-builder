import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { useStore } from "@/lib/store";
import { AppShell } from "@/layout/AppShell";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { FormsListPage } from "@/features/forms/FormsListPage";
import { BuilderPage } from "@/features/builder/BuilderPage";
import { FillerPage } from "@/features/filler/FillerPage";
import { ThanksPage } from "@/features/filler/ThanksPage";
import { FormResponsesPage } from "@/features/responses/FormResponsesPage";
import { AllResponsesPage } from "@/features/responses/AllResponsesPage";
import { PlaceholderPage } from "@/features/misc/PlaceholderPage";

export default function App() {
  const theme = useStore((s) => s.appTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  return (
    <TooltipProvider delayDuration={150}>
      <Routes>
        {/* Public routes — no admin shell */}
        <Route path="/f/:slug" element={<FillerPage />} />
        <Route path="/preview/:id" element={<FillerPage previewById />} />
        <Route path="/thanks/:formId/:responseId" element={<ThanksPage />} />

        {/* Admin routes — wrapped in AppShell */}
        <Route element={<AppShell />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/forms" element={<FormsListPage />} />
          <Route path="/forms/:id/responses" element={<FormResponsesPage />} />
          <Route path="/builder/:id" element={<BuilderPage />} />
          <Route path="/responses" element={<AllResponsesPage />} />
          <Route
            path="/analytics"
            element={
              <PlaceholderPage
                title="Analytics"
                description="Cross-form metrics, funnel analysis, drop-off charts."
                hint="The dashboard already shows aggregated charts. A deeper drill-down view goes here next."
              />
            }
          />
          <Route
            path="/settings"
            element={
              <PlaceholderPage
                title="Settings"
                description="Workspace, billing, team members, integrations."
              />
            }
          />
          <Route
            path="/help"
            element={
              <PlaceholderPage
                title="Help & docs"
                description="Guides, FAQs, contact support."
              />
            }
          />
          <Route
            path="*"
            element={<PlaceholderPage title="Not found" description="That page doesn't exist." />}
          />
        </Route>
      </Routes>
      <Toaster />
    </TooltipProvider>
  );
}
