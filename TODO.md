# Task Progress: Fix MongoDB Connection Timeout

## TODO Steps (from approved plan):
- [x] 1. Create `backend/src/utils/db.js` - Centralized DB connection with retries
- [x] 2. Update `backend/server.js` - Use async connectDB(), start server only after success
- [x] 3. Update `backend/src/app.js` - Add `/api/health` endpoint for DB status check
- [x] 4. Test connection: `cd backend && npm run dev` → Used `node server.js` (nodemon missing)
- [x] 5. Verify: curl http://localhost:5000/api/health ✓

**COMPLETE! Server & DB healthy. Use Ctrl+C to stop, nodemon optional.**

Progress will be updated after each step.

