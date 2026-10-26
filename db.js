/* Health Dashboard local-first data layer. Personal data never needs to leave this browser profile. */
const HealthDB = (() => {
  const DB_NAME = 'HealthDashboardDB';
  const DB_VERSION = 2;
  const STORES = ['profile','measurements','habits','activities','nutrition','goals','journal','injuries','lessons','achievements','settings'];
  let dbPromise;

  function open(){
    if(dbPromise) return dbPromise;
    dbPromise = new Promise((resolve,reject)=>{
      const request = indexedDB.open(DB_NAME,DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        for(const store of STORES){
          if(!db.objectStoreNames.contains(store)) db.createObjectStore(store,{keyPath:'id'});
        }
      };
      request.onsuccess = () => { const db=request.result; db.onversionchange=()=>db.close(); resolve(db); };
      request.onerror = () => reject(request.error);
      request.onblocked = () => console.warn('Health Dashboard database upgrade is waiting for another tab/window to close.');
    });
    return dbPromise;
  }
  function result(request){return new Promise((resolve,reject)=>{request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});}
  async function getAll(store){const db=await open();return result(db.transaction(store,'readonly').objectStore(store).getAll());}
  async function get(store,id){const db=await open();return result(db.transaction(store,'readonly').objectStore(store).get(id));}
  async function put(store,item){const db=await open();return new Promise((resolve,reject)=>{const tx=db.transaction(store,'readwrite');tx.objectStore(store).put(item);tx.oncomplete=()=>resolve(item);tx.onerror=()=>reject(tx.error);});}
  async function remove(store,id){const db=await open();return new Promise((resolve,reject)=>{const tx=db.transaction(store,'readwrite');tx.objectStore(store).delete(id);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);});}
  async function clear(store){const db=await open();return new Promise((resolve,reject)=>{const tx=db.transaction(store,'readwrite');tx.objectStore(store).clear();tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);});}
  async function exportAll(){const data={};for(const store of STORES)data[store]=await getAll(store);return data;}
  async function replaceAll(data){const db=await open();return new Promise((resolve,reject)=>{const tx=db.transaction(STORES,'readwrite');for(const storeName of STORES){const store=tx.objectStore(storeName);store.clear();for(const item of data[storeName]||[])store.put(item);}tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}
  return {DB_NAME,DB_VERSION,STORES,open,getAll,get,put,remove,clear,exportAll,replaceAll};
})();
