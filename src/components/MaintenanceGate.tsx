import { ReactNode, lazy, Suspense } from "react";
import { useMaintenanceMode } from "@/hooks/useMaintenanceMode";
import { useUserRole } from "@/hooks/useUserRole";
import { PageLoader } from "@/components/ui/PageLoader";

const Maintenance = lazy(() => import("@/pages/Maintenance"));

export const MaintenanceGate = ({ children }: { children: ReactNode }) => {
  const { isMaintenanceMode, loading: maintenanceLoading } = useMaintenanceMode();
  const { isAdmin, loading: roleLoading } = useUserRole();

  // Don't block while loading
  if (maintenanceLoading || roleLoading) {
    return <>{children}</>;
  }

  // Show maintenance page for non-admins when maintenance is on
  if (isMaintenanceMode && !isAdmin) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Maintenance />
      </Suspense>
    );
  }

  return <>{children}</>;
};
