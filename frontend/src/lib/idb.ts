import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'spotify-offline-db';
const STORE_NAME = 'songs';

let dbPromise: Promise<IDBPDatabase> | null = null;

const getDB = () => {
    if (!dbPromise) {
        dbPromise = openDB(DB_NAME, 1, {
            upgrade(db) {
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME);
                }
            },
        });
    }
    return dbPromise;
};

export const idbStorage = {
    async put(key: string, value: Blob) {
        const db = await getDB();
        return db.put(STORE_NAME, value, key);
    },
    async get(key: string): Promise<Blob | undefined> {
        const db = await getDB();
        return db.get(STORE_NAME, key);
    },
    async delete(key: string) {
        const db = await getDB();
        return db.delete(STORE_NAME, key);
    },
    async clear() {
        const db = await getDB();
        return db.clear(STORE_NAME);
    }
};
