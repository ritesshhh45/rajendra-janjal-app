import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/app/MobileShell";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use — Digital Ward" },
      { name: "description", content: "Terms for using the Digital Ward app." },
      { property: "og:title", content: "Terms of Use — Digital Ward" },
      { property: "og:description", content: "Terms for using the Digital Ward app." },
    ],
  }),
  component: () => (
    <MobileShell title="Terms of Use" back requireSession={false}>
      <div className="space-y-4 p-5 leading-relaxed">
        <p>Digital Ward is an information service from the office of Rajendra Janjal. By registering you agree to provide accurate details.</p>
        <p>Scheme information is provided for guidance; please confirm eligibility on official government portals before applying.</p>
        <p>Do not misuse the app or register on behalf of others without consent. We may remove accounts that violate these terms.</p>
        <p>These terms may be updated; continued use means you accept the latest version.</p>
      </div>
    </MobileShell>
  ),
});
