import { type AppType } from "next/app";
import { ClerkProvider } from "@clerk/nextjs";
import { api } from "@/utils/api";

import "@/styles/globals.css";
import { jaJP } from "../utils/localization";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ClerkProvider localization={jaJP}>
      <Component {...pageProps} />
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
