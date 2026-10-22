import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { PhoneFrame } from "@/components/app/MobileShell";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { settingsQuery, fallbacks } from "@/lib/content";
import { useI18n, type Key } from "@/lib/i18n";
import { useSession, getDeviceId } from "@/lib/session";
import { registerCitizen, CitizenError } from "@/lib/citizen";
import { registerSchema, toAsciiDigits } from "@/lib/validation";
import { SafeImage } from "@/components/app/SafeImage";
import { LangToggle } from "@/components/app/LangToggle";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register — Digital Ward" },
      { name: "description", content: "Join Digital Ward to receive updates from Rajendra Janjal." },
      { property: "og:title", content: "Register — Digital Ward" },
      { property: "og:description", content: "Join Digital Ward to receive ward updates." },
    ],
  }),
  component: Register,
});

function Register() {
  const { t } = useI18n();
  const { data } = useQuery(settingsQuery);
  const { session, ready, setSession } = useSession();
  const navigate = useNavigate();
  const register = registerCitizen;
  const [form, setForm] = useState({ name: "", mobile: "", address: "", dob: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && session) navigate({ to: "/home", replace: true });
  }, [ready, session, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const parsed = registerSchema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const k = String(issue.path[0]);
        if (!errs[k]) errs[k] = t(issue.message as Key);
      }
      setErrors(errs);
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      // parsed.data is trimmed/cleaned (ASCII digits, single spaces)
      const res = await register({ data: { ...parsed.data, device_id: getDeviceId() } });
      setSession({ id: res.id, token: res.token });
      navigate({ to: "/home", replace: true });
    } catch (err) {
      const kind = err instanceof CitizenError ? err.kind : "other";
      const msg = (err as Error)?.message ?? "";
      const validationKey: Key =
        /invalid_name/.test(msg) ? "nameInvalid"
        : /invalid_address/.test(msg) ? "addressShort"
        : "dobInvalid";
      toast.error(
        kind === "network" ? t("errNetwork")
        : kind === "permission" ? t("errPermission")
        : kind === "mobile" ? t("errMobile")
        : kind === "exists" ? t("errExists")
        : kind === "limited" ? t("errLimited")
        : kind === "validation" ? t(validationKey)
        : t("loadError"),
      );
    } finally {
      setBusy(false);
    }
  };

  const field = (k: keyof typeof form) => ({
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const v = e.target.value;
      setForm({ ...form, [k]: k === "mobile" ? toAsciiDigits(v).replace(/\D/g, "").slice(0, 10) : v });
      if (errors[k]) setErrors({ ...errors, [k]: "" });
    },
  });

  return (
    <PhoneFrame>
      <div className="min-h-dvh bg-splash-cream">
      <div className="relative h-[50vh] min-h-[320px] w-full overflow-hidden">
        <SafeImage
          src={data?.leader_photo_url ?? fallbacks.leader}
          fallback={fallbacks.leader}
          priority
          alt="Rajendra Janjal"
          className="h-full w-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-fade" />
        <div className="absolute right-3 top-3"><LangToggle /></div>
      </div>
      <form onSubmit={submit} noValidate className="relative -mt-10 space-y-4 px-5 pb-10">
        <div className="animate-rise">
          <h1 className="font-display text-3xl font-extrabold leading-tight text-foreground">{t("welcome")}</h1>
          <p className="mt-1 font-medium text-foreground/75">{t("welcomeSub")}</p>
        </div>
        <Field label={t("fullName")} error={errors["name"]}>
          <Input className="h-12 text-base" autoComplete="name" maxLength={60} {...field("name")} />
        </Field>
        <Field label={t("mobile")} error={errors["mobile"]}>
          <Input className="h-12 text-base" inputMode="numeric" type="tel" maxLength={10} placeholder="98XXXXXXXX" {...field("mobile")} />
        </Field>
        <Field label={t("address")} error={errors["address"]}>
          <Textarea className="min-h-20 text-base" maxLength={200} {...field("address")} />
        </Field>
        <Field label={t("dob")} error={errors["dob"]}>
          <Input
            className="h-12 text-base"
            type="date"
            min="1900-01-01"
            max={new Date().toISOString().slice(0, 10)}
            {...field("dob")}
          />
        </Field>
        <Button type="submit" variant="saffron" size="xl" className="w-full" disabled={busy}>
          {busy && <Loader2 className="animate-spin" />}
          {t("register")}
        </Button>
      </form>
      </div>
    </PhoneFrame>
  );
}

function Field({ label, error, children }: { label: string; error?: string | undefined; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-base">{label}</Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}