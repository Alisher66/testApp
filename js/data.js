

export class LocalData {

    constructor() {

    }

    initDB(arr) {
        let openRequest = indexedDB.open("Quiz", 1);
        let db;
        openRequest.onupgradeneeded = () => {
            db = openRequest.result;
            arr.forEach(item => {
                this.creatTables(db, item.key, item.data);
            });
        }

        openRequest.onerror = () => {
            console.error("Error");
        };

        openRequest.onsuccess = () => {
            db = openRequest.result;
        };
    }

    creatTables(db, key, arr) {
        let objectStore = db.createObjectStore(key, {
            keyPath: 'id',
            autoIncrement: true,
        });
    
        for (let i in arr) {
            objectStore.add(arr[i]);
        }
    }

    open(fn) {
        let openRequest = indexedDB.open("Quiz", 1);
        let db;

        openRequest.onerror = () => {
            console.error("Error");
        };

        openRequest.onsuccess = () => {
            db = openRequest.result;
            fn(db);
        };
    }
    getAll(db){
        let transaction = db.transaction("subjects").objectStore("subjects").getAll();
        transaction.onsuccess = function() {
            
        }
    }

}