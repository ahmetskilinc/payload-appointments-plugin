import { CollectionConfig } from "payload";
import { authenticated } from "../access/authenticated";

const TeamMembers: CollectionConfig = {
  slug: "teamMembers",
  admin: {
    useAsTitle: "preferredNameAppointments",
    group: "Appointments",
    defaultColumns: ["firstName", "lastName", "takingAppointments", "preferredNameAppointments"],
    description: "Manage team members who can take appointments",
  },
  access: {
    read: () => true,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      type: "row",
      fields: [
        {
          name: "firstName",
          type: "text",
          label: "First Name",
          required: true,
          admin: {
            description: "Team member's first name",
          },
        },
        {
          name: "lastName",
          type: "text",
          label: "Last Name",
          required: true,
          admin: {
            description: "Team member's last name",
          },
        },
      ],
    },
    {
      name: "preferredNameAppointments",
      type: "text",
      label: "Display Name",
      required: true,
      unique: true,
      admin: {
        description: "Name to display in appointment schedule and booking system",
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (!value && data?.firstName && data?.lastName) {
              return `${data.firstName} ${data.lastName}`;
            }
            return value;
          },
        ],
      },
    },
    {
      name: "takingAppointments",
      type: "checkbox",
      label: "Available for Appointments",
      defaultValue: false,
      admin: {
        description: "Enable to allow this team member to take appointments",
        position: "sidebar",
      },
    },
    // {
    //   name: "maxAppointmentsPerDay",
    //   type: "number",
    //   label: "Max Daily Appointments",
    //   defaultValue: 8,
    //   required: true,
    //   min: 1,
    //   max: 50,
    //   admin: {
    //     description: "Maximum number of appointments this team member can take per day",
    //     condition: (data) => data.takingAppointments === true,
    //   },
    // },
  ],
  timestamps: true,
};

export default TeamMembers;
