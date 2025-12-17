# Testing

Backend tests (Jest)
- Health check: `backend/__tests__/health.test.js`
- Auth smoke: `backend/__tests__/auth_smoke.test.js` logs in as admin and hits `/api/admin/stats`.

Run
```
cd backend
npm test
```

API smoke examples are in `requests.http`.