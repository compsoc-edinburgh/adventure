import Database from "better-sqlite3";
export const db = new Database("database.db");
db.pragma("journal_mode = WAL");

const schema_updates = [
  `
  CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    is_admin BOOLEAN NOT NULL DEFAULT 0,
    aoc_id INTEGER,
    discord_username TEXT,
    email TEXT,
    is_physically_in_edinburgh BOOLEAN NOT NULL DEFAULT 0,
    registered_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
    gained_stars INTEGER NOT NULL DEFAULT 0,
    deleted_at INTEGER DEFAULT NULL
  );
  `,

  `
  CREATE TABLE shop_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    image_url TEXT,
    name TEXT NOT NULL DEFAULT "Unnamed Item",
    description TEXT NOT NULL DEFAULT "The description is empty.",
    star_cost INTEGER NOT NULL DEFAULT 0,
    stock_count INTEGER NOT NULL DEFAULT 0
  );
  `,

  `
  CREATE TABLE shop_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    shop_item_id INTEGER NOT NULL REFERENCES shop_items(id),
    transaction_time INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_valid BOOLEAN NOT NULL DEFAULT 1
  );
  `,
];

export type User = {
  id: number;
  is_admin: boolean;
  aoc_id?: number;
  discord_username?: string;
  email?: string;
  is_physically_in_edinburgh: boolean;
  registered_at: number;
  gained_stars: number;
  deleted_at?: number;
};

export type ShopItem = {
  id: number;
  image_url?: string;
  name: string;
  description: string;
  star_cost: number;
  stock_count: number;
};

export type ShopTransaction = {
  id: number;
  user_id: number;
  shop_item_id: number;
  transaction_time: number;
  is_valid: boolean;
};

export function runMigrations() {
  console.log("Running migrations if any...");
  let user_version: number = db.pragma("user_version", { simple: true }) as number;

  // Run schema updates until the user_version is up to date
  while (user_version < schema_updates.length) {
    console.log(`Migrating schema to version ${user_version + 1}`);
    db.exec(schema_updates[user_version]);
    db.pragma("user_version = " + (user_version + 1));
    user_version = db.pragma("user_version", { simple: true }) as number;
  }
};

export function getUserByAoCId(aoc_id: number): User {
  return db.prepare("SELECT * FROM users WHERE aoc_id = ?").get(aoc_id) as User;
}

export function getUserById(id: number): User {
  return db.prepare("SELECT * FROM users WHERE id = ?").get(id) as User;
}

export function createUser(aoc_id: number): User {
  const inserted_id = db.prepare("INSERT INTO users (aoc_id) VALUES (?)").run(aoc_id).lastInsertRowid;
  return db.prepare("SELECT * FROM users WHERE id = ?").get(inserted_id) as User;
}
