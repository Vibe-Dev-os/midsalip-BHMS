# Tagamidsalip - Boarding House Management System

A Next.js-based boarding house management system with GIS mapping capabilities.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **pnpm** (Package Manager) - [Install pnpm](https://pnpm.io/installation)
- **XAMPP** (or MySQL Server) - For the MySQL database

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd tagamidsalip
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=tagamidsalip_db
DB_PORT=3306
```

> **Note:** Adjust the values according to your MySQL configuration. If using XAMPP, the default values should work.

### 4. Start MySQL Server

Make sure your MySQL server is running:

- **XAMPP Users:** Open XAMPP Control Panel and start the MySQL module
- **Standalone MySQL:** Ensure the MySQL service is running

### 5. Set Up the Database

Run the following command to create the database and run migrations:

```bash
npm db:setup
```

This command will:
1. Create the `tagamidsalip_db` database if it doesn't exist
2. Run all SQL migrations
3. Seed the database with initial data

#### Alternative Database Commands

| Command | Description |
|---------|-------------|
| `npm db:generate` | Generate new migration files from schema changes |
| `npm db:migrate` | Run database migrations only |
| `npm db:seed` | Seed the database with sample data |

### 6. Run the Development Server

```bash
npm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm dev` | Start the development server |
| `npm build` | Build the application for production |
| `npm start` | Start the production server |
| `npm lint` | Run ESLint to check for code issues |
| `npm db:generate` | Generate Drizzle ORM migrations |
| `npm db:migrate` | Run database migrations |
| `npm db:seed` | Seed the database with sample data |
| `npm db:setup` | Run migrations and seed (full setup) |

## 🗂️ Project Structure

```
tagamidsalip/
├── app/                    # Next.js App Router
│   ├── admin/              # Admin dashboard pages
│   ├── api/                # API routes
│   ├── login/              # Login page
│   ├── owner/              # Owner dashboard pages
│   └── signup/             # Signup page
├── components/             # React components
│   └── ui/                 # UI components (shadcn/ui)
├── drizzle/                # Database migrations
│   └── migrations/         # SQL migration files
├── hooks/                  # Custom React hooks
├── lib/                    # Utility libraries
│   └── db/                 # Database configuration & queries
├── public/                 # Static assets
├── scripts/                # Database setup scripts
└── styles/                 # Global styles
```

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui + Radix UI
- **Database:** MySQL with Drizzle ORM
- **Maps:** Leaflet.js / React Leaflet
- **Form Handling:** React Hook Form + Zod
- **Charts:** Recharts

## 🗄️ Database Schema

The system uses MySQL with Drizzle ORM. The schema is defined in `lib/db/schema.ts`.

To make schema changes:

1. Modify the schema in `lib/db/schema.ts`
2. Generate a new migration:
   ```bash
   npm db:generate
   ```
3. Apply the migration:
   ```bash
   npm db:migrate
   ```

## 🔐 User Roles

The system supports two user roles:

- **Admin:** Manage all boarding houses, view permits, access GIS map
- **Owner:** Register and manage their own boarding houses

## 🗺️ GIS Features

The system includes interactive mapping features using Leaflet:

- View boarding house locations on a map
- Pick locations when registering boarding houses
- GIS visualization for admin users

## 🐛 Troubleshooting

### Database Connection Issues

1. Ensure MySQL is running
2. Verify your `.env.local` credentials
3. Check that the port 3306 is not blocked

### Port Already in Use

If port 3000 is in use, you can run on a different port:

```bash
pnpm dev -- -p 3001
```

### Migration Errors

If migrations fail, try resetting the database:

1. Drop the database manually via phpMyAdmin or MySQL CLI
2. Re-run `npm db:setup`

## 📝 License

This project is private and proprietary.

---

For more information or support, please contact the development team.
