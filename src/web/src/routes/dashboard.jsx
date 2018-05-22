import DashboardPage from "views/Dashboard/Dashboard.jsx";
import Miners from "views/Miners/Miners.jsx";
import Sensors from "views/Sensors/Sensors.jsx";
import Pools from "views/Pools/Pools.jsx";
import About from "views/About/About.jsx";

// import UserProfile from "views/UserProfile/UserProfile.jsx";
// import TableList from "views/TableList/TableList.jsx";
import NotificationsPage from "views/Notifications/Notifications.jsx";

import {
  Dashboard,
  ContentPaste,
  SettingsEthernet,
  SettingsInputAntenna,
  Info,
  Notifications
} from "@material-ui/icons";

const dashboardRoutes = [
  {
    path: "/dashboard",
    sidebarName: "Dashboard",
    navbarName: "Full Cycle Dashboard",
    icon: Dashboard,
    component: DashboardPage
  },
  {
    path: "/miners",
    sidebarName: "Miners",
    navbarName: "Miners",
    icon: ContentPaste,
    component: Miners
  },
  {
    path: "/sensors",
    sidebarName: "Sensors",
    navbarName: "Sensors",
    icon: SettingsInputAntenna,
    component: Sensors
  },
  {
    path: "/pools",
    sidebarName: "Pools",
    navbarName: "Pools",
    icon: SettingsEthernet,
    component: Pools
  },

  // {
  //   path: "/user",
  //   sidebarName: "User Profile",
  //   navbarName: "Profile",
  //   icon: Person,
  //   component: UserProfile
  // },

  {
    path: "/notifications",
    sidebarName: "Notifications",
    navbarName: "Notifications",
    icon: Notifications,
    component: NotificationsPage
  },
  {
    path: "/about",
    sidebarName: "About",
    navbarName: "About",
    icon: Info,
    component: About
  },
  { redirect: true, path: "/", to: "/dashboard", navbarName: "Redirect" }
];

export default dashboardRoutes;
