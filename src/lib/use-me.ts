import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useSession } from "@/lib/session";
import { getMe } from "@/lib/citizen.functions";

export function useMe() {
  const { session } = useSession();
  const fn = useServerFn(getMe);
  return useQuery({
    queryKey: ["me", session?.id],
    queryFn: () => fn({ data: session! }),
    enabled: !!session,
  });
}
