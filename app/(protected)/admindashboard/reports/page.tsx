import { db } from "@/lib/db";

const page = async () => {

  const workorder = await db.awardofContract.findMany({

    include: {
      workorderdetails: {
        include: {
          Bidagency: true
        }
      },
      WorksDetail: true

    }
  })
  return <pre>{JSON.stringify(workorder, null, 2)}</pre>;
};

export default page;
