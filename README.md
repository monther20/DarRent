# Darrent

A modern React Native application built with Expo.

## Features

- Cross-platform support (iOS, Android, Web)
- TypeScript support
- Tailwind CSS for styling
- Internationalization support
- Push notifications
- Error boundary implementation
- Comprehensive logging system
- CI/CD pipeline

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/darrent.git
cd darrent
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your environment variables:
```env
API_URL=your_api_url_here
API_KEY=your_api_key_here
APP_NAME=darrent
APP_ENV=development
ANALYTICS_KEY=your_analytics_key_here
ENABLE_ANALYTICS=true
ENABLE_LOGGING=true
ENCRYPTION_KEY=your_encryption_key_here
```

## Development

Start the development server:
```bash
npm start
```

Run on specific platforms:
```bash
npm run ios     # iOS
npm run android # Android
npm run web     # Web
```

## Testing

Run tests:
```bash
npm test
```

Run linting:
```bash
npm run lint
```

## Project Structure

```
darrent/
├── app/              # App routes and screens
├── assets/           # Static assets
├── components/       # Reusable components
├── contexts/         # React contexts
├── hooks/            # Custom hooks
├── lib/              # Utility libraries
├── navigation/       # Navigation configuration
├── services/         # API and other services
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
└── __tests__/        # Test files
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security

Please report any security issues to security@yourdomain.com

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
