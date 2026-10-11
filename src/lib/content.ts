import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
// Images live in /public/images and are served from the site root on any host.
export const fallbacks = {
  leader: "/images/leader-saffron.jpg",
  splash: "/images/leader-white.jpg",
  header: "/images/leader-cap-side.jpg",
  logo: "/images/shiv-sena-logo.webp",
};

/** Pick the Marathi or English variant of a bilingual value. */
export function useL() {
  const { lang } = useI18n();
  return (mr?: string | null, en?: string | null) => (lang === "mr" ? mr || en : en || mr) ?? "";
}

export const settingsQuery = queryOptions({
  queryKey: ["settings"],
  queryFn: async () => {
    const { data } = await supabase.from("app_settings").select("*").eq("id", 1).maybeSingle();
    return {
      name_mr: data?.name_mr ?? "राजेंद्र जंजाळ",
      name_en: data?.name_en ?? "Rajendra Janjal",
      designation_mr: data?.designation_mr ?? "उपमहापौर व जिल्हाप्रमुख",
      designation_en: data?.designation_en ?? "Deputy Mayor & District Chief",
      ward_mr: data?.ward_mr ?? "प्रभाग क्र. २२",
      ward_en: data?.ward_en ?? "Ward No. 22",
      slogan_mr: data?.slogan_mr ?? "",
      slogan_en: data?.slogan_en ?? "",
      tagline_mr: data?.tagline_mr ?? "",
      tagline_en: data?.tagline_en ?? "",
      party_name_mr: data?.party_name_mr ?? "शिवसेना",
      party_name_en: data?.party_name_en ?? "Shiv Sena",
      office_address: data?.office_address ?? "",
      office_phone: data?.office_phone ?? "",
      office_whatsapp: data?.office_whatsapp ?? "",
      office_lat: data?.office_lat ?? null,
      office_lng: data?.office_lng ?? null,
      splash_photo_url: data?.splash_photo_url || fallbacks.splash,
      header_photo_url: data?.header_photo_url || fallbacks.header,
      leader_photo_url: data?.leader_photo_url || fallbacks.leader,
      party_logo_url: data?.party_logo_url || fallbacks.logo,
    };
  },
  staleTime: 60_000,
  retry: 1,
});
export type Settings = Awaited<ReturnType<typeof settingsQuery.queryFn & {}>>;

export const useSettings = () => useQuery(settingsQuery);

/** Mount once (root): refreshes settings and updates live when the admin changes them. */
export function useLiveContent() {
  const qc = useQueryClient();
  useEffect(() => {
    const ch = supabase
      .channel(`live-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "app_settings" }, () =>
        qc.invalidateQueries({ queryKey: ["settings"] }),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "updates" }, () =>
        qc.invalidateQueries({ queryKey: ["updates"] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [qc]);
}

export const waLink = (num: string, text = "") =>
  `https://wa.me/${num.replace(/\D/g, "").replace(/^(\d{10})$/, "91$1")}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
export const mapsLink = (s: Settings) =>
  s.office_lat != null && s.office_lng != null
    ? `https://www.google.com/maps/search/?api=1&query=${s.office_lat},${s.office_lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.office_address)}`;

const list = <T,>(key: string, fn: () => PromiseLike<{ data: T[] | null; error: unknown }>) =>
  queryOptions({
    queryKey: [key],
    queryFn: async () => {
      const { data, error } = await fn();
      if (error) throw error;
      return data ?? [];
    },
    retry: 1,
  });

export const schemesQuery = list("schemes", () =>
  supabase.from("schemes").select("*").order("sort_order").order("created_at", { ascending: false }),
);
export const galleryQuery = list("gallery", () =>
  supabase.from("gallery").select("*").order("sort_order").order("created_at", { ascending: false }),
);
export const noticesQuery = list("notices", () =>
  supabase.from("notifications").select("*").order("created_at", { ascending: false }),
);
export const updatesQuery = list("updates", () =>
  supabase.from("updates").select("*").order("created_at", { ascending: false }),
);
export const worksQuery = list("works", () => supabase.from("works").select("*").order("sort_order"));
export const categoriesQuery = list("categories", () =>
  supabase.from("service_categories").select("*").eq("active", true).order("sort_order"),
);

const SEEN = "dw_seen_at";
export function markSeen() {
  localStorage.setItem(SEEN, new Date().toISOString());
}
export function useUnread() {
  const u = useQuery(updatesQuery).data ?? [];
  const n = useQuery(noticesQuery).data ?? [];
  if (typeof window === "undefined") return 0;
  const seen = localStorage.getItem(SEEN) ?? "1970";
  return [...u, ...n].filter((x) => x.created_at > seen).length;
}
