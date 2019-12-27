const mysql = require('mysql2');

// connect to a database peoplebook running on your localmachine
const pool = mysql.createPool({
    host: 'aliyun.hyang.wang',  
    user: 'amber',
    database: 'amber',
    password: 'amber'
});

module.exports = pool.promise();