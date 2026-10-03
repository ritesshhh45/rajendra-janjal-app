import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import leader from "@/assets/leader.jpg.asset.json";
import banner from "@/assets/leader-banner.jpg.asset.json";
import splash from "@/assets/splash.jpg.asset.json";

export const fallbacks = { leader: leader.url, banner: banner.url, splash: splash.url };

export const settingsQuery = queryOptions({
  queryKey: ["settings"],
  queryFn: async () => {
    const { data } = await supabase.from("app_settings").select("*").eq("id", 1).maybeSingle();
    return {
      leader_name: data?.leader_name ?? "Rajendra Janjal",
      leader_title: data?.leader_title ?? "Deputy Mayor & District Chief, Shiv Sena",
      header_image_url: data?.header_image_url || fallbacks.banner,
      leader_photo_url: data?.leader_photo_url || fallbacks.leader,
      splash_logo_url: data?.splash_logo_url || fallbacks.splash,
    };
  },
  staleTime: 60_000,
});

/** Settings with live updates when the admin changes them. */
export function useSettings() {
  const qc = useQueryClient();
  useEffect(() => {
    const ch = supabase
      .channel("app_settings")
      .on("postgres_changes", { event: "*", schema: "public", table: "app_settings" }, () =>
        qc.invalidateQueries({ queryKey: ["settings"] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [qc]);
  return useQuery(settingsQuery);
}

export const schemesQuery = queryOptions({
  queryKey: ["schemes"],
  queryFn: async () => {
    const { data, error } = await supabase.from("schemes").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});

export const galleryQuery = queryOptions({
  queryKey: ["gallery"],
  queryFn: async () => {
    const { data, error } = await supabase.from("gallery").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});

export const notificationsQuery = queryOptions({
  queryKey: ["notifications"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});
