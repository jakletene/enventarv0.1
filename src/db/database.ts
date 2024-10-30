import initSqlJs from 'sql.js';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DatabaseState {
  db: any;
  initialized: boolean;
  initDatabase: () => Promise<void>;
  executeQuery: (sql: string, params?: any[]) => Promise<any[]>;
  saveDatabase: () => void;
}

export const useDatabase = create<DatabaseState>()(
  persist(
    (set, get) => ({
      db: null,
      initialized: false,
      initDatabase: async () => {
        if (!get().initialized) {
          try {
            const SQL = await initSqlJs({
              locateFile: file => `https://sql.js.org/dist/${file}`
            });

            let db;
            const savedData = localStorage.getItem('inventory_db');
            
            if (savedData) {
              try {
                const dataArray = new Uint8Array(JSON.parse(savedData));
                db = new SQL.Database(dataArray);
              } catch (error) {
                console.error('Error loading saved database:', error);
                db = new SQL.Database();
              }
            } else {
              db = new SQL.Database();
            }

            // Initialize tables
            db.exec(`
              CREATE TABLE IF NOT EXISTS products (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                price REAL NOT NULL,
                stockLevel INTEGER NOT NULL,
                variants INTEGER,
                warehouseId TEXT NOT NULL,
                images TEXT DEFAULT '[]',
                createdAt TEXT NOT NULL
              );

              CREATE TABLE IF NOT EXISTS warehouses (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                location TEXT NOT NULL,
                contact TEXT NOT NULL,
                shippingMethods TEXT DEFAULT '[]',
                createdAt TEXT NOT NULL
              );

              CREATE TABLE IF NOT EXISTS orders (
                id TEXT PRIMARY KEY,
                warehouseId TEXT NOT NULL,
                origin TEXT NOT NULL,
                sender TEXT NOT NULL,
                items TEXT NOT NULL,
                status TEXT NOT NULL,
                sendDate TEXT NOT NULL,
                createdAt TEXT NOT NULL,
                FOREIGN KEY(warehouseId) REFERENCES warehouses(id)
              );

              CREATE TABLE IF NOT EXISTS suppliers (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                contact TEXT NOT NULL,
                address TEXT NOT NULL,
                products TEXT DEFAULT '[]',
                createdAt TEXT NOT NULL
              );

              CREATE TABLE IF NOT EXISTS clients (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                phone TEXT NOT NULL,
                address TEXT NOT NULL,
                createdAt TEXT NOT NULL
              );

              CREATE TABLE IF NOT EXISTS expenses (
                id TEXT PRIMARY KEY,
                description TEXT NOT NULL,
                amount REAL NOT NULL,
                vat REAL NOT NULL,
                date TEXT NOT NULL,
                createdAt TEXT NOT NULL
              );

              CREATE TABLE IF NOT EXISTS order_items_status (
                id TEXT PRIMARY KEY,
                orderId TEXT NOT NULL,
                productId TEXT NOT NULL,
                status TEXT DEFAULT 'unsold',
                createdAt TEXT NOT NULL,
                updatedAt TEXT NOT NULL,
                FOREIGN KEY(orderId) REFERENCES orders(id),
                FOREIGN KEY(productId) REFERENCES products(id)
              );
            `);

            set({ db, initialized: true });
            get().saveDatabase();
          } catch (error) {
            console.error('Failed to initialize SQL.js:', error);
            throw error;
          }
        }
      },
      executeQuery: async (sql: string, params: any[] = []) => {
        const { db, initialized } = get();
        if (!initialized || !db) {
          await get().initDatabase();
        }
        
        try {
          const stmt = get().db.prepare(sql);
          
          if (params.length > 0) {
            stmt.bind(params);
          }
          
          const result = [];
          while (stmt.step()) {
            result.push(stmt.getAsObject());
          }
          stmt.free();
          
          // Save database after modifications
          if (!sql.toLowerCase().trim().startsWith('select')) {
            get().saveDatabase();
          }
          
          return result;
        } catch (error) {
          console.error('Failed to execute query:', error);
          console.error('SQL:', sql);
          console.error('Params:', params);
          return [];
        }
      },
      saveDatabase: () => {
        const { db } = get();
        if (db) {
          try {
            const data = db.export();
            const buffer = new Uint8Array(data);
            localStorage.setItem('inventory_db', JSON.stringify(Array.from(buffer)));
          } catch (error) {
            console.error('Failed to save database:', error);
          }
        }
      }
    }),
    {
      name: 'inventory_db_state',
      storage: {
        getItem: (name) => {
          const data = localStorage.getItem(name);
          return data ? JSON.parse(data) : null;
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      },
    }
  )
);