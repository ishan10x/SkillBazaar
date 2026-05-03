const db = require('./config/db');

async function test() {
  try {
    let limit = 8;
    let offset = 0;
    let query = `
      SELECT g.*, u.username AS seller_name, u.full_name AS seller_full_name,
             u.avatar_url AS seller_avatar, c.name AS category_name
      FROM gigs g
      JOIN users u ON g.seller_id = u.id
      JOIN categories c ON g.category_id = c.id
      WHERE g.is_active = TRUE
      ORDER BY g.created_at DESC LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
    `;
    const params = [];

    const [gigs] = await db.execute(query, params);
    console.log("Success! Found gigs:", gigs.length);
  } catch (err) {
    console.error("Database error:", err);
  }
  process.exit(0);
}

test();
