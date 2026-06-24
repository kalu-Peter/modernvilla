import React, { Suspense, lazy } from "react";

const AvailabilityTabContent = lazy(() =>
  import("./AvailabilityTab").then((m) => ({ default: m.AvailabilityTab })),
);

export const AvailabilityTabLazy: React.FC = () => {
  return (
    <Suspense fallback={<div style={{ padding: "20px" }}>Loading...</div>}>
      <AvailabilityTabContent />
    </Suspense>
  );
};

export default AvailabilityTabLazy;
