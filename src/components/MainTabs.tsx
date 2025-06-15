
import { useLocation, useNavigate } from "react-router-dom";
import { Home, Activity } from "lucide-react";

const TABS = [
  {
    value: "home",
    label: "Home",
    path: "/",
    icon: Home,
  },
  {
    value: "analytics",
    label: "Analytics",
    path: "/analytics",
    icon: Activity,
  },
];

export default function MainTabs() {
  const location = useLocation();
  const navigate = useNavigate();

  const activeTab =
    TABS.find((tab) =>
      tab.path === "/" ? location.pathname === "/" : location.pathname.startsWith(tab.path)
    )?.value || "home";

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[402px] max-w-full z-30 bg-white border-t border-gray-200 rounded-b-2xl h-16 flex items-center"
      style={{}}
    >
      <ul className="flex w-full justify-around items-center">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.value;
          return (
            <li key={tab.value} className="flex-1">
              <button
                className={`flex flex-col items-center justify-center w-full h-full py-1.5 transition text-xs ${
                  isActive
                    ? "text-indigo-600 font-semibold"
                    : "text-gray-400 hover:text-indigo-500"
                }`}
                aria-label={tab.label}
                onClick={() => {
                  if (location.pathname !== tab.path) navigate(tab.path);
                }}
              >
                <Icon
                  size={26}
                  className={`mb-1 transition ${
                    isActive ? "text-indigo-600" : "text-gray-400"
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {tab.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
