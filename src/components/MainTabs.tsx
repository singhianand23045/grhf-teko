
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation, useNavigate } from "react-router-dom";

const TABS = [
  { value: "home", label: "Home", path: "/" },
  { value: "analytics", label: "Analytics", path: "/analytics" },
];

export default function MainTabs() {
  const location = useLocation();
  const navigate = useNavigate();

  // Find which tab is currently active
  const activeTab =
    TABS.find((tab) =>
      tab.path === "/" ? location.pathname === "/" : location.pathname.startsWith(tab.path),
    )?.value || "home";
  return (
    <div className="w-full flex justify-center py-4 bg-white/80 z-10">
      <Tabs value={activeTab}>
        <TabsList>
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              onClick={() => {
                if (location.pathname !== tab.path) navigate(tab.path);
              }}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
