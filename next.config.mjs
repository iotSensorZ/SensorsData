/** @type {import('next').NextConfig} */

export default {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'res.cloudinary.com',
          pathname: '**', // This allows all paths from this domain
        },
      ],
    },
  };