import ProfileShell from "@/components/shared/profile/ProfileShell";
import { SiteSettingsProvider } from "@/contexts/siteSettingsContext";

export default function UserLayout({ children }) {
  return (
    <SiteSettingsProvider>
      <ProfileShell>{children}</ProfileShell>
    </SiteSettingsProvider>
  );
}
