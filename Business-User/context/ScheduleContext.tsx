import React, { createContext, useContext, useState } from 'react';

type PackageId = "3h" | "6h" | "10h" | "multi" | "airport";

type ScheduleContextType = {
  selectedPackage: PackageId;
  setSelectedPackage: (pkg: PackageId) => void;
  pendingPromo: string;
  setPendingPromo: (code: string) => void;
};

const ScheduleContext = createContext<ScheduleContextType>({
  selectedPackage: "3h",
  setSelectedPackage: () => {},
  pendingPromo: '',
  setPendingPromo: () => {},
});

export function ScheduleProvider({ children }: { children: React.ReactNode }) {
  const [selectedPackage, setSelectedPackage] = useState<PackageId>("3h");
  const [pendingPromo, setPendingPromo] = useState('');

  return (
    <ScheduleContext.Provider value={{ selectedPackage, setSelectedPackage, pendingPromo, setPendingPromo }}>
      {children}
    </ScheduleContext.Provider>
  );
}

export const useSchedule = () => useContext(ScheduleContext);