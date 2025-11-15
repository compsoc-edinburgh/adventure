import Database from "better-sqlite3";
import path from "path";
import { env } from "process";

export const db = new Database(path.join(env.ABS_DATA_DIR as string, "database.db"));
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

  `
  ALTER TABLE shop_transactions ADD COLUMN cancelled_at INTEGER DEFAULT NULL;
  UPDATE shop_transactions SET cancelled_at = CURRENT_TIMESTAMP where is_valid = 0;
  ALTER TABLE shop_transactions DROP COLUMN is_valid;
  `,

  `
  ALTER TABLE shop_items ADD COLUMN max_per_user INTEGER DEFAULT 1;
  `,

  `
  INSERT INTO users (is_admin, aoc_id, email, is_physically_in_edinburgh, gained_stars) VALUES (1, 0, 'hello@comp-soc.com', 1, 999);
  `,

  `
  ALTER TABLE users ADD COLUMN discord_id TEXT DEFAULT NULL;
  ALTER TABLE users DROP COLUMN discord_username;
  `,
];

export type User = {
  id: number;
  is_admin: boolean;
  aoc_id?: number;
  discord_id?: string;
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
  max_per_user: number;
};

export type ShopItemWithRemaining = ShopItem & { remaining_count: number };

export type ShopTransaction = {
  id: number;
  user_id: number;
  shop_item_id: number;
  transaction_time: number;
  cancelled_at?: number;
};

export function runMigrations() {
  console.info("Running migrations if any...");
  let user_version: number = db.pragma("user_version", { simple: true }) as number;

  // Run schema updates until the user_version is up to date
  while (user_version < schema_updates.length) {
    console.info(`Migrating schema to version ${user_version + 1}`);
    db.transaction(() => {
      db.exec(schema_updates[user_version]);
      db.pragma("user_version = " + (user_version + 1));
    })();
    user_version = db.pragma("user_version", { simple: true }) as number;
  }
};

export function getUserByAoCId(aoc_id: number): User {
  const userRow = db.prepare("SELECT * FROM users WHERE aoc_id = ?").get(aoc_id);

  // SQLite3 does not support boolean types and thus we store booleans as numbers. Convert them back.
  if (userRow) {
    // @ts-ignore
    userRow.is_admin = !!userRow.is_admin;
    // @ts-ignore
    userRow.is_physically_in_edinburgh = !!userRow.is_physically_in_edinburgh;
  }

  return userRow as User;
}

export function getUserById(id: number): User {
  const userRow = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as User;

  // SQLite3 does not support boolean types and thus we store booleans as numbers. Convert them back.
  if (userRow) {
    // @ts-ignore
    userRow.is_admin = !!userRow.is_admin;
    // @ts-ignore
    userRow.is_physically_in_edinburgh = !!userRow.is_physically_in_edinburgh;
  }

  return userRow as User;
}

export function createUser(aoc_id: number): User {
  const inserted_id = db.prepare("INSERT INTO users (aoc_id) VALUES (?)").run(aoc_id).lastInsertRowid;
  return db.prepare("SELECT * FROM users WHERE id = ?").get(inserted_id) as User;
}

export function updateUserDiscordId(id: number, discord_id: string) {
  db.prepare("UPDATE users SET discord_id = ? WHERE id = ?").run(discord_id, id);
}

export function updateUserDetails(id: number, email: string, in_edinburgh: boolean) {
  db.prepare("UPDATE users SET email = ?, is_physically_in_edinburgh = ? WHERE id = ?").run(email, in_edinburgh ? 1 : 0, id);
}

export function updateUserStars(user_id: number, stars: number) {
  db.prepare("UPDATE users SET gained_stars = ? WHERE id = ?").run(stars, user_id);
}

export function getUsers(): User[] {
  return db.prepare("SELECT * FROM users").all() as User[];
}

export function getShopItems(): ShopItem[] {
  return db.prepare("SELECT * FROM shop_items").all() as ShopItem[];
}

export function getShopItemById(id: number): ShopItem {
  return db.prepare("SELECT * FROM shop_items WHERE id = ?").get(id) as ShopItem;
}

export function createShopItem(image_url: string, name: string, description: string, star_cost: number, stock_count: number, max_per_user: number): ShopItem {
  const inserted_id = db.prepare("INSERT INTO shop_items (image_url, name, description, star_cost, stock_count, max_per_user) VALUES (?, ?, ?, ?, ?, ?)").run(image_url, name, description, star_cost, stock_count, max_per_user).lastInsertRowid;
  return db.prepare("SELECT * FROM shop_items WHERE id = ?").get(inserted_id) as ShopItem;
}

export function updateShopItem(id: number, image_url: string, name: string, description: string, star_cost: number, stock_count: number, max_per_user: number) {
  db.prepare("UPDATE shop_items SET image_url = ?, name = ?, description = ?, star_cost = ?, stock_count = ?, max_per_user = ? WHERE id = ?").run(image_url, name, description, star_cost, stock_count, max_per_user, id);
}

export function getTransactionsByUserId(user_id: number): ShopTransaction[] {
  return db.prepare("SELECT * FROM shop_transactions WHERE user_id = ?").all(user_id) as ShopTransaction[];
}

export function getTransactionsByItemId(shop_item_id: number): ShopTransaction[] {
  return db.prepare("SELECT * FROM shop_transactions WHERE shop_item_id = ?").all(shop_item_id) as ShopTransaction[];
}

export function getTransactions(): ShopTransaction[] {
  return db.prepare("SELECT * FROM shop_transactions").all() as ShopTransaction[];
}

export function createTransaction(user_id: number, shop_item_id: number): ShopTransaction {
  const inserted_id = db.prepare("INSERT INTO shop_transactions (user_id, shop_item_id) VALUES (?, ?)").run(user_id, shop_item_id).lastInsertRowid;
  return db.prepare("SELECT * FROM shop_transactions WHERE id = ?").get(inserted_id) as ShopTransaction;
}

export function cancelTransaction(transaction_id: number) {
  db.prepare("UPDATE shop_transactions SET cancelled_at = CURRENT_TIMESTAMP WHERE id = ?").run(transaction_id);
}
