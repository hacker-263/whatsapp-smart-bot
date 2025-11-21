# 🚀 Production Deployment Checklist

## Pre-Deployment (Week Before)

### 1. Code Quality
- [ ] Run linter: `npm run lint`
- [ ] Fix all warnings
- [ ] Review git logs for commits
- [ ] Check package.json versions
- [ ] Update dependencies if needed
- [ ] Test all features manually
- [ ] Test on different WhatsApp accounts

### 2. Database
- [ ] Backup production database
- [ ] Review all migrations
- [ ] Test RLS policies
- [ ] Check indexes created
- [ ] Monitor query performance
- [ ] Set up read replicas (if high traffic)

### 3. Environment
- [ ] Create production .env file
- [ ] Generate strong JWT secret
- [ ] Generate encryption key
- [ ] Set database credentials
- [ ] Configure API keys
- [ ] Update CORS origins
- [ ] Set correct URLs

### 4. Security Audit
- [ ] Check for secrets in code
- [ ] Review authentication flow
- [ ] Test rate limiting
- [ ] Test input validation
- [ ] Verify RLS policies
- [ ] Check CORS configuration
- [ ] Review error messages

### 5. Infrastructure
- [ ] Set up domain name
- [ ] Configure SSL certificate
- [ ] Set up CDN if needed
- [ ] Configure DNS
- [ ] Set up monitoring
- [ ] Set up logging
- [ ] Configure backups

---

## Deployment Day

### 1. Database Migration
```bash
# Backup current database
pg_dump -h production-host smart_whatsapp > backup.sql

# Run migrations
psql -h production-host -d smart_whatsapp < migrations/20251115*.sql
psql -h production-host -d smart_whatsapp < migrations/20251121*.sql

# Verify tables
psql -h production-host -d smart_whatsapp -c "\dt"

# Test queries
psql -h production-host -d smart_whatsapp -c "SELECT COUNT(*) FROM users;"
```

### 2. Deploy Web Platform
```bash
# Build
npm run build

# Deploy to hosting
# - Vercel: vercel deploy --prod
# - Netlify: netlify deploy --prod
# - Railway: railway deploy
# - AWS: aws s3 sync dist/ s3://bucket

# Verify deployment
curl https://your-domain.com
```

### 3. Deploy Bot
```bash
# Option A: VPS / Self-hosted
ssh user@server
git pull
npm install
npm start &  # or use PM2

# Option B: Docker (Recommended)
docker-compose -f docker-compose.prod.yml up -d

# Option C: Cloud (Railway, Heroku, etc)
git push heroku main
```

### 4. Deploy API Server
```bash
# Separate process or same server
npm run api &

# Verify API
curl https://your-domain.com:4001/health
```

### 5. Verify All Services
```bash
# Check web platform
curl https://your-domain.com
curl https://your-domain.com/health

# Check bot status
curl https://your-domain.com:3001/health

# Check API server
curl https://your-domain.com:4001/health

# Check database
psql -h production-host -d smart_whatsapp -c "SELECT 1;"
```

---

## Post-Deployment

### 1. Smoke Tests (First 30 minutes)
- [ ] Can register new user
- [ ] Can view menu
- [ ] Can add to cart
- [ ] Can checkout
- [ ] Can track order
- [ ] API endpoints respond
- [ ] Web dashboard loads
- [ ] No critical errors in logs

### 2. Load Testing
```bash
# Test with moderate load
ab -n 1000 -c 10 https://your-domain.com/api/products

# Monitor resources
watch docker stats
```

### 3. Monitoring Setup
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring (New Relic)
- [ ] Log aggregation (ELK Stack)
- [ ] Uptime monitoring (StatusPage)
- [ ] Database monitoring (pgAdmin remote)

### 4. Backup Verification
```bash
# Backup should be running automatically
# Verify: Check backup storage
ls -la /backups/

# Test restore (offline)
pg_restore -d test_db backup.sql
```

