import React, { createContext, useContext, useState } from 'react';

type PackageId = "3h" | "6h" | "10h" | "multi" | "airport";

type ScheduleContextType = {
  selectedPackage: PackageId;
  setSelectedPackage: (pkg: PackageId) => void;
};

const ScheduleContext = createContext<ScheduleContextType>({
  selectedPackage: "3h",
  setSelectedPackage: () => {},
});

export function ScheduleProvider({ children }: { children: React.ReactNode }) {
  const [selectedPackage, setSelectedPackage] = useState<PackageId>("3h");
  return (
    <ScheduleContext.Provider value={{ selectedPackage, setSelectedPackage }}>
      {children}
    </ScheduleContext.Provider>
  );
}

export const useSchedule = () => useContext(ScheduleContext);