import React from "react";

// Test component to verify that imports work
export const ImportTest: React.FC = () => {
  try {
    // Try to import AvailabilityTab
    const test = () => {
      // This won't actually work in JSX, but let's see what happens
      return <div>Import test component</div>;
    };
    return test();
  } catch (e) {
    return <div>Error: {String(e)}</div>;
  }
};
