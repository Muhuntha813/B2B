# Database Notes

Tables
- `users`: id, firebase_uid, email, display_name, photo_url, role, password_hash, created_at, updated_at, last_login
- `products`: id, name, price, category, image, created_at
- `carts`: id, user_id(FK users), created_at
- `cart_items`: id, cart_id(FK carts), product_id(FK products), qty, price_snapshot, created_at
- `orders`: id, user_id(FK users), total, status, created_at
- `order_items`: id, order_id(FK orders), product_id(FK products), qty, price_snapshot, created_at
- `messages`: id, sender_id(FK users), receiver_id(FK users), product_id NULLABLE, body, created_at, read_at
- `forum_posts`: id, user_id(FK users), title, content, created_at
- `forum_comments`: id, post_id(FK forum_posts), user_id(FK users), content, created_at
- `banners`, `testimonials`, `sponsors`

Relations
- One `user` has one `cart`; a `cart` has many `cart_items` referencing `products`.
- `orders` created from `cart_items`; `order_items` snapshot qty/price at checkout.
- `messages` link two users; optional `product_id` to tie DM to a product.
- `forum_posts` and `forum_comments` link to users.