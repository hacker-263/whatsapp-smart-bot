# 🚀 Local Docker Setup Guide

## Quick Start (5 Minutes)

### Step 1: Prerequisites
```bash
# Install Docker and Docker Compose
# macOS/Windows: Download Docker Desktop
# Linux: sudo apt-get install docker.io docker-compose
```

### Step 2: Create Environment File
```bash
cp .env.local.example .env.local

# Edit .env.local and set:
# DEPLOYMENT_MODE=local
# DB_PASSWORD=your-secure-password
```

### Step 3: Start All Services
```bash
cd /workspaces/whatsapp-smart-bot

# Start Docker services
docker-compose up -d

# Wait for services to be healthy (30 seconds)
docker-compose ps
```

### Step 4: Initialize Database
```bash
# The database automatically runs migrations from docker/init.sql
# To verify, check if tables exist:
docker-compose exec postgres psql -U postgres -d smart_whatsapp -c "\dt"
```

### Step 5: Start Bot & API
```bash
cd whatsapp-bot

# Install dependencies
npm install

# Terminal 1: Start the bot
npm start

# Terminal 2: Start the API server
npm run api
```

### Step 6: Verify All Services
```bash
# Check bot
curl http://localhost:3001/health

# Check API
curl http://localhost:4001/health

# Check PostgreSQL
docker-compose exec postgres pg_isready

# Check Redis
docker-compose exec redis redis-cli ping
```

---

## Full Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Your Computer                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Docker Network: smart-whatsapp                  │   │
│  │                                                  │   │
│  │  ┌──────────────┐  ┌──────────────┐ ┌────────┐ │   │
│  │  │ PostgreSQL   │  │   Redis      │ │pgAdmin │ │   │
│  │  │ Port: 5432   │  │  Port: 6379  │ │5050    │ │   │
│  │  └──────────────┘  └──────────────┘ └────────┘ │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Node.js Applications (localhost)                │   │
│  │                                                  │   │
│  │  ┌──────────────┐  ┌──────────────┐            │   │
│  │  │ Bot Engine   │  │  API Server  │            │   │
│  │  │ Port: 3001   │  │  Port: 4001  │            │   │
│  │  └──────────────┘  └──────────────┘            │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Web Platform (Vite)                            │   │
│  │  Port: 5173                                     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Docker Services Explained

### PostgreSQL
- **Image**: postgres:16-alpine
- **Port**: 5432
- **Database**: smart_whatsapp
- **Volume**: postgres_data (persistent)
- **Credentials**: Check .env.local
- **Purpose**: Main database for users, orders, products, etc.

### Redis
- **Image**: redis:7-alpine
- **Port**: 6379
- **Volume**: redis_data (persistent)
- **Purpose**: Session caching, cart storage, rate limiting

### pgAdmin
- **Image**: dpage/pgadmin4:latest
- **Port**: 5050
- **Purpose**: Web UI for database management
- **Access**: http://localhost:5050
- **Default**: admin@example.com / admin

---

## Access Services

### pgAdmin (Database GUI)
```
URL: http://localhost:5050
Email: admin@example.com
Password: admin

To connect to PostgreSQL:
- Hostname: postgres
- Port: 5432
- Username: postgres
- Password: (check .env.local)
- Database: smart_whatsapp
```

### Redis CLI
```bash
docker-compose exec redis redis-cli

# Commands:
KEYS *              # See all keys
DBSIZE              # Total keys
FLUSHDB             # Clear database
GET key_name        # Get value
TTL key_name        # Time to live
```

### PostgreSQL CLI
```bash
docker-compose exec postgres psql -U postgres -d smart_whatsapp

# Commands:
\dt                 # List all tables
\du                 # List users
SELECT * FROM users;
SELECT * FROM orders;
\q                  # Exit
```

---

## Common Tasks

### View Logs
```bash
# Bot logs
docker-compose logs postgres -f
docker-compose logs redis -f
docker-compose logs -f         # All services

# Stop following logs
# Press Ctrl+C
```

### Reset Database
```bash
# CAUTION: This deletes all data!
docker-compose down -v
docker-compose up -d

# Database will auto-initialize with migrations
```

### Backup Database
```bash
# Backup to file
docker-compose exec postgres pg_dump -U postgres smart_whatsapp > backup.sql

# Restore from backup
docker-compose exec -T postgres psql -U postgres smart_whatsapp < backup.sql
```

### Stop Services
```bash
# Stop all (data preserved)
docker-compose stop

# Stop and remove containers (data preserved in volumes)
docker-compose down

# Stop and remove everything including volumes (DATA LOST!)
docker-compose down -v
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart one service
docker-compose restart postgres
```

---

## Troubleshooting

### "Port already in use"
```bash
# Find process using port
lsof -i :5432    # PostgreSQL
lsof -i :6379    # Redis
lsof -i :5050    # pgAdmin

# Kill process
kill -9 <PID>
```

### "Connection refused"
```bash
# Check if containers are running
docker-compose ps

# View logs for errors
docker-compose logs postgres
```

### "Database doesn't exist"
```bash
# Check if migration ran
docker-compose logs postgres

# Re-initialize
docker-compose down -v
docker-compose up -d
```

### "Redis connection error"
```bash
# Check Redis is running
docker-compose logs redis

# Test connection
docker-compose exec redis redis-cli ping
```

---

## Performance Tips

### Monitor Resource Usage
```bash
docker stats
```

### Optimize PostgreSQL
```bash
# Connect to psql and run
ANALYZE;
VACUUM;
```

### View Query Performance
```bash
# In pgAdmin, enable query analytics
# Set shared_preload_libraries = 'pg_stat_statements'
```

---

## Next Steps

1. **Access Web Platform**: http://localhost:5173
2. **Scan QR Code**: Open WhatsApp and scan from terminal
3. **Test Commands**: Type `!help` in WhatsApp
4. **Monitor Database**: Visit http://localhost:5050
5. **Check API**: Visit http://localhost:4001/health

---

## Security Notes

### Local Development
- Default credentials are fine for local development
- Change passwords before deploying to production
- Keep .env.local out of version control (already in .gitignore)

### Production Deployment
- Use strong database password
- Enable PostgreSQL SSL
- Use environment secrets (Docker Secrets or cloud provider)
- Enable RLS policies (already configured)
- Use private subnets for database

---

## Migration to Cloud

When ready to move to production:

1. **Export Data** from local PostgreSQL
2. **Create Supabase Project** at supabase.com
3. **Import Migration Files** to Supabase
4. **Update .env.local** to use cloud credentials
5. **Test Thoroughly** before switching production traffic

See `DEPLOYMENT_READY.md` for complete deployment guide.
