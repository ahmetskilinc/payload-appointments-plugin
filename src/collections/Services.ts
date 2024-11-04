import { CollectionConfig } from "payload";

const Services: CollectionConfig = {
  slug: "services",
  labels: {
    singular: "Service",
    plural: "Services",
  },
  admin: {
    group: "Appointments",
    useAsTitle: "title",
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      type: "text",
      name: "title",
      required: true,
    },
    {
      type: "textarea",
      name: "description",
      required: false,
    },
    {
      type: "number",
      name: "duration",
      label: "Duration",
      required: true,
    },
    {
      type: "checkbox",
      name: "paidService",
    },
    {
      type: "text",
      name: "price",
      admin: {
        condition: (siblingData) => siblingData.paidService === true,
      },
      required: true,
    },
  ],
};

export default Services;
