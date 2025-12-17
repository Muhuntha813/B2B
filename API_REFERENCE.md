# API Reference

Base URL: `${VITE_API_BASE_URL}` (default `http://localhost:3001/api`)

Auth
- `POST /auth/login` {email,password} → {token,role,uid}

Admin
- `GET /admin/users` (ADMIN)
- `DELETE /admin/users/:id` (ADMIN)
- `GET /admin/stats` (ADMIN)
- `GET /admin/sponsors` (ADMIN)
- `GET /admin/orders?page=&pageSize=` (ADMIN)
- `GET /admin/reports` (ADMIN)

Content
- `GET /banners`, `POST /banners`, `PUT /banners/:id`, `DELETE /banners/:id`
- `GET /testimonials`, `POST /testimonials`, `PUT /testimonials/:id`, `DELETE /testimonials/:id`
- `GET /sponsors`, `POST /sponsors`, `PUT /sponsors/:id`, `DELETE /sponsors/:id`

Products & Commerce
- `GET /products`
- `GET /cart?firebase_uid=` (JWT) → {cartId,items}
- `POST /cart/items` (JWT) {firebase_uid,product_id,qty}
- `PATCH /cart/items/:id` (JWT) {qty}
- `DELETE /cart/items/:id` (JWT)
- `POST /checkout` (JWT) {firebase_uid,address,paymentMethod}

Messages (DM)
- `POST /messages` (JWT) {sender_uid,receiver_uid,product_id?,body}
- `GET /messages/thread?user_uid=&peer_uid=&product_id=` (JWT)
- `POST /messages/read` (JWT) {user_uid,peer_uid}

Forum
- `GET /forum/posts?page=&pageSize=&search=`
- `POST /forum/posts` (JWT) {user_uid,title,content}
- `GET /forum/posts/:id/comments`
- `POST /forum/posts/:id/comments` (JWT) {user_uid,content}

See `requests.http` for examples.