import Footer from "@/components/Footer/Footer";
import Header from "@/components/Header/Header";
import React, { ReactNode } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown } from "lucide-react";
import { AdUnit } from "@/components/adsense-provider"
interface Props {
  children: ReactNode;
}



export default function HomeLayout({ children }: Props) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header Section */}
      {/* <Header /> */}
      <div className="flex flex-1">
        {/* Sidebar */}


        {/* Main Content Section */}
        <main className="flex-grow p-6 overflow-auto">
          {/* <AdUnit slot="8324866123" format="auto" responsive={true} style={{ minHeight: "300px" }} /> */}
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>


      </div>

      {/* Footer Section
      <Footer /> */}
    </div>
  );
}
