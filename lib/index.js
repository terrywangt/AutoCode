const util = require("./util")
const AutoCore = require('./main');
const tplTool = require('./tpl-to-code');
var path = require('path');
var config = {};
const ejs = require('ejs');
module.exports.run = function (userconfig, callback, calldata) {
    config = {
        "dialect": "mysql",
        port: '3306',
        "host": userconfig.host || "127.0.0.1",
        "username": userconfig.username || "root",
        "pwd": userconfig.pwd || "test",
        "storage": userconfig.storage || "database",
        tables: userconfig.tables || null,//只查询的table名称，未空则查询所有
        skipTables: userconfig.skipTables || null,//跳过查询table名称
        camelCase: false,
        schema: userconfig.schema,
        'templates': userconfig.templates || './',
        codetype: userconfig.codetype || "js",
        camelCase: userconfig.camelCase || false,
        tablesConfig:userconfig.tablesConfig||{},
        output:userconfig.output||'./'
    }

    var tempList = util.getFileList(`${config.templates}/`, 'ejs');
    tempList.forEach(element => {
        var temp = util.loadTemplate(element.path + element.filename);
        try {
            var auto1 = new AutoCore(config.storage, config.username, config.pwd, config);
            auto1.run(function (self, callback) {
                if (calldata) 
                    calldata(self.tables);     
                console.log(self.tables)
                //替换表数据中字段类型（js，C#，java）      
                Object.keys(self.tables).forEach(function (tablekey) {
                    self.tables[tablekey] = util.Codetype(self.tables[tablekey], config.codetype);
                });
                //渲染输出文件
                Object.keys(self.tables).forEach( (tablekey)=> {
                    var temp = util.loadTemplate(element.path + element.filename);                                   
                    var code = ejs.render(temp, { 
                       columns:(self.tables[tablekey]||""),//数据字段行信息
                       tableName:tablekey,//表名称
                       tableConfig:config.tablesConfig[tablekey]||null//表其他配置
                    });
                    //获取模板标头数据
                    var titleData=code.match(/{{%([\s\S]*)%}}/)[1];
                    code= code.replace(titleData,'').replace("{{%%}}\r\n",'');//清除模板标头字符串
                    var filename=titleData.match(/output=["']{1,1}([\s\S]*)["']{1,1};/)[1]||`${tablekey}${element.filename}`;
                    console.log(filename)
                    self.writeFile(filename, path.resolve(element.path.replace(config.templates,config.output)),code,()=>{console.log(filename+'生成成功')});
                });
            }, callback)
        } catch (error) {
            console.log('error:',error);
            callback('error:'+error);
        }
    });

    // var tpllist = util.getFileList(config.templates + "/", 'ct');
    // tpllist.forEach(function (element) {

    //     var Tpl = util.loadTemplate(element.path + element.filename);

    //     try {

    //         var auto = new AutoCore(config.storage, config.username, config.pwd, config);

    //         auto.run(function (self, callback) {
    //             if (calldata) {
    //                 calldata(self.tables);
    //             }
    //             Object.keys(self.tables).forEach(function (tablekey) {
    //                 self.tables[tablekey] = util.Codetype(self.tables[tablekey], config.codetype);
    //             });
    //             console.log(self.tables)
    //             tplTool(Tpl).render(self.tables, function (data) {
    //                 console.log(data)
    //                 if (data.output) {
    //                     // if(data.output.substring(0,2)==="./"||data.output.substring(0,3)==="../"){
    //                     //     data.output="../"+data.output;
    //                     // }
    //                     self.write(data.code, path.resolve(data.output), callback);
    //                 } else
    //                     callback("not found optput");

    //             }, config.camelCase);
    //         }, callback)
    //     } catch (err) {
    //         console.error(err)
    //         callback(err);
    //     }
    // });

}