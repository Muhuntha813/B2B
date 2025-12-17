# Fast Database Queries for B2B Plastics SRM

## Overview
This document contains optimized SQL queries to fetch all data from the database quickly.

## Table Structure
- `users` - User accounts
- `jobs` - Job postings
- `bids` - Bids on jobs
- `conversations` - Chat conversations
- `conversation_messages` - Chat messages
- `orders` - Customer orders
- `testimonials` - Customer testimonials
- `banners` - Banner images
- `sponsors` - Sponsor information

---

## 1. Fetch All Jobs (Fast)
```sql
-- Get all jobs with user info (optimized with LEFT JOIN)
SELECT 
  j.*,
  u.display_name as user_name,
  u.email as user_email,
  j.firebase_uid as owner_uid,
  (SELECT COUNT(*) FROM bids WHERE job_id = j.id) as bids_count
FROM jobs j
LEFT JOIN users u ON j.user_id = u.id
ORDER BY j.posted_date DESC;
```

## 2. Fetch All Users (Fast)
```sql
-- Get all users
SELECT 
  id,
  firebase_uid,
  email,
  display_name,
  photo_url,
  role,
  created_at,
  updated_at,
  last_login
FROM users
ORDER BY created_at DESC;
```

## 3. Fetch All Bids (Fast)
```sql
-- Get all bids with job and bidder info
SELECT 
  b.*,
  j.title as job_title,
  j.budget as job_budget,
  j.status as job_status
FROM bids b
LEFT JOIN jobs j ON b.job_id = j.id
ORDER BY b.created_at DESC;
```

## 4. Fetch All Conversations (Fast)
```sql
-- Get all conversations with job info
SELECT 
  c.*,
  j.title as job_title,
  j.status as job_status
FROM conversations c
LEFT JOIN jobs j ON c.job_id = j.id
ORDER BY c.last_message_time DESC;
```

## 5. Fetch All Messages (Fast)
```sql
-- Get all messages with conversation info
SELECT 
  m.*,
  c.job_id,
  c.job_title
FROM conversation_messages m
LEFT JOIN conversations c ON m.conversation_id = c.id
ORDER BY m.timestamp DESC;
```

## 6. Fetch All Orders (Fast)
```sql
-- Get all orders with user info
SELECT 
  o.*,
  u.display_name as user_name,
  u.email as user_email
FROM orders o
LEFT JOIN users u ON o.user_id = u.id
ORDER BY o.created_at DESC;
```

## 7. Fetch All Testimonials (Fast)
```sql
-- Get all active testimonials
SELECT *
FROM testimonials
WHERE active = true
ORDER BY created_at DESC;
```

## 8. Fetch All Banners (Fast)
```sql
-- Get all active banners
SELECT *
FROM banners
WHERE active = true
ORDER BY created_at DESC;
```

## 9. Fetch All Sponsors (Fast)
```sql
-- Get all active sponsors
SELECT *
FROM sponsors
WHERE active = true
ORDER BY created_at DESC;
```

---

## 10. Comprehensive Dashboard Query (Everything at Once)
```sql
-- Get complete database overview (very fast)
SELECT 
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM jobs) as total_jobs,
  (SELECT COUNT(*) FROM jobs WHERE status = 'Open') as open_jobs,
  (SELECT COUNT(*) FROM bids) as total_bids,
  (SELECT COUNT(*) FROM conversations) as total_conversations,
  (SELECT COUNT(*) FROM conversation_messages) as total_messages,
  (SELECT COUNT(*) FROM orders) as total_orders,
  (SELECT COUNT(*) FROM testimonials WHERE active = true) as active_testimonials,
  (SELECT COUNT(*) FROM banners WHERE active = true) as active_banners,
  (SELECT COUNT(*) FROM sponsors WHERE active = true) as active_sponsors;
```

---

## 11. Optimized Queries with Pagination

