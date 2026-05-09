import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Form } from "@/lib/types";
import { toast } from "sonner";

interface Props {
  form: Form;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function ShareDialog({ form, open, onOpenChange }: Props) {
  const [copied, setCopied] = useState<string | null>(null);
  const url = `${location.origin}${import.meta.env.BASE_URL}#/f/${form.slug}`;
  const embed = `<iframe src="${url}" width="640" height="800" frameborder="0"></iframe>`;

  function copy(label: string, val: string) {
    navigator.clipboard.writeText(val);
    setCopied(label);
    toast.success(`${label} copied`);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Share this form</DialogTitle>
          <DialogDescription>Anyone with the link can submit a response.</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="link">
          <TabsList>
            <TabsTrigger value="link">Public link</TabsTrigger>
            <TabsTrigger value="embed">Embed</TabsTrigger>
            <TabsTrigger value="qr">QR code</TabsTrigger>
          </TabsList>
          <TabsContent value="link" className="space-y-3">
            <div>
              <Label>Direct URL</Label>
              <div className="mt-1.5 flex gap-2">
                <Input readOnly value={url} className="font-mono text-xs" />
                <Button variant="outline" onClick={() => copy("Link", url)}>
                  {copied === "Link" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  Copy
                </Button>
              </div>
            </div>
            <Button asChild variant="outline" className="w-full">
              <a href={url} target="_blank" rel="noreferrer">Open in new tab</a>
            </Button>
          </TabsContent>
          <TabsContent value="embed" className="space-y-3">
            <Label>Iframe snippet</Label>
            <Textarea readOnly value={embed} className="font-mono text-xs" rows={4} />
            <Button variant="outline" onClick={() => copy("Embed code", embed)}>
              {copied === "Embed code" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              Copy embed
            </Button>
          </TabsContent>
          <TabsContent value="qr">
            <div className="grid place-items-center py-6">
              <img
                alt="QR"
                className="h-44 w-44 rounded-lg border bg-white p-2"
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(url)}`}
              />
              <p className="mt-3 text-xs text-muted-foreground">Scanning this opens the public form.</p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
