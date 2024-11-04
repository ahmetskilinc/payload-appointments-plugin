import { CollectionConfig } from "payload";

const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: {
    useAsTitle: "email",
  },
  access: {
    admin: ({ req: { user } }) => {
      return user!.roles === "admin";
    },
  },
  fields: [
    {
      name: "firstName",
      type: "text",
      label: "First name",
    },
    {
      name: "lastName",
      type: "text",
      label: "Last name",
    },
    {
      name: "roles",
      type: "select",
      options: [
        {
          value: "admin",
          label: "Admin",
        },
        {
          value: "customer",
          label: "Customer",
        },
      ],
    },
    {
      name: "appointments",
      type: "join",
      collection: "appointments",
      admin: {
        condition: (siblingData) => ["customer"].includes(siblingData.roles),
      },
      on: "customer",
      defaultLimit: 0,
      maxDepth: 999,
    },
  ],
};

export default Users;
