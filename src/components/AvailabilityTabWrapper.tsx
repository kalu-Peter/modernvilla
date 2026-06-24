import React, { Suspense } from "react";

const AvailabilityTabDynamic = React.lazy(() =>
  import("./AvailabilityTab").then((module) => ({
    default: module.AvailabilityTab,
  })),
);

export const AvailabilityTabWrapper: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div style={{ padding: "24px", color: "#666" }}>
          Loading Availability & Blocking module...
        </div>
      }
    >
      <AvailabilityTabDynamic />
    </Suspense>
  );
};
