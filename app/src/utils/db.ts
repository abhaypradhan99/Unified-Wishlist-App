import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('wishlist.db');

export const initDb = () => {
  console.log('Initializing DB');
  try {
    db.transaction(tx => {
      console.log('Executing CREATE TABLE');
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS wishlist (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, image TEXT, price TEXT, domain TEXT, createdAt TEXT);'
      );
      console.log('Executing PRAGMA');
      tx.executeSql('PRAGMA user_version;', [], (_, { rows }) => {
        const version = rows.item(0).user_version || 0;
        console.log('DB version:', version);
        if (version < 1) {
          // v1 schema (assumed existing without normalizedUrl)
          tx.executeSql('PRAGMA user_version = 1;');
        }
        if (version < 2) {
          tx.executeSql('ALTER TABLE wishlist ADD COLUMN normalizedUrl TEXT;');
          tx.executeSql('PRAGMA user_version = 2;');
        }
      });
    }, (error) => {
      console.log('DB init error:', error);
    }, () => {
      console.log('DB init success');
    });
  } catch (e) {
    console.log('DB init exception:', e);
  }
};

export const addItem = (item: any, callback: (success: boolean) => void) => {
  console.log('Adding item:', item);
  console.log('DB type:', typeof db);
  console.log('DB transaction:', typeof db.transaction);
  try {
    db.transaction(tx => {
      console.log('Executing SELECT');
      tx.executeSql('SELECT * FROM wishlist WHERE normalizedUrl = ?;', [item.normalizedUrl], (_, { rows }) => {
        console.log('Duplicate check rows:', rows.length);
        if (rows.length > 0) {
          console.log('Item already exists');
          return callback(false); // Dedupe
        }
        console.log('Executing INSERT');
        tx.executeSql(
          'INSERT INTO wishlist (title, image, price, domain, createdAt, normalizedUrl) VALUES (?, ?, ?, ?, ?, ?);',
          [item.title, item.image, item.price, item.domain, item.createdAt, item.normalizedUrl],
          () => {
            console.log('Item inserted successfully');
            callback(true);
          },
          (_, error) => {
            console.log('Insert error:', error);
            callback(false);
            return false; // rollback
          }
        );
      }, (_, error) => {
        console.log('Select error:', error);
        callback(false);
        return false;
      });
    }, (error) => {
      console.log('Transaction error:', error);
      callback(false);
    }, () => {
      console.log('Transaction success');
    });
  } catch (e) {
    console.log('Add item exception:', e);
    callback(false);
  }
};

export const getItems = (callback: (items: any[]) => void) => {
  db.transaction(tx => {
    tx.executeSql('SELECT * FROM wishlist ORDER BY createdAt DESC;', [], (_, { rows }) => callback(rows._array));
  });
};

export const deleteItem = (id: number, callback: () => void) => {
  db.transaction(tx => {
    tx.executeSql('DELETE FROM wishlist WHERE id = ?;', [id], () => callback());
  });
};