### Jobs with Pagination
```sql
-- Get jobs with pagination (limit 20 per page)
SELECT 
  j.*,
  u.display_name as user_name,
  u.email as user_email,
  j.firebase_uid as owner_uid
FROM jobs j
LEFT JOIN users u ON j.user_id = u.id
ORDER BY j.posted_date DESC
LIMIT 20 OFFSET 0;  -- Change OFFSET for page 2, 3, etc. (0, 20, 40...)
```

### Messages with Pagination
```sql
-- Get recent messages (limit 50)
SELECT 
  m.*,
  c.job_title
FROM conversation_messages m
LEFT JOIN conversations c ON m.conversation_id = c.id
ORDER BY m.timestamp DESC
LIMIT 50;
```

---

## 12. Fast Statistics Query
```sql
-- Get statistics for admin dashboard (single query)
SELECT 
  'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'jobs', COUNT(*) FROM jobs
UNION ALL
SELECT 'open_jobs', COUNT(*) FROM jobs WHERE status = 'Open'
UNION ALL
SELECT 'bids', COUNT(*) FROM bids
UNION ALL
SELECT 'conversations', COUNT(*) FROM conversations
UNION ALL
SELECT 'messages', COUNT(*) FROM conversation_messages
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'testimonials', COUNT(*) FROM testimonials WHERE active = true
UNION ALL
SELECT 'banners', COUNT(*) FROM banners WHERE active = true
UNION ALL
SELECT 'sponsors', COUNT(*) FROM sponsors WHERE active = true;
```

---

## 13. Fast Recent Activity Query
```sql
-- Get recent activity across all tables
SELECT 
  'job' as type,
  id::text as item_id,
  title as description,
  posted_date as timestamp,
  firebase_uid as user_id
FROM jobs
WHERE posted_date >= CURRENT_DATE - INTERVAL '7 days'

UNION ALL

SELECT 
  'bid' as type,
  id::text as item_id,
  'Bid placed' as description,
  created_at::date as timestamp,
  bidder_uid as user_id
FROM bids
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'

UNION ALL

SELECT 
  'order' as type,
  id::text as item_id,
  'Order placed' as description,
  created_at::date as timestamp,
  user_id::text as user_id
FROM orders
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'

ORDER BY timestamp DESC
LIMIT 50;
```

---

## Performance Tips

1. **Use Indexes**: Ensure these columns are indexed:
   - `jobs.posted_date`
   - `jobs.status`
   - `jobs.firebase_uid`
   - `bids.job_id`
   - `bids.bidder_uid`
   - `conversation_messages.timestamp`
   - `orders.created_at`

2. **Limit Results**: Always use `LIMIT` for large datasets

3. **Select Specific Columns**: Don't use `SELECT *` if you only need specific fields

4. **Use JOINs Efficiently**: LEFT JOIN only when needed, use INNER JOIN when foreign keys are guaranteed

5. **Cache Frequently Accessed Data**: Cache dashboard stats and counts

---

## Example: Create Indexes for Performance
```sql
-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_jobs_posted_date ON jobs(posted_date DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_firebase_uid ON jobs(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_bids_job_id ON bids(job_id);
CREATE INDEX IF NOT EXISTS idx_bids_bidder_uid ON bids(bidder_uid);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON conversation_messages(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_job_id ON conversations(job_id);
```

---

## Quick Test Queries

### Test all tables exist and have data
```sql
SELECT 
  'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL SELECT 'jobs', COUNT(*) FROM jobs
UNION ALL SELECT 'bids', COUNT(*) FROM bids
UNION ALL SELECT 'conversations', COUNT(*) FROM conversations
UNION ALL SELECT 'conversation_messages', COUNT(*) FROM conversation_messages
UNION ALL SELECT 'orders', COUNT(*) FROM orders
UNION ALL SELECT 'testimonials', COUNT(*) FROM testimonials
UNION ALL SELECT 'banners', COUNT(*) FROM banners
UNION ALL SELECT 'sponsors', COUNT(*) FROM sponsors;
```


