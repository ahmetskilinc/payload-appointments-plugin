import { CollectionConfig } from "payload";
import { authenticated } from "../access/authenticated";

const Services: CollectionConfig = {
  slug: "services",
  labels: {
    singular: "Service",
    plural: "Services",
  },
  admin: {
    group: "Appointments",
    useAsTitle: "title",
    defaultColumns: ["title", "duration", "paidService", "price"],
  },
  access: {
    read: () => true,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      type: "text",
      name: "title",
      required: true,
      index: true,
    },
    {
      type: "textarea",
      name: "description",
      required: false,
    },
    {
      type: "number",
      name: "duration",
      label: "Duration (minutes)",
      required: true,
      min: 1,
      max: 480, // 8 hours max
      admin: {
        description: "Duration of the service in minutes",
      },
    },
    {
      type: "row",
      fields: [
        {
          type: "checkbox",
          name: "paidService",
          label: "Paid Service",
          defaultValue: false,
        },
        {
          type: "number",
          name: "price",
          label: "Price",
          admin: {
            condition: (data) => data.paidService === true,
            description: "Price in your local currency",
          },
          required: true,
          min: 0,
          // step: 0.01,
        },
      ],
    },
  ],
  timestamps: true,
};

export default Services;
