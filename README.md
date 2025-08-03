# Himanjali Sankar - Author Website

A modern, responsive author website built with vanilla JavaScript, Express.js, and SCSS. Features a clean design showcasing literary works with dynamic content loading and a professional contact system.

## 🚀 Features

- **Modern Homepage Layout**: Latest book showcase with purchase links
- **Book Categories**: Organized adult fiction and children's books
- **Responsive Design**: Mobile-first approach with elegant animations
- **Contact System**: Email-based contact form with validation
- **API Integration**: RESTful API for dynamic content
- **Performance Optimized**: Fast loading with efficient asset management
- **SEO Ready**: Proper meta tags and structured markup

## 🛠️ Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+), SCSS, Vite
- **Backend**: Node.js, Express.js
- **Email**: Nodemailer for contact form
- **Security**: Helmet, CORS, Rate limiting
- **Development**: Nodemon, Concurrently, ESLint, Prettier

## 📦 Installation

1. **Clone and setup**:
```bash
cd C:/projects/himanjali
npm install
```

2. **Environment Configuration**:
   - Copy `.env` file and update with your credentials
   - Configure email settings for contact form
   - Set Amazon affiliate ID for book links

3. **Development**:
```bash
npm run dev
```
This starts both the Express server (port 3000) and Vite dev server (port 5173)

4. **Production Build**:
```bash
npm run build
npm start
```

## 🔧 Configuration

### Environment Variables (.env)

```env
# Server
NODE_ENV=development
PORT=3000

# Email (Gmail recommended)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_TO=contact@himanjalisankar.com

# Social Media Links
TWITTER_URL=https://twitter.com/himanjalisankar
INSTAGRAM_URL=https://instagram.com/himanjalisankar
FACEBOOK_URL=https://facebook.com/himanjalisankar
GOODREADS_URL=https://goodreads.com/himanjalisankar

# Amazon Affiliate
AMAZON_AFFILIATE_ID=your-affiliate-id
```

## 📁 Project Structure

```
C:/projects/himanjali/
├── public/                 # Frontend assets
│   ├── src/
│   │   ├── js/            # JavaScript modules
│   │   └── styles/        # SCSS stylesheets
│   └── index.html         # Main HTML file
├── src/                   # Backend source
│   └── routes/           # API routes
├── server.js             # Express server
├── package.json          # Dependencies
├── vite.config.js        # Vite configuration
└── .env                  # Environment variables
```

## 🎨 Design Features

- **Book Showcase**: Interactive 3D book covers with hover effects
- **Gradient Backgrounds**: Unique color schemes for different book categories
- **Smooth Animations**: Scroll-triggered reveals and transitions
- **Typography**: Elegant serif/sans-serif font combination
- **Loading Experience**: Custom book-flipping animation

## 📱 Responsive Breakpoints

- **Mobile**: 480px and below
- **Tablet**: 768px and below
- **Desktop**: 1024px and above
- **Large**: 1200px+ (max content width)

## 🔌 API Endpoints

- `GET /api/books` - Get all books
- `GET /api/books/latest` - Get latest book
- `GET /api/books/category/:category` - Get books by category
- `POST /api/contact` - Submit contact form

## 🚦 Scripts

- `npm run dev` - Start development servers
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## 🔒 Security Features

- Helmet.js for security headers
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS configuration
- Email form spam protection

## 📈 Performance

- Vite for fast development and building
- SCSS for efficient styling
- Lazy loading and code splitting
- Optimized images and assets
- Compression middleware

## 🎯 Browser Support

- Chrome 80+
- Firefox 78+
- Safari 13+
- Edge 80+

## 📧 Contact Form

The contact form includes:
- Name and email validation
- Inquiry type categorization
- Rate limiting (3 submissions per 15 minutes)
- Email delivery with professional formatting
- Success/error feedback

## 🔮 Future Enhancements

- CMS integration for content management
- Blog functionality
- E-commerce integration
- Newsletter subscription
- Multi-language support
- Dark mode toggle
- Progressive Web App features

## 📄 License

MIT License - feel free to use for your own author website projects.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For questions about implementation or customization, please refer to the documentation or create an issue in the repository.
