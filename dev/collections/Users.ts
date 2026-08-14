import type { CollectionConfig } from 'payload';

const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: ({ req: { user } }) => {
      return user!.roles === 'admin';
    },
  },
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    {
      name: 'firstName',
      type: 'text',
      label: 'First name',
    },
    {
      name: 'lastName',
      type: 'text',
      label: 'Last name',
    },
    {
      name: 'roles',
      type: 'select',
      options: [
        {
          label: 'Admin',
          value: 'admin',
        },
        {
          label: 'Customer',
          value: 'customer',
        },
      ],
    },
    // {
    //   name: 'appointments',
    //   type: 'join',
    //   collection: 'appointments',
    //   defaultLimit: 0,
    //   maxDepth: 999,
    //   on: 'customer',
    // },
  ],
};

export default Users;
