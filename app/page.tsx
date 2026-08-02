import { Suspense } from "react";
import { UnifiedDashboard } from "@/components/UnifiedDashboard";

export default function Home() {
  return (
    <Suspense>
      <UnifiedDashboard />
    </Suspense>
  );
}
