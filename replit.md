# JustPause Salon & Spa Management System

## Overview

This is a comprehensive salon and spa management platform for JustPause Salon & Spa, built with a modern React frontend and Express.js backend, specifically localized for the Philippine market. The application manages clients, staff, services, and appointments for spa/salon businesses. It features a clean, professional interface using ShadCN UI components with Philippine Peso (₱) currency support and follows a full-stack TypeScript architecture.

## Recent Changes (August 19, 2025)
- Complete transition from mock data to production-ready database integration
- Database-driven dashboard with real statistics and revenue calculations
- Marketing analytics using live campaign data instead of mock values
- Reports page displaying actual service popularity from appointment history
- Successfully seeded database with sample clients, services, staff, and appointments
- Fixed QueryClient provider wrapper for Landing component to enable real data fetching
- Enhanced hero section with uploaded background image (/hero-background.jpeg)
- Implemented stunning animated background with multi-color gradients and enhanced blur effects
- Fixed mobile header text sizing issue by reducing logo font size for better mobile compatibility
- Added mobile sticky floating logo overlay positioned directly at header level with no top spacing
- Desktop maintains large floating logo below header
- Removed mobile header logo/text to make space for overlay
- Updated testimonials for Dubai/UAE market with authentic local business references
- Complete rebranding from "Serenity Spa" to "JustPause Salon & Spa"
- Updated logo throughout the application with larger, more prominent display
- Applied consistent Inter font typography with uppercase and wide letter spacing
- Integrated WhatsApp contact (+971 50 290 0752) and Facebook page reference
- Updated contact information to Dubai, UAE location

## User Preferences

- Preferred communication style: Simple, everyday language
- Market focus: Philippine spa/salon businesses
- Currency: Philippine Peso (₱) instead of USD ($)
- Features requested: Comprehensive feature suggestions for Filipino market
- Branding: JustPause Salon & Spa with clean logo-only approach (no text overlay)
- Logo preference: Larger logo images without additional text styling

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: ShadCN UI components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Validation**: Zod schemas shared between frontend and backend
- **Development**: Hot reload with Vite integration in development mode

### Project Structure
- `client/` - React frontend application
- `server/` - Express.js backend API
- `shared/` - Shared TypeScript types and Zod schemas
- `migrations/` - Database migration files (Drizzle)

## Key Components

### Database Schema (PostgreSQL + Drizzle)
- **Clients**: Customer information, visit history, spending tracking
- **Services**: Service catalog with categories, pricing, and duration
- **Staff**: Employee profiles with specialties and experience
- **Appointments**: Booking system linking clients, services, and staff

### API Structure
RESTful API with the following endpoints:
- `/api/clients` - Client management (CRUD operations)
- `/api/services` - Service catalog management
- `/api/staff` - Staff member management
- `/api/appointments` - Appointment scheduling and management
- `/api/dashboard/stats` - Business analytics and reporting

### Frontend Pages
- **Dashboard**: Business overview with key metrics and quick actions
- **Appointments**: Calendar view and appointment management
- **Clients**: Customer database with search and filtering
- **Services**: Service catalog with category-based organization
- **Staff**: Team management with specialties and scheduling
- **Reports**: Business analytics and performance metrics

### UI Components Architecture
- **Layout**: Responsive sidebar navigation with mobile support
- **Modals**: Reusable modal components for creating/editing entities
- **Forms**: Validated forms using React Hook Form + Zod
- **Data Display**: Cards, tables, and lists with loading states
- **Theme System**: CSS custom properties for consistent theming

## Data Flow

### Client-Server Communication
1. Frontend makes API requests using TanStack Query
2. Requests are handled by Express.js routes in `server/routes.ts`
3. Data operations are abstracted through storage layer (`server/storage.ts`)
4. Response data is cached and managed by TanStack Query on the client

### Form Handling
1. Forms use shared Zod schemas for validation
2. React Hook Form manages form state and client-side validation
3. Form submission triggers API calls via TanStack Query mutations
4. Success/error states are handled with toast notifications

### State Management
- **Server State**: Managed by TanStack Query with automatic caching and refetching
- **Client State**: Local component state using React hooks
- **Form State**: React Hook Form for form-specific state management

## External Dependencies

### Frontend Dependencies
- **UI Components**: Radix UI primitives with ShadCN customizations
- **Styling**: Tailwind CSS, class-variance-authority for component variants
- **Forms**: React Hook Form, Hookform resolvers for Zod integration
- **Data Fetching**: TanStack React Query for server state management
- **Validation**: Zod for schema validation
- **Date Handling**: date-fns for date manipulation
- **Icons**: Lucide React icon library

### Backend Dependencies
- **Database**: Neon serverless PostgreSQL, Drizzle ORM
- **Validation**: Zod for request validation
- **Session Management**: Express sessions with PostgreSQL store
- **Development**: tsx for TypeScript execution, esbuild for production builds

### Development Tools
- **Build System**: Vite with React plugin and error overlay
- **TypeScript**: Strict configuration with path mapping
- **Code Quality**: ESLint and Prettier (implied by project structure)

## Deployment Strategy

### Build Process
1. **Frontend**: Vite builds the React app to `dist/public/`
2. **Backend**: esbuild bundles the Express server to `dist/index.js`
3. **Database**: Drizzle handles schema migrations and database provisioning

### Environment Configuration
- Database connection via `DATABASE_URL` environment variable
- Development vs production modes with appropriate middleware
- Vite development server integration for seamless full-stack development

### Production Deployment
- Single deployment unit with both frontend and backend
- Static assets served by Express in production
- Database migrations handled by Drizzle CLI commands
- Support for platforms like Replit with specialized configuration

The architecture prioritizes developer experience with hot reloading, type safety across the full stack, and a component-based UI system that scales well for business applications.

## Recent Changes
- **Database Migration (Jan 25, 2025)**: Replaced in-memory storage with PostgreSQL database using Drizzle ORM
- **AI Integration**: Added OpenRouter API integration for Philippine market research and product data generation
- **Enhanced Product Management**: Implemented AI-powered product form filling with dynamic SKU/barcode generation
- **File Upload System**: Added multer-based image upload for product photos
- **Production Database Layer**: Complete database relations and CRUD operations with proper data persistence
- **Enhanced POS System (Jan 25, 2025)**: Transformed POS into full cashier system with service categories, quick customer registration, cash payment calculations, and receipt modal with print functionality
- **User Experience Enhancement (Jan 25, 2025)**: Added comprehensive preloader with spa-themed animations, professional landing page showcasing system features, and complete documentation system accessible from header
- **Onboarding Flow**: Implemented first-time user experience with preloader → landing page → dashboard flow using localStorage to track visits