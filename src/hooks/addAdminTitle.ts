import { FieldHook } from "payload";

export const addAdminTitle: FieldHook = async ({ siblingData, req }) => {
  if (siblingData.appointmentType === "appointment") {
    const customer = (
      await req.payload.find({
        collection: "users",
        where: {
          id: {
            equals: siblingData.customer,
          },
        },
      })
    ).docs;

    return `${customer[0].firstName} ${customer[0].lastName}`;
  } else if (siblingData.appointmentType === "blockout") {
    return null;
  }
};
