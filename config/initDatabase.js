const fs = require('fs')
require('dotenv').config();
async function main() {
    const mysql = require('mysql2/promise')
    const con = await mysql.createConnection(
        {
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USERNAME,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
            rowsAsArray: true
        }
    );

    var sql = await fs.readFileSync('./create.sql', 'utf-8')
    sql = sql.split(';');

    for (let index = 0; index < sql.length; index++) {
        const q = sql[index].replace(/[\r\n]+/g, " ")
        if (q != "") {
            await con.execute(q);
        }
    }
    con.end();
}

main();