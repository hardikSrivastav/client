# rForms React Frontend

This directory contains the Next.js frontend for the rForms application, built with React, TypeScript, and ShadcnUI components.

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

Install dependencies:

```bash
npm install
# or
yarn install
```

### Running the Development Server

Start the development server:

```bash
npm run dev
# or
yarn dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Development

### Project Structure

```
src/
├── app/             # Next.js app directory
├── components/      # React components
│   ├── ui/          # ShadcnUI components
│   └── ...          # Custom components
├── lib/             # Utility functions
├── services/        # API services
└── styles/          # Global styles
```

### Adding New Components

1. For UI components, use ShadcnUI:
   ```
   npx shadcn@latest add [component-name]
   ```

2. Create custom components in `src/components/`

### Connecting to the Backend

The frontend connects to the FastAPI backend running at `http://localhost:8000`. The API service is defined in `src/services/api.ts`.

## Styling

This project uses Tailwind CSS for styling. The ShadcnUI components are built on top of Tailwind and provide a consistent design system.

## Testing

Run the tests:

```bash
npm test
# or
yarn test
```
