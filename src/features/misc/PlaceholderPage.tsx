import { ConstructionIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface Props {
  title: string;
  description: string;
  hint?: string;
}

export function PlaceholderPage({ title, description, hint }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Workspace</div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="rounded-2xl border border-dashed bg-card p-16 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-muted">
          <ConstructionIcon className="h-5 w-5 text-muted-foreground" />
        </div>
        <h3 className="mt-3 text-base font-semibold">UI mock — not implemented</h3>
        <p className="mt-1 text-sm text-muted-foreground">{hint ?? "This screen is wired into routing but doesn't have content yet."}</p>
        <div className="mt-4 flex justify-center gap-2">
          <Button asChild variant="outline"><Link to="/">Back to dashboard</Link></Button>
          <Button asChild><Link to="/forms">Open forms</Link></Button>
        </div>
      </div>
    </div>
  );
}
