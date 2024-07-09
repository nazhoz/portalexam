import mysql from 'mysql2';

export const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "exam"
})

db.connect(err =>{
    if (err) throw err;
    console.log("Database Connected")
})