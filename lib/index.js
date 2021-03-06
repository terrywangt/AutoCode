const util = require("./util")
const AutoCore = require('./main');
const tplTool = require('./tpl-to-code');
const _ = require('lodash');
var path = require('path');

const ejs = require('ejs');
module.exports.main = function (userconfig, callback, calldata) {
    var config = { ...userconfig };
    var tableInfos = config.tables;
    config = {
        dialect: userconfig.dialect || "mysql",
        port: '3306',
        host: userconfig.host || "127.0.0.1",
        username: userconfig.username || "root",
        pwd: userconfig.pwd || "test",
        storage: userconfig.storage || "database",
        tables: _.map(config.tables, "tableName") || null,//只查询的table名称，未空则查询所有
        //skipTables: userconfig.skipTables || null,//跳过查询table名称
        camelCase: false,
        schema: userconfig.schema,
        templates: userconfig.templates || './',
        codetype: userconfig.codetype || "js",
        camelCase: userconfig.camelCase || false,
        output: userconfig.output || './'
    }
    var tempList = util.getFileList(`${config.templates}/`, 'ejs');
    var auto = new AutoCore(config.storage, config.username, config.pwd, config);

    try {
        auto.run(function (self, callback) {
            if (calldata) calldata(self.tables);
            tempList.forEach(element => {          
                //渲染输出文件
                Object.keys(self.tables).forEach((tablekey) => {
                    //替换表数据中字段类型,默认为js类型（js，C#，java）
                    self.tables[tablekey] = util.Codetype(self.tables[tablekey], config.codetype);
                    var temp = util.loadTemplate(element.path + element.filename);
                    var tableInfo = _.find(tableInfos, (value, index) => value['tableName'] == tablekey);
                    //注入模板的参数变量
                    var obj = {
                        columns: (self.tables[tablekey] || ""),//数据字段行信息
                        foreignKeys: self.foreignKeys,//外键信息
                        tableName: tablekey,//表名称  
                        ...tableInfo || null,//表其他配置                     
                    };
                    var code = ejs.render(temp, {
                        ...obj
                    });
                    //获取模板标头数据
                    var titleData = code.match(/{{%([\s\S]*)%}}/)[1];
                    code = code.replace(titleData, '').replace("{{%%}}\r\n", '').replace("{{%%}}", '');//清除模板标头字符串
                    var filename = titleData.match(/output=["']{1,1}([\s\S]*)["']{1,1};/)[1] || `${tablekey}${element.filename}`;
                    self.writeFile(filename, path.resolve(element.path.replace(config.templates, config.output)), code, () => { console.log(filename + '生成成功') });
                });
            }, callback)
        });
    } catch (error) {
        console.log('error:', error);
        callback('error:' + error);
    }
}