### 5. Notify Team
- [ ] Send deployment notification
- [ ] Provide production URLs
- [ ] Share API documentation
- [ ] Provide support contact
- [ ] Share monitoring dashboard access

---

## Day-1 Operations

### Morning Checklist
- [ ] Check overnight logs for errors
- [ ] Verify all services running
- [ ] Check database size
- [ ] Review error rates
- [ ] Test critical flows
- [ ] Monitor response times

### Afternoon Tasks
- [ ] User feedback collection
- [ ] Performance analysis
- [ ] Fine-tune settings if needed
- [ ] Document any issues
- [ ] Update runbooks

### Daily Monitoring
```bash
# Key metrics to watch
- Request response times
- Error rates
- Database connections
- Memory usage
- Disk usage
- API rate limit hits
- Order volume
- User registrations

# Alerts to set up
- Error rate > 1%
- Response time > 5s
- Database > 80% disk
- Memory > 90%
- Disk > 90%
```

---

## Configuration for Production

### Environment Variables
```bash
# Security
JWT_SECRET=<long-random-string>
ENCRYPTION_KEY=<long-random-string>

# Database
DB_HOST=production-postgres
DB_PORT=5432
DB_USER=smart_whatsapp_user
DB_PASSWORD=<strong-password>
DB_NAME=smart_whatsapp

# Bot Configuration
BOT_PREFIX=!
BOT_API_PORT=4001
NODE_ENV=production
LOG_LEVEL=info

# URLs
API_BASE_URL=https://your-domain.com
BOT_WEBHOOK_URL=https://your-domain.com/webhook
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=<your-key>

# Features
ENABLE_ANALYTICS=true
ENABLE_NOTIFICATIONS=true
ENABLE_ORDER_WEBHOOKS=true

# Payment (if configured)
PAYMENT_GATEWAY=payfast
PAYMENT_API_KEY=<key>
PAYMENT_SECRET=<secret>
```

### Docker Compose Production
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: smart_whatsapp
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    restart: always
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  bot:
    build:
      context: ./whatsapp-bot
      dockerfile: Dockerfile
    restart: always
    depends_on:
      - postgres
      - redis
    environment:
      NODE_ENV: production
      DB_HOST: postgres
      REDIS_HOST: redis
    volumes:
      - ./whatsapp-bot/auth_info_baileys:/app/auth_info_baileys
    ports:
      - "3001:3001"

volumes:
  postgres_data:
  redis_data:
```

---

## Scaling Strategy

### Phase 1: Initial (< 10,000 orders/month)
- Single server
- PostgreSQL 16
- Redis for caching
- Docker Compose

### Phase 2: Growth (10,000-100,000)
- Load balancer
- 2-3 bot instances
- PostgreSQL read replica
- Dedicated Redis
- CDN for static files

### Phase 3: Enterprise (> 100,000)
- Kubernetes cluster
- Database sharding
- Multiple bot instances per region
- Message queue (RabbitMQ)
- Advanced monitoring
- Disaster recovery

---

## Rollback Procedure

**If something goes wrong**:

### 1. Immediate Actions
```bash
# Stop the problematic service
docker-compose stop bot
# or
systemctl stop whatsapp-bot

# Don't restart yet - investigate first
```

### 2. Diagnose
```bash
# Check logs
docker-compose logs bot | tail -100
tail -100 /var/log/whatsapp-bot.log

# Check database
psql smart_whatsapp -c "SELECT * FROM bot_command_history WHERE created_at > NOW() - INTERVAL '5 minutes' ORDER BY created_at DESC;"

# Check system
docker stats
free -h
df -h
```

### 3. Rollback Options

**Option A: Restart with Previous Version**
```bash
git checkout previous-tag
npm install
npm start
```

**Option B: Restore Database**
```bash
# Stop services
docker-compose stop

# Restore backup
psql smart_whatsapp < backup_20251121.sql

