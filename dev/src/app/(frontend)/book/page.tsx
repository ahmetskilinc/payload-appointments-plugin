import React from "react";
import BookNow from "../../../components/Book";
import configPromise from "@payload-config";
import { getPayload } from "payload";

const Page = async () => {
  const payload = await getPayload({ config: configPromise });
  const teamMembers = (
    await payload.find({
      collection: "teamMembers",
      overrideAccess: false,
      where: {
        takingAppointments: {
          equals: true,
        },
      },
    })
  ).docs;

  const services = (
    await payload.find({
      collection: "services",
      overrideAccess: false,
    })
  ).docs;

  return (
    <div className="py-20 px-6">
      <BookNow services={services} teamMembers={teamMembers} />
    </div>
  );
};

export default Page;
