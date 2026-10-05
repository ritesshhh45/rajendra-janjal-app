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
import { useI18n } from "@/lib/i18n";
import { useSession, getDeviceId } from "@/lib/session";
import { registerCitizen } from "@/lib/citizen";
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
    const errs: Record<string, string> = {};
    if (form.name.trim().length < 2) errs["name"] = t("required");
    if (!/^[6-9]\d{9}$/.test(form.mobile)) errs["mobile"] = t("mobileInvalid");
    if (form.address.trim().length < 3) errs["address"] = t("required");
    if (!form.dob) errs["dob"] = t("required");
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      const res = await register({ data: { ...form, device_id: getDeviceId() } });
      setSession({ id: res.id, token: res.token });
      navigate({ to: "/home", replace: true });
    } catch (err) {
      const kind = err instanceof CitizenError ? err.kind : "other";
      toast.error(
        kind === "network" ? t("errNetwork")
        : kind === "permission" ? t("errPermission")
        : kind === "mobile" ? t("errMobile")
        : (err as Error)?.message || t("loadError"),
      );
    } finally {
      setBusy(false);
    }
  };

  const field = (k: keyof typeof form) => ({
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm({ ...form, [k]: k === "mobile" ? e.target.value.replace(/\D/g, "").slice(0, 10) : e.target.value }),
  });

  return (
    <PhoneFrame>
      <div className="min-h-dvh bg-splash-cream">
      <div className="relative h-[50vh] min-h-[320px] w-full overflow-hidden">
        <img
          src={data?.leader_photo_url ?? fallbacks.leader}
          alt="Rajendra Janjal"
          className="h-full w-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-fade" />
        <div className="absolute right-3 top-3"><LangToggle /></div>
      </div>
      <form onSubmit={submit} className="relative -mt-10 space-y-4 px-5 pb-10">
        <div className="animate-rise">
          <h1 className="font-display text-3xl font-extrabold leading-tight text-foreground">{t("welcome")}</h1>
          <p className="mt-1 font-medium text-foreground/75">{t("welcomeSub")}</p>
        </div>
        <Field label={t("fullName")} error={errors["name"]}>
          <Input className="h-12 text-base" autoComplete="name" {...field("name")} />
        </Field>
        <Field label={t("mobile")} error={errors["mobile"]}>
          <Input className="h-12 text-base" inputMode="numeric" type="tel" placeholder="98XXXXXXXX" {...field("mobile")} />
        </Field>
        <Field label={t("address")} error={errors["address"]}>
          <Textarea className="min-h-20 text-base" {...field("address")} />
        </Field>
        <Field label={t("dob")} error={errors["dob"]}>
          <Input className="h-12 text-base" type="date" max={new Date().toISOString().slice(0, 10)} {...field("dob")} />
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