# Start services
docker-compose up -d
```

**Option C: Manual Hotfix**
```bash
# Fix code
git cherry-pick fix-commit

# Rebuild
npm run build
docker build -t bot:hotfix .
docker run -it bot:hotfix
```

### 4. Test Before Resuming
```bash
# Verify database
psql smart_whatsapp -c "SELECT COUNT(*) FROM users;"

# Test bot manually
# Send !test from WhatsApp

# Check API
curl http://localhost:4001/health

# Monitor for 30 minutes
watch 'docker-compose logs bot | tail -20'
```

---

## Maintenance Schedule

### Daily
- [ ] Check error logs
- [ ] Monitor performance metrics
- [ ] Verify backups completed

### Weekly
- [ ] Review analytics
- [ ] Check database size
- [ ] Test backup restore
- [ ] Review security logs
- [ ] Check for updates

### Monthly
- [ ] Security audit
- [ ] Performance tuning
- [ ] Database optimization
  ```bash
  ANALYZE;
  VACUUM;
  REINDEX;
  ```
- [ ] Update dependencies
- [ ] Review capacity planning

### Quarterly
- [ ] Major updates
- [ ] Disaster recovery test
- [ ] Capacity planning review
- [ ] Security assessment
- [ ] Performance baseline

---

## Troubleshooting Production Issues

### High Database Connections
```bash
# Check connections
psql -c "SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;"

# Kill idle connections
psql -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle';"

# Solution: Increase pool size or add connection pooling (PgBouncer)
```

### Redis Memory Issues
```bash
# Check memory usage
redis-cli INFO memory

# Clear old data
redis-cli FLUSHDB  # CAREFUL! Clears everything

# Solution: Implement expiration policies or upgrade to larger instance
```

### Bot Stuck/Unresponsive
```bash
# Check process
ps aux | grep node

# Check logs
tail -100 /var/log/whatsapp-bot.log

# Restart bot
docker-compose restart bot

# Solution: Add monitoring to auto-restart if needed
```

### API Slow
```bash
# Check slow queries
psql -c "SELECT * FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"

# Check indexes
psql -c "\d+ table_name"

# Solution: Add indexes or optimize queries
```

---

## Documentation

Create these documents:

1. **Runbook** - Step-by-step procedures for common operations
2. **Architecture Diagram** - System component overview
3. **API Reference** - Updated for production URLs
4. **Monitoring Guide** - Dashboards and alerts setup
5. **Incident Response** - How to handle outages
6. **Security Policy** - Data protection, access control
7. **Backup Procedure** - How backups work and recovery
8. **Scaling Guide** - When and how to scale

---

## Success Metrics

### Availability
- [ ] 99.5% uptime target
- [ ] < 1% error rate
- [ ] < 5s response time (p99)

### Performance
- [ ] Bot responds < 1 second
- [ ] API responds < 500ms
- [ ] Orders process < 2 seconds

### Business
- [ ] Track user growth
- [ ] Monitor order volume
- [ ] Revenue tracking
- [ ] Customer satisfaction

---

## Support Contacts

**During Production Issues**:
1. On-call engineer: <phone>
2. Platform lead: <email>
3. DevOps team: <slack-channel>
4. Executive: <email> (critical only)

**Communication**:
- [ ] Status page updated
- [ ] Slack notification sent
- [ ] Email notification sent (if SLA breach)
- [ ] Post-mortem scheduled

---

## Sign-Off Checklist

Before going live, all must approve:

- [ ] Development lead
- [ ] DevOps/Infrastructure team
- [ ] QA/Testing team
- [ ] Product manager
- [ ] CEO/Stakeholder

---

## Congratulations! 🎉

Your Smart WhatsApp Bot Platform is ready for production!

**Next Steps**:
1. Monitor closely for 24 hours
2. Gather user feedback
3. Plan Phase 2 improvements
4. Schedule post-launch review

**Support the team** and celebrate the launch! 🚀
