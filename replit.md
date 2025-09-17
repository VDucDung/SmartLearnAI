# Overview

This is a full-stack web application built as a Vietnamese tool marketplace platform where users can browse, purchase, and manage digital tools. The application features a modern React frontend with a Node.js/Express backend, using PostgreSQL for data persistence. The platform includes user authentication, payment processing, admin management capabilities, and a comprehensive tool catalog system.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing with protected routes based on authentication state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: TailwindCSS with CSS custom properties for theming and dark mode support
- **State Management**: TanStack Query for server state management and caching
- **Animation**: Framer Motion for smooth transitions and micro-interactions
- **Form Handling**: React Hook Form with Zod schema validation

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Session-based authentication with Replit Auth integration
- **API Design**: RESTful API endpoints with consistent error handling
- **Session Storage**: PostgreSQL-based session storage using connect-pg-simple
- **Development**: Hot reload with Vite integration for development mode

## Database Schema Design
- **Users Table**: Stores user profiles with balance tracking and admin role flags
- **Tools Table**: Product catalog with pricing, categories, media, and metadata
- **Categories Table**: Hierarchical organization of tools
- **Purchases Table**: Transaction records linking users to purchased tools
- **Payments Table**: Financial transaction logging for deposits and purchases
- **Discount Codes Table**: Promotional code management system
- **Key Validations Table**: API key usage tracking and validation
- **Sessions Table**: Secure session persistence

## Authentication & Authorization
- **Primary Auth**: Replit OAuth integration with OpenID Connect
- **Demo Mode**: Local authentication system for development/testing
- **Session Management**: Secure HTTP-only cookies with PostgreSQL backing
- **Role-Based Access**: Admin privileges for user management and tool administration
- **Route Protection**: Client and server-side authentication checks

# External Dependencies

## Core Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL serverless driver for database connectivity
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect
- **express**: Web application framework for API endpoints
- **wouter**: Lightweight client-side routing
- **@tanstack/react-query**: Server state management and caching

## UI & Styling
- **@radix-ui/***: Comprehensive set of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **framer-motion**: Animation library for React
- **class-variance-authority**: Type-safe variant handling for components
- **lucide-react**: Icon library

## Payment Integration
- **@stripe/stripe-js**: Stripe payment processing (configured but not actively used in demo)
- **@stripe/react-stripe-js**: React components for Stripe integration

## Development Tools
- **vite**: Fast build tool and development server
- **typescript**: Type safety across the application
- **zod**: Runtime type validation and schema definition
- **@replit/vite-plugin-***: Replit-specific development enhancements

## Session & Storage
- **connect-pg-simple**: PostgreSQL session store for Express sessions
- **express-session**: Session middleware for authentication state
- **openid-client**: OAuth/OpenID Connect client implementation