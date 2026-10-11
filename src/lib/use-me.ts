import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/lib/session";
import { getMe } from "@/lib/citizen";

export function useMe() {
  const { session } = useSession();
  const fn = getMe;
  return useQuery({
    queryKey: ["me", session?.id],
    queryFn: () => fn({ data: session! }),
    enabled: !!session,
  });
}
