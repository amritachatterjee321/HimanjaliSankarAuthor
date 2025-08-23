export default function handler(req, res) {
  // Set proper headers for robots.txt
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  
  const robotsTxt = `User-agent: *
Allow: /

# Sitemap location
Sitemap: https://himanjalisankar.com/sitemap.xml

# Disallow admin and private areas
Disallow: /cms/
Disallow: /api/
Disallow: /admin/
Disallow: /private/

# Allow important pages
Allow: /books/
Allow: /about/
Allow: /media/
Allow: /contact/

# Crawl delay (optional)
Crawl-delay: 1`;

  res.status(200).send(robotsTxt);
}
