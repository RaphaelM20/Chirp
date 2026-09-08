# Chirp

A full-stack Twitter/X clone. [Live Demo](https://chirp-chirp.netlify.app/login) | [API Repo](https://github.com/RaphaelM20/Chirp-api)

![Chirp Preview](https://res.cloudinary.com/zrc0epiv/image/upload/v1788888134/chirp-preview_dudqrr.jpg)

## Features

- JWT authentication (sign up, log in, guest access)
- Create, view, and delete posts
- Like and unlike posts and comments
- Comment on posts
- User profiles with posts, replies, and likes tabs
- Follow and unfollow users
- Discover new users to follow
- Edit profile (name, username, bio, picture)

## Tech Stack

- React, React Router, Vite
- Node.js, Express, Passport.js
- PostgreSQL, Prisma ORM
- Deployed on Netlify, Render, Neon

## Running Locally

```bash
# Clone both repos
git clone https://github.com/RaphaelM20/Chirp
git clone https://github.com/RaphaelM20/Chirp-api

# Backend
cd Chirp-api
npm install
# create .env with DATABASE_URL and JWT_SECRET
npx prisma migrate dev
npm run dev

# Frontend
cd Chirp
npm install
# create .env with VITE_API_URL=http://localhost:3000
npm run dev
```

Visit `http://localhost:5173` and use **Continue as Guest** to explore.
