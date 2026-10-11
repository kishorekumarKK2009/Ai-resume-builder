# Backend for Resume Builder

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start MongoDB locally or update `MONGODB_URI` in `.env`.

3. Run the server:
   ```bash
   npm run dev
   ```

## API Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/resumes`
- `POST /api/resumes`
- `GET /api/resumes/:id`
- `PUT /api/resumes/:id`
- `DELETE /api/resumes/:id`
- `GET /api/profile`
- `PUT /api/profile`
- `GET /api/templates`
