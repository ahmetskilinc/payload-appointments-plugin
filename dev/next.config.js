import { withPayload } from "@payloadcms/next/withPayload";

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: false,
};

export default withPayload(nextConfig);
