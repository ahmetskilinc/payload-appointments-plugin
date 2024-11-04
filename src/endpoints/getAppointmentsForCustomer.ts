import { PayloadHandler, PayloadRequest } from "payload";
import { User } from "../types";

export const getAppointmentsForCustomer: PayloadHandler = async (req: PayloadRequest) => {
  try {
    const { email, id } = await req.json?.();

    const customer = (
      await req.payload.find({
        collection: "users",
        limit: 1,
        where: {
          id: {
            equals: id,
          },
          email: {
            equals: email,
          },
        },
        joins: {
          appointments: {
            limit: 0,
            sort: "-start",
          },
        },
      })
    ).docs[0] as User;

    return Response.json(
      {
        success: true,
        data: customer.appointments,
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json({ message: "error", error: error }, { status: 500 });
  }
};
