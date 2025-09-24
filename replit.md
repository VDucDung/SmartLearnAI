# Overview

This is a React-based tool marketplace application called "TOOL NRO" - a Vietnamese platform for purchasing gaming tools and automation software. The application allows users to browse, purchase, and manage digital tools with integrated payment processing and user authentication. It features a modern UI built with React, TypeScript, and Tailwind CSS, providing both customer-facing functionality and admin panel capabilities. 

**Note**: This has been converted to a frontend-only application, removing the backend components for simpler deployment and maintenance. The application now works as a static React app that can connect to external APIs.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The application uses a modern React-based architecture with:
- **Framework**: React 18 with TypeScript for type safety
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Components**: Radix UI primitives with shadcn/ui design system
- **Styling**: Tailwind CSS with CSS variables for theming
- **Animations**: Framer Motion for smooth transitions and interactions
- **Forms**: React Hook Form with Zod validation for type-safe form handling

## Component Structure
The application follows a modular component architecture:
- **Layout Components**: Header, Footer, Sidebar, and Layout wrapper components
- **Feature Components**: LoginForm, RegisterForm, ToolCard, WelcomeModal
- **UI Components**: Reusable shadcn/ui components in `/components/ui/`
- **Page Components**: Route-specific components in `/pages/`

## Authentication System
Implements JWT-based authentication with:
- **Token Management**: Access and refresh token pattern stored in localStorage
- **Context Provider**: React Context API for global auth state management
- **External API Integration**: Communicates with external authentication service
- **Form Validation**: Zod schemas for login/register validation
- **Demo Mode**: Supports both real authentication and demo functionality

## State Management Pattern
Uses a layered approach to state management:
- **Server State**: TanStack Query for API data fetching, caching, and synchronization
- **Authentication State**: React Context for user session management
- **UI State**: Local component state with useState for ephemeral UI interactions
- **Form State**: React Hook Form for complex form management with validation

## Routing Architecture
Implements protected route patterns:
- **Public Routes**: Home, Tools, Login, Register, Statistics
- **Protected Routes**: PurchasedTools, Deposit, History, Profile, AdminPanel, Checkout
- **Conditional Rendering**: Authentication-based route access control
- **Not Found Handling**: 404 page for unmatched routes

## Design System
Built on a consistent design foundation:
- **Color Scheme**: CSS custom properties for light/dark theme support
- **Component Variants**: Class Variance Authority for component styling variations
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Accessibility**: ARIA attributes and keyboard navigation support

# External Dependencies

## Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Router alternative (Wouter)
- **TypeScript**: Full TypeScript support with strict configuration
- **Build Tools**: Vite for fast development and optimized production builds

## UI and Styling
- **Radix UI**: Comprehensive primitive component library for accessibility
- **Tailwind CSS**: Utility-first CSS framework with PostCSS processing
- **shadcn/ui**: Pre-built component library built on Radix UI
- **Framer Motion**: Animation library for smooth interactions
- **Lucide React**: Icon library for consistent iconography

## State Management and Data Fetching
- **TanStack Query**: Server state management with caching and synchronization
- **Axios**: HTTP client for API communication
- **React Hook Form**: Form state management with performance optimization
- **Zod**: Runtime type validation for forms and API responses

## Development and Build Tools
- **Vite**: Modern build tool with fast HMR and optimized production builds
- **PostCSS**: CSS processing with Tailwind CSS and Autoprefixer
- **ESLint**: Code quality and consistency (configured but not visible in files)

## External Services Integration
- **Stripe**: Payment processing integration with React Stripe.js
- **External Authentication API**: JWT-based authentication service
- **Replit Plugins**: Development tools for Replit environment integration

## Utility Libraries
- **date-fns**: Date manipulation and formatting
- **clsx & tailwind-merge**: Conditional CSS class handling
- **cmdk**: Command palette functionality
- **embla-carousel**: Carousel component implementation

The application is designed to be easily deployable and maintainable, with clear separation of concerns between UI components, business logic, and external service integrations.