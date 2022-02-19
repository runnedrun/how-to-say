/** @type {import('next').NextConfig} */

const config = {
  distDir: "/.next",
  // async redirects() {
  //   return [
  //     {
  //       source: "/",
  //       destination: "/sign_in",
  //       permanent: true,
  //     },
  //   ]
  // },
  reactStrictMode: true,
}

// Make sure adding Sentry options is the last code to run before exporting, to
// ensure that your source maps include changes from all other Webpack plugins
module.exports = config
