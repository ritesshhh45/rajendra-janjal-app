import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/app/MobileShell";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Digital Ward" },
      { name: "description", content: "How Digital Ward collects and uses your personal information." },
      { property: "og:title", content: "Privacy Policy — Digital Ward" },
      { property: "og:description", content: "How Digital Ward uses your information." },
    ],
  }),
  component: () => (
    <MobileShell title="Privacy Policy" back requireSession={false}>
      <div className="space-y-4 p-5 leading-relaxed">
        <p><b>What we collect.</b> When you register we collect your name, mobile number, address and date of birth, plus a device notification token so we can reach your phone.</p>
        <p><b>Why.</b> This information is used only to send you ward updates, announcements and government scheme information from the office of Rajendra Janjal, and to send you birthday wishes.</p>
        <p><b>Sharing.</b> We do not sell or share your information with third parties. Notifications are delivered through Google Firebase Cloud Messaging.</p>
        <p><b>Storage.</b> Your data is stored securely and accessible only to authorised ward office staff.</p>
        <p><b>Your choices.</b> You can edit your details or permanently delete your account and all associated data at any time from the Profile screen.</p>
        <p><b>Contact.</b> For questions, contact the ward office, Chhatrapati Sambhajinagar.</p>
      </div>
    </MobileShell>
  ),
});
