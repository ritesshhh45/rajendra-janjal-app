import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, Loader2, LogOut } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { errMsg } from "@/lib/admin";
import { CrudTab } from "@/components/admin/CrudTab";
import { SettingsTab } from "@/components/admin/SettingsTab";
import { CitizensTab } from "@/components/admin/CitizensTab";
import { NoticesTab } from "@/components/admin/NoticesTab";
import { GalleryTab } from "@/components/admin/GalleryTab";
import { AdminsTab } from "@/components/admin/AdminsTab";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin panel — Digital Ward" },
      { name: "description", content: "Manage Digital Ward content, citizens and notifications." },
      { property: "og:title", content: "Admin panel — Digital Ward" },
      { property: "og:description", content: "Digital Ward admin panel." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

const TABS = ["Settings", "Updates", "Works", "Schemes", "Categories", "Citizens", "Notices", "Gallery", "Admins"] as const;
type Tab = (typeof TABS)[number];

function Admin() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((ev, s) => {
      if (ev === "SIGNED_IN" || ev === "SIGNED_OUT" || ev === "USER_UPDATED" || ev === "PASSWORD_RECOVERY") setSession(s);
    });
    return () => data.subscription.unsubscribe();
  }, []);
  if (session === undefined) return <Center><Loader2 className="animate-spin" /></Center>;
  if (!session) return <AuthForm />;
  return <Panel session={session} />;
}

function Center({ children }: { children: React.ReactNode }) {
  return <main className="grid min-h-dvh place-items-center bg-splash-cream p-5">{children}</main>;
}

function AuthForm() {
  const [mode, setMode] = useState<"login" | "signup" | "forgot" | "reset">(
    typeof window !== "undefined" && window.location.hash.includes("type=recovery") ? "reset" : "login",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const redirect = typeof window !== "undefined" ? `${window.location.origin}/admin` : "/admin";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: redirect } });
        if (error) throw error;
        if (!data.session) toast.success("Check your email to confirm the account, then log in.");
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: redirect });
        if (error) throw error;
        toast.success("Password reset link sent to your email.");
      } else {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        toast.success("Password updated");
        window.location.hash = "";
      }
    } catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
  };

  const title = { login: "Admin login", signup: "Create admin account", forgot: "Forgot password", reset: "Set new password" }[mode];
  return (
    <Center>
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-3xl bg-card p-6 shadow-card">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground"><ChevronLeft className="h-4 w-4" /> App</Link>
        <h1 className="font-display text-2xl font-bold">{title}</h1>
        {mode !== "reset" && <div className="space-y-1.5"><Label>Email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></div>}
        {mode !== "forgot" && <div className="space-y-1.5"><Label>Password</Label><Input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} /></div>}
        <Button type="submit" variant="saffron" size="xl" className="w-full" disabled={busy}>{busy && <Loader2 className="animate-spin" />} {mode === "login" ? "Log in" : mode === "signup" ? "Create account" : mode === "forgot" ? "Send reset link" : "Save password"}</Button>
        <div className="flex justify-between text-sm">
          {mode === "login" ? <>
            <button type="button" className="text-primary" onClick={() => setMode("signup")}>Create account</button>
            <button type="button" className="text-primary" onClick={() => setMode("forgot")}>Forgot password?</button>
          </> : <button type="button" className="text-primary" onClick={() => setMode("login")}>Back to login</button>}
        </div>
      </form>
    </Center>
  );
}

