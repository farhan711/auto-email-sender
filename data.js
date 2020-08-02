"use strict";
const MongoClient = require('mongodb').MongoClient;
var url = '';

const MONGODB_URI = url; // or Atlas connection string

let cachedDb = null;

function connectToDatabase (uri) {
  console.log('=> connect to database');

  if (cachedDb) {
    console.log('=> using cached database instance');
    return Promise.resolve(cachedDb);
  }

  return MongoClient.connect(uri,{ useNewUrlParser: true })
    .then((db) => {
      cachedDb = db.db();
       return cachedDb;
    }).catch(err => {
        console.log('=> an error occurred: ', err);
        return { statusCode: 500, body: 'error' };
      });
}

function queryDatabase (db,tableName) {
    console.log('=> query database');
    return db.collection(tableName).find({ show_on_ui: true,
        'location.uuid': '3747386c-9077-4073-b858-649db0ce9d90' }).toArray()
      .then((e) => {
           return e; 
        })
      .catch(err => {
        console.log('=> an error occurred: ', err);
        return { statusCode: 500, body: 'error' };
      });
  }
 var get=(collection)=>{
    return  new Promise((resolve,reject) => { 
    connectToDatabase(MONGODB_URI)
        .then(db=>queryDatabase(db,collection))
        .then(result=>
            {
                console.log('=> returning result: ', result);
                resolve(result);
            })
            .catch(err => {
                console.log('=> an error occurred: ', err);
                reject(err);
              });
        });   
  }

  function intsertIntoDB (db,tableName,data) {
    console.log('=> insert database');
    return  db.collection(tableName).save(data,function(error,result){
        if(error)
        {
            throw new error(error);
        }
        else{
            return result;
        }
    });
  }

  var insert=(data,collection)=>{
    return  new Promise((resolve,reject) => { 
        connectToDatabase(MONGODB_URI)
            .then((db)=> intsertIntoDB(db,collection,data)) 
            .then(result=>
                {
                    console.log('=> returning result: ', result);
                    resolve(result);
                })
                .catch(err => {
                    console.log('=> an error occurred: ', err);
                    reject(err);
                  });
            });   

  }

  module.exports = {
    get,insert
}
