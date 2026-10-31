import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * UI-only hint: true when the signed-in Supabase user is an APPROVED admin.
 * Citizens never have a Supabase session, so for them this is always false.
 * Real protection is the database (RLS policies use is_admin()), not this hook.
 */
export function useIsAdmin() {
  return useQuery({
    queryKey: ["is-admin"],
    staleTime: 5 * 60_000,
    retry: false,
    queryFn: async () => {
      const { data: s } = await supabase.auth.getSession();
      const uid = s.session?.user.id;
      if (!uid) return false;
      const { data } = await supabase.from("admins").select("approved").eq("user_id", uid).maybeSingle();
      return !!data?.approved;
    },
  });
}
