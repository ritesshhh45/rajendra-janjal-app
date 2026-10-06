import { useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadImage, removeImage, errMsg } from "@/lib/admin";

export function ImageField({ value, onChange, folder }: { value: string | null | undefined; onChange: (v: string | null) => void; folder: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const pick = async (f?: File) => {
    if (!f) return;
    setBusy(true);
    try { onChange(await uploadImage(f, folder)); } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-muted">
        {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <span className="text-xs text-muted-foreground">None</span>}
      </div>
      <input ref={ref} type="file" accept="image/*" hidden onChange={(e) => pick(e.target.files?.[0])} />
      <Button type="button" variant="outline" onClick={() => ref.current?.click()} disabled={busy}>
        {busy ? <Loader2 className="animate-spin" /> : <Upload />} Upload
      </Button>
      {value && (
        <Button type="button" variant="ghost" onClick={async () => { await removeImage(value).catch(() => {}); onChange(null); }}>
          <X /> Remove
        </Button>
      )}
    </div>
  );
}
