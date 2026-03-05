import withFlowbiteReact from "flowbite-react/plugin/nextjs";
 
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: { unoptimized: true },
    webpack(config) {
      config.module.rules.push({
        test: /\.tsx?$/,
        resourceQuery: /raw/,
        type: 'asset/source',
      });
      return config;
    },
};
 
export default withFlowbiteReact(nextConfig);