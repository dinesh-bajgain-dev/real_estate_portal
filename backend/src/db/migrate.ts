import pool from './pool';
import bcrypt from 'bcryptjs';

const migrate = async () => {
  const client = await pool.connect();

  try {
    console.log('🚀 Running migrations...');

    await client.query('BEGIN');

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name        VARCHAR(100) NOT NULL,
        email       VARCHAR(255) UNIQUE NOT NULL,
        password    VARCHAR(255) NOT NULL,       -- bcrypt hash, never plain text
        role        VARCHAR(50) NOT NULL DEFAULT 'buyer',
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Properties table — seed data for demo
    await client.query(`
      CREATE TABLE IF NOT EXISTS properties (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title         VARCHAR(255) NOT NULL,
        address       VARCHAR(255) NOT NULL,
        price         NUMERIC(15, 2) NOT NULL,
        bedrooms      INT NOT NULL,
        bathrooms     INT NOT NULL,
        area_sqft     INT NOT NULL,
        image_url     TEXT,
        property_type VARCHAR(50) NOT NULL DEFAULT 'house',
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Favourites join table — enforces one record per user+property pair
    await client.query(`
      CREATE TABLE IF NOT EXISTS favourites (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (user_id, property_id)             -- prevents duplicates at DB level
      );
    `);

    // Index for fast lookup of a user's favourites
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_favourites_user_id ON favourites(user_id);
    `);

    // Index for fast email lookup during login
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);

    // Seed properties if table is empty
    const { rows } = await client.query('SELECT COUNT(*) FROM properties');
    if (parseInt(rows[0].count) === 0) {
      await client.query(`
        INSERT INTO properties (title, address, price, bedrooms, bathrooms, area_sqft, image_url, property_type) VALUES
        ('Sunlit Villa', '14 Crescent Ave, Kathmandu', 45000000, 4, 3, 2800, 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800', 'villa'),
        ('Modern Apartment', '7B Lazimpat Road, Kathmandu', 12500000, 2, 2, 950, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', 'apartment'),
        ('Garden Cottage', '3 Boudha Ring Road, Kathmandu', 8900000, 3, 1, 1200, 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800', 'house'),
        ('Penthouse Suite', '22nd Floor, New Baneshwor Tower', 75000000, 3, 3, 2200, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800', 'penthouse'),
        ('Townhouse', '9 Sanepa Heights, Lalitpur', 22000000, 4, 2, 1800, 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800', 'house'),
        ('Studio Flat', '5 Thamel Street, Kathmandu', 5500000, 1, 1, 480, 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800', 'apartment'),
        ('Heritage Bungalow', '1 Patan Durbar Marg', 35000000, 5, 4, 3500, 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800', 'villa'),
        ('River View Flat', '18 Bagmati Riverside, Lalitpur', 16000000, 2, 2, 1050, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 'apartment');
      `);
      console.log('✅ Seed properties inserted');
    }

    // Seed admin user if no admin exists
    const adminCheck = await client.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
    if (adminCheck.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('Admin@1234', 12);
      await client.query(
        `INSERT INTO users (name, email, password, role)
         VALUES ($1, $2, $3, 'admin')
         ON CONFLICT (email) DO NOTHING`,
        ['Super Admin', 'admin@estateportal.com', hashedPassword]
      );
      console.log('✅ Admin user created  →  admin@estateportal.com / Admin@1234');
    }

    await client.query('COMMIT');
    console.log('✅ Migrations complete');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

migrate();
