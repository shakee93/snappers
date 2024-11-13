/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: 'https://gqmobiles.lk/', // Replace with your site's URL
    generateRobotsTxt: true, // Generate a `robots.txt` file
    exclude: ['/404'], // Exclude any specific pages if needed
    sitemapSize: 7000, // Split large sitemaps into multiple files if needed
  };
  