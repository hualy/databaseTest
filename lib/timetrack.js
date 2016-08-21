var qs = require('querystring');
//发送HTML响应
exports.sendHtml = function(res, html) {
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Length', Buffer.byteLength(html));
    res.end(html);
}
//解析HTTP POST数据
exports.parseReceivedData = function(req, cb) {
    var body = '';
    req.setEncoding('utf8');
    req.on('data', function(chunk){ body += chunk });
    req.on('end', function() {
        var data = qs.parse(body);
        cb(data);
    });
};
//渲染简单的表单
exports.actionForm = function(id, path, label) {
    var html = '<form method="POST" action="' + path + '">' +
        '<input type="hidden" name="id" value="' + id + '">' +
        '<input type="submit" value="' + label + '" />' +
        '</form>';
    return html;
};
//添加
exports.add = function(db, req, res) {
    exports.parseReceivedData(req, function(work) {//解析HTTP POST数据
        db.query(
            //添加工作记录的SQL
            "INSERT INTO work (hours, date, description) " +
            " VALUES (?, ?, ?)",
            [work.hours, work.date, work.description],//工作记录数据
            function(err) {
                if (err) throw err;
                exports.show(db, res);      //给用户显示工作记录清单
            }
        );
    });
};
//删除
exports.delete = function(db, req, res) {
    exports.parseReceivedData(req, function(work) {//解析HTTP POST数据
        db.query(
            //删除工作记录的SQL
            "DELETE FROM work WHERE id=?",
            [work.id],      //工作记录ID
            function(err) {
                if (err) throw err;
                exports.show(db, res);      //给用户显示工作记录清单
            }
        );
    });
};
//更新MySQL数据
exports.archive = function(db, req, res) {
    exports.parseReceivedData(req, function(work) {//解析HTTP POST数据
        db.query(
            //更新工作记录的SQL
            "UPDATE work SET archived=1 WHERE id=?",
            [work.id],      //工作记录ID
            function(err) {
                if (err) throw err;
                exports.show(db, res);      //给用户显示工作记录清单
            }
        );
    });
};
//获取MySQL数据
exports.show = function(db, res, showArchived) {
    //获取工作记录的SQL
    var query = "SELECT * FROM work " +
        "WHERE archived=? " +
        "ORDER BY date DESC";
    var archiveValue = (showArchived) ? 1 : 0;
    db.query(
        query,
        [archiveValue],         //想要的工作记录归档状态
        function(err, rows) {
            if (err) throw err;
            html = (showArchived)
                ? ''
                : '<a href="/archived">Archived Work</a><br/>';
            html += exports.workHitlistHtml(rows);      //将结果格式化为HTML表单
            html += exports.workFormHtml();             //给用户发送HTML响应
            exports.sendHtml(res, html);
        }
    );
};

exports.showArchived = function(db, res) {
    exports.show(db, res, true);            //只显示归档的工作记录
};
//渲染MySQL记录（将工作记录渲染为HTML表格）
exports.workHitlistHtml = function(rows) {
    var html = '<table>';
    for(var i in rows) {        //将每条工作记录渲染成HTML表格中的一行
        html += '<tr>';
        html += '<td>' + rows[i].date + '</td>';
        html += '<td>' + rows[i].hours + '</td>';
        html += '<td>' + rows[i].description + '</td>';
        if (!rows[i].archived) {
            //如果工作记录还没有归档，显示归档按钮
            html += '<td>' + exports.workArchiveForm(rows[i].id) + '</td>';
        }
        html += '<td>' + exports.workDeleteForm(rows[i].id) + '</td>';
        html += '</tr>';
    }
    html += '</table>';
    return html;
};
//渲染HTML表单（用来添加、归档、删除工作记录的HTML表单）
exports.workFormHtml = function() {
    //渲染用来输入新工作记录的空白HTML表单
    var html ='<meta charset="utf-8">'+ 
        '<form method="POST" action="/">' +
        '<p>Date (YYYY-MM-DD):<br/><input name="date" type="text"><p/>' +
        '<p>Hours worked:<br/><input name="hours" type="text"><p/>' +
        '<p>Description:<br/>' +
        '<textarea name="description"></textarea></p>' +
        '<input type="submit" value="Add" />' +
        '</form>';
    return html;
};
//渲染成归档表单
exports.workArchiveForm = function(id) {
    return exports.actionForm(id, '/archive', 'Archive');
}
//渲染删除按钮表单
exports.workDeleteForm = function(id) {
    return exports.actionForm(id, '/delete', 'Delete');
}
