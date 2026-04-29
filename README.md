# AI Chatbot Platform

A powerful, modern AI chatbot platform built with Next.js 16, React 19, and the Vercel AI SDK. This application allows users to organize their AI conversations into projects, features real-time streaming generation, and provides a rich markdown experience.

🌍 **Live Demo**: [sailorai.vercel.app](https://sailorai.vercel.app)

## ✨ Features

- **Advanced AI Integration**: Powered by Google's generative models using the Vercel AI SDK (`@ai-sdk/google`).
- **Real-time Streaming**: Enjoy real-time token streaming
- **Project Management**: Organize conversations into distinct projects. Create, edit, search, and delete projects to keep your workspace tidy.
- **Rich Chat Experience**: 
  - Markdown, code syntax highlighting, and math equation rendering (via `streamdown`).

- **Authentication**: Secure user authentication powered by `better-auth` with Redis storage support.
- **Optimistic UI**: Snappy, responsive interface with optimistic updates for chat renaming and deletions.
- **Modern UI/UX**: Built with Tailwind CSS v4, Framer Motion, and Radix UI primitives for a beautiful, accessible, and mobile-responsive design.
- **Docker Ready**: Complete Docker setup for seamless local development and production deployment.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Frontend**: [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/)
- **AI SDK**: [Vercel AI SDK v6](https://sdk.vercel.ai/docs)
- **Database**: [MongoDB](https://www.mongodb.com/)
- **Authentication**: [better-auth](https://better-auth.com/)
- **Caching/Session**: Redis (via `ioredis`)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/), [Radix UI](https://www.radix-ui.com/), [Motion](https://motion.dev/)
- **Markdown Processing**: Streamdown ecosystem

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- Node.js (v20 or higher)
- Docker & Docker Compose (optional, but recommended for easy setup)
- MongoDB
- Redis

### Environment Variables

Fill `.env` file with your environment variables using `.env.example` as a reference.

### Local Development (Without Docker)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Running with Docker

This project includes a `compose.yaml` and `Dockerfile` for easy containerized development and deployment. It uses Docker profiles to manage different environments.

1. Ensure your `.env` file is properly configured (see `.env.example`).
2. **For Development (`dev` profile)**: Starts the Next.js app with hot-reloading, along with local MongoDB and Redis containers.
   ```bash
   docker compose --profile dev up -d
   ```
3. **For Production (`prod` profile)**: Builds and runs the optimized production Next.js image. Requires external MongoDB and Redis (configured via `.env`).
   ```bash
   docker compose --profile prod up -d
   ```
4. The application will be available at [http://localhost:3000](http://localhost:3000).

## 📁 Project Structure

```text
ai_chatbot/
├── app/               # Next.js App Router pages and layouts (e.g., /projects, /chat)
├── components/        # Reusable UI components (buttons, modals, layouts)
├── lib/               # Utility functions, database connection logic, and types
├── public/            # Static assets (images, fonts, etc.)
├── .env.example       # Example environment variables
├── compose.yaml       # Docker Compose configuration (dev/prod profiles)
├── Dockerfile         # Multi-stage Dockerfile for the Next.js app
└── package.json       # Project dependencies and scripts
```
