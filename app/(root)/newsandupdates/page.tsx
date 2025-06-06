import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "News & updates info page",
  description: "dhalparagp notice",
};

const page = () => {
  return (
    <div className="flex justify-center items-center">
      <h1>Comming Soon</h1>
    </div>
  );
};

export default page;
