import { createHashRouter } from "react-router";
import Error404Page from "../pages/errors/Error404Page";
import Error500Page from "../pages/errors/Error500Page";
import LoginPage from "../pages/login/Page";
import ProtectedPage from "../pages/ProtectedPage";
import HomePage from "../pages/home/Page";
import UserPage from "../pages/users/Page";
import RolePage from "../pages/roles/Page";
import PermissionPage from "../pages/permissions/Page";
import ActivityLogPage from "../pages/activity-logs/Page";
import DoorprizePage from "../pages/doorprizes/Page";
import DoorprizePrintPage from "../pages/doorprizes/print/Page";
import WinnerPage from "../pages/winners/Page";
import FormWinnerPage from "../pages/winners/form/Page";
import VoucherCampaignPage from "../pages/voucher-campaigns/Page";
import VoucherCampaignDetailPage from "../pages/voucher-campaigns/DetailPage";
import VoucherRedemptionPage from "../pages/voucher-redemptions/Page";
import VoucherLandingPage from "../pages/public/voucher/LandingPage";
import VoucherBoxesPage from "../pages/public/voucher/BoxesPage";
import VoucherResultPage from "../pages/public/voucher/ResultPage";

const router = createHashRouter([
  {
    path: "/",
    element: <ProtectedPage />,
    errorElement: <Error500Page />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "/users", element: <UserPage />},
      { path: "/roles", element: <RolePage />},
      { path: "/permissions", element: <PermissionPage />},
      { path: "/activity-logs", element: <ActivityLogPage />},
      { path: "/doorprizes", element: <DoorprizePage />},
      { path: "/doorprizes/:id/print", element: <DoorprizePrintPage />},
      { path: "/winners", element: <WinnerPage />},
      { path: "/voucher-campaigns", element: <VoucherCampaignPage />},
      { path: "/voucher-campaigns/:id", element: <VoucherCampaignDetailPage />},
      { path: "/voucher-redemptions", element: <VoucherRedemptionPage />},
    ],
  },
  {
    path: "/login",
    errorElement: <Error500Page />,
    element: <LoginPage />,
  },
  {
    path: "/doorprize-winners/:id",
    errorElement: <Error500Page />,
    element: <FormWinnerPage />,
  },
  // Public Voucher Pages
  {
    path: "/v/:slug",
    errorElement: <Error500Page />,
    element: <VoucherLandingPage />,
  },
  {
    path: "/v/:slug/boxes",
    errorElement: <Error500Page />,
    element: <VoucherBoxesPage />,
  },
  {
    path: "/v/:slug/result",
    errorElement: <Error500Page />,
    element: <VoucherResultPage />,
  },
  {
    path: "/*",
    errorElement: <Error500Page />,
    element: <Error404Page />,
  },
]);

export default router;
