# Darrent - Rental Property Management Application

## Project Overview

Darrent is a comprehensive rental property management platform built with React Native and Expo. The application serves as a bridge between renters and landlords, providing tools for property management, rental applications, contract handling, and communication. The project is built using modern web technologies with a focus on type safety, maintainability, and user experience.

## Project Structure

### Root Directory

```
├── app/                    # Main application code (Expo Router)
├── assets/                 # Static assets (images, fonts, etc.)
├── components/             # Reusable UI components
├── config/                 # Configuration files
├── constants/              # Application constants
├── contexts/               # React Context providers
├── hooks/                  # Custom React hooks
├── lib/                    # Library code and utilities
├── localization/           # Internationalization files
├── navigation/             # Navigation configuration
├── scripts/                # Build and utility scripts
├── services/               # API and service layer
├── types/                  # TypeScript type definitions
├── utils/                  # Utility functions
```

### Key Files

- `app.json` - Expo configuration
- `babel.config.js` - Babel configuration
- `tsconfig.json` - TypeScript configuration
- `package.json` - Project dependencies and scripts
- `README.md` - Project readme
- `supabase-*.md` - Supabase integration documentation

## Features and Functionality

### Core Features

1. **Authentication System**

   - User registration and login
   - Role-based access (Renter/Landlord)
   - Secure session management

2. **Property Management**

   - Property listing and details
   - Rental applications
   - Contract management
   - Document handling

3. **Communication**

   - In-app messaging system
   - Notifications
   - Real-time updates

4. **User Management**
   - Profile management
   - Settings configuration
   - Role-specific dashboards

### Technical Features

- Type-safe development with TypeScript
- Internationalization support
- Form validation with Zod
- Secure storage
- Haptic feedback
- Image handling and processing
- Maps integration
- Push notifications

## Dependencies and Technologies

### Core Technologies

- React Native 0.76.9
- Expo 52.0.43
- TypeScript 5.3.3
- Supabase (Backend)

### Key Dependencies

- **Navigation**: @react-navigation, expo-router
- **State Management**: React Context
- **Forms**: react-hook-form, @hookform/resolvers, zod
- **UI Components**: @expo/vector-icons, expo-blur
- **Storage**: @react-native-async-storage/async-storage, expo-secure-store
- **Internationalization**: i18next, react-i18next
- **Maps**: react-native-maps
- **Notifications**: expo-notifications
- **Gestures**: react-native-gesture-handler, react-native-reanimated

## Setup and Development

### Prerequisites

- Node.js (Latest LTS version)
- npm or yarn
- Expo CLI
- Supabase account and project

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
3. Configure environment variables (if any)
4. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

### Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run on web
- `npm run lint` - Run linting
- `npm run reset-project` - Reset project state

## Development Guidelines

### Code Organization

- Follow the established folder structure
- Place reusable components in the `components` directory
- Keep business logic in the `services` directory
- Use TypeScript for all new code
- Follow the existing naming conventions

### State Management

- Use React Context for global state
- Keep component state local when possible
- Follow the established patterns in the `contexts` directory

### Styling

- Use the existing styling patterns
- Maintain consistency with the design system
- Follow responsive design principles

### Testing

- Write tests for new features
- Maintain existing test coverage
- Follow the established testing patterns

## Important Considerations

### Security

- Never commit sensitive information
- Use secure storage for sensitive data
- Follow security best practices for authentication

### Performance

- Optimize image loading and processing
- Implement proper caching strategies
- Monitor and optimize render performance

### Accessibility

- Maintain WCAG compliance
- Use semantic HTML elements
- Ensure proper contrast ratios
- Support screen readers

### Internationalization

- All user-facing text should be internationalized
- Use the established i18n patterns
- Support RTL layouts when necessary

## Troubleshooting

### Common Issues

1. **Expo Build Failures**

   - Clear Expo cache: `expo start -c`
   - Check for conflicting dependencies

2. **TypeScript Errors**

   - Ensure proper type definitions
   - Check for missing type declarations

3. **Supabase Connection Issues**
   - Verify environment variables
   - Check Supabase project status
   - Review network connectivity

## Support and Resources

- Expo Documentation: https://docs.expo.dev/
- React Native Documentation: https://reactnative.dev/
- Supabase Documentation: https://supabase.com/docs
- TypeScript Documentation: https://www.typescriptlang.org/docs/

## Contributing

1. Create a new branch for your feature
2. Follow the established coding standards
3. Write tests for new features
4. Update documentation as needed
5. Submit a pull request

## License

[Specify your license here]
