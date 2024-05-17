import { format } from "date-fns";

import prismadb from "@/lib/prismadb";

import { WaitlistColumn } from "./components/columns";
import { WaitlistClient } from "./components/client";

const WaitlistPage = async ({ params }: { params: { seasonId: string } }) => {
  try {
    const waitlist = await prismadb.student.findMany({
      where: {
        seasonId: params.seasonId,
        status: 'Waitlist',
        // You can add more conditions here based on ProgCode or other attributes
      },
    });

    const formattedWaitlist: WaitlistColumn[] = waitlist.map((student) => ({
      id: student.id,
      NAME_FIRST: student.NAME_FIRST,
      NAME_LAST: student.NAME_LAST,
      HOME_TEL: student.HOME_TEL,
      E_mail_main: student.E_mail_main || "", // Provide a default empty string
      ProgCode: student.ProgCode || "", // Default empty string for ProgCode
    }));

    return (
      <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <WaitlistClient data={formattedWaitlist} />
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading waitlist:', error);
    return <div>Error loading waitlist data.</div>;
  }
};

export default WaitlistPage;
