# Luciole - Location-Aware Connection App

## Overview

Luciole is a location-aware mobile web application that helps users find each other in crowded environments by synchronizing blinking lights when they're in proximity. The app creates temporary "sparks" - shared sessions that multiple users can join to coordinate their location and receive visual/haptic feedback when they're close to each other.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom firefly-themed color palette
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state, React hooks for local state
- **PWA Support**: Service worker with offline caching and push notifications

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Real-time Communication**: WebSocket server for live location synchronization
- **Session Storage**: In-memory storage (MemStorage) with automatic cleanup
- **Database Provider**: Neon Database (serverless PostgreSQL)

### Key Components

#### Spark System
- **Purpose**: Creates temporary, shareable sessions for location coordination
- **Implementation**: Generates unique IDs (FLY-XXXXXX format) with 24-hour expiration
- **Sharing**: QR codes and shareable links for easy session joining

#### Location Services
- **Geolocation API**: Browser-based GPS positioning with high accuracy
- **Distance Calculation**: Haversine formula for precise distance measurements
- **Proximity Detection**: Automatic synchronization when users are within 10 meters

#### Real-time Synchronization
- **WebSocket Protocol**: Bidirectional communication for location updates
- **Message Types**: Join, location updates, and sync signals
- **Connection Management**: Automatic reconnection with exponential backoff

#### Visual Feedback System
- **Firefly Animations**: CSS-based blinking animations that sync between devices
- **Proximity Indicators**: Radar-style display showing relative user positions
- **Progressive Web App**: Installable mobile experience with native-like features

### Data Flow

1. **Spark Creation**: User creates a new spark session, receives unique ID and shareable link
2. **Session Joining**: Other users join via QR code scan or link sharing
3. **Location Sharing**: Continuous GPS tracking with WebSocket transmission
4. **Proximity Detection**: Server calculates distances and triggers sync events
5. **Visual Synchronization**: Coordinated animations across all connected devices

### External Dependencies

#### Core Libraries
- **@neondatabase/serverless**: Serverless PostgreSQL client for Neon
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect
- **express**: Web server framework with middleware support
- **ws**: WebSocket implementation for real-time communication

#### UI Components
- **@radix-ui/***: Headless UI primitives for accessibility
- **@tanstack/react-query**: Server state management and caching
- **lucide-react**: Icon library for consistent visual elements
- **tailwindcss**: Utility-first CSS framework

#### Development Tools
- **vite**: Fast build tool with HMR support
- **typescript**: Type safety across frontend and backend
- **drizzle-kit**: Database migrations and schema management

### Deployment Strategy

#### Development
- **Local Development**: Vite dev server with Express backend
- **Hot Reload**: Automatic code updates during development
- **Database**: Local PostgreSQL or Neon development instance

#### Production
- **Build Process**: Vite builds static assets, esbuild bundles server code
- **Static Assets**: Served from Express with proper caching headers
- **Database**: Neon serverless PostgreSQL for scalability
- **WebSocket**: Integrated with HTTP server for real-time features

#### Progressive Web App
- **Manifest**: Configured for mobile installation
- **Service Worker**: Offline caching and background sync
- **Icons**: Vector-based icons for various device sizes
- **Notifications**: Push notification support for connection alerts

The architecture prioritizes real-time performance, mobile-first design, and ease of use while maintaining type safety and scalability through modern tooling and serverless infrastructure.