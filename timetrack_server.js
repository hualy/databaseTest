var http = require('http');
var mysql = require('mysql');
var work = require('./lib/timetrack');

//连接MySQL
var db = mysql.createConnection({
    host:     '127.0.0.1',
    user:     'root',
    password: '123456',
    database: 'timetrack'
});
//HTTP 请求路由
var server = http.createServer(function(req, res) {
    switch (req.method) {
        case 'POST':        //HTTP POST请求路由
            switch(req.url) {
                case '/':
                    work.add(db, req, res);
                    break;
                case '/archive':
                    work.archive(db, req, res);
                    break;
                case '/delete':
                    work.delete(db, req, res);
                    break;
            }
            break;
        case 'GET':         //HTTP GET请求路由
            switch(req.url) {
                case '/':
                    work.show(db, res);
                    break;
                case '/archived':
                    work.showArchived(db, res);
            }
            break;
    }
});
//创建数据库表
db.query(
    "CREATE TABLE IF NOT EXISTS work ("     //建表SQL
    + "id INT(10) NOT NULL AUTO_INCREMENT, "
    + "hours DECIMAL(5,2) DEFAULT 0, "
    + "date DATE, "
    + "archived INT(1) DEFAULT 0, "
    + "description LONGTEXT,"
    + "PRIMARY KEY(id))",
    function(err) {
        if (err) throw err;
        console.log('Server started...');
        server.listen(3000, '127.0.0.1');       //启动HTTP服务器
    }
);