function Panel({ session }: { session: Session }) {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab | null>(null);
  const me = useQuery({
    queryKey: ["admin", "me", session.user.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("claim_admin");
      if (error) throw error;
      return data as unknown as { approved: boolean; is_primary: boolean };
    },
  });
  const logout = async () => { await supabase.auth.signOut(); qc.removeQueries({ queryKey: ["admin"] }); };

  const header = (
    <header className="sticky top-0 z-20 flex items-center gap-2 border-b bg-background/95 px-4 py-3 backdrop-blur">
      {tab ? <Button size="icon" variant="ghost" aria-label="Back" onClick={() => setTab(null)}><ChevronLeft /></Button> : null}
      <div className="min-w-0 flex-1">
        <h1 className="font-display text-xl font-bold leading-tight">{tab ?? "Admin panel"}</h1>
        <p className="truncate text-xs text-muted-foreground">{session.user.email}</p>
      </div>
      <Button variant="outline" size="sm" onClick={logout}><LogOut /> Log out</Button>
    </header>
  );

  if (me.isLoading) return <Center><Loader2 className="animate-spin" /></Center>;
  if (me.error || !me.data?.approved) {
    return (
      <div className="min-h-dvh bg-splash-cream">{header}
        <div className="mx-auto max-w-md p-6 text-center">
          <p className="font-display text-lg font-bold">{me.error ? errMsg(me.error) : "Waiting for approval"}</p>
          <p className="mt-2 text-muted-foreground">The primary admin must approve your account in the Admins tab.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-splash-cream">
      {header}
      <div className="mx-auto max-w-3xl p-4">
        <nav className="mb-4 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <Button key={t} variant={tab === t ? "saffron" : "outline"} className="rounded-full" onClick={() => setTab(t)}>{t}</Button>
          ))}
        </nav>
        {!tab && <p className="text-muted-foreground">Choose a section above.</p>}
        {tab === "Settings" && <SettingsTab />}
        {tab === "Updates" && <CrudTab table="updates" invalidate="updates" folder="updates" titleKey="title_en" subKey="title_mr" fields={[
          { key: "title_mr", label: "Title (मराठी)" }, { key: "title_en", label: "Title (English)" },
          { key: "body_mr", label: "Text (मराठी)", type: "textarea" }, { key: "body_en", label: "Text (English)", type: "textarea" },
          { key: "category_mr", label: "Category (मराठी)" }, { key: "category_en", label: "Category (English)" },
          { key: "is_alert", label: "Important alert", type: "bool" },
        ]} />}
        {tab === "Works" && <CrudTab table="works" invalidate="works" folder="works" titleKey="title_en" subKey="status_en" order="sort_order" ascending fields={[
          { key: "title_mr", label: "Title (मराठी)" }, { key: "title_en", label: "Title (English)" },
          { key: "description_mr", label: "Description (मराठी)", type: "textarea" }, { key: "description_en", label: "Description (English)", type: "textarea" },
          { key: "status_mr", label: "Status (मराठी)" }, { key: "status_en", label: "Status (English)" },
          { key: "photo_url", label: "Photo", type: "image" }, { key: "sort_order", label: "Order", type: "number" },
        ]} />}
        {tab === "Schemes" && <CrudTab table="schemes" invalidate="schemes" folder="schemes" titleKey="title_en" subKey="title_mr" order="sort_order" ascending fields={[
          { key: "title_mr", label: "Title (मराठी)" }, { key: "title_en", label: "Title (English)" },
          { key: "description_mr", label: "Description (मराठी)", type: "textarea" }, { key: "description_en", label: "Description (English)", type: "textarea" },
          { key: "eligibility", label: "Eligibility", type: "textarea" }, { key: "how_to_apply", label: "How to apply", type: "textarea" },
          { key: "apply_link", label: "Apply link", type: "url" }, { key: "image_url", label: "Image", type: "image" },
          { key: "icon", label: "Icon name (optional)" }, { key: "sort_order", label: "Order", type: "number" },
        ]} />}
        {tab === "Categories" && <CrudTab table="service_categories" invalidate="categories" folder="categories" titleKey="name_en" subKey="name_mr" order="sort_order" ascending fields={[
          { key: "name_mr", label: "Name (मराठी)" }, { key: "name_en", label: "Name (English)" },
          { key: "icon", label: "Icon name (e.g. Wrench, Droplet, Lightbulb)" }, { key: "sort_order", label: "Order", type: "number" },
          { key: "active", label: "Active", type: "bool" },
        ]} />}
        {tab === "Citizens" && <CitizensTab />}
        {tab === "Notices" && <NoticesTab />}
        {tab === "Gallery" && <GalleryTab />}
        {tab === "Admins" && <AdminsTab isPrimary={!!me.data.is_primary} />}
      </div>
    </div>
  );
}
