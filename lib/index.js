const util = require("./util")
const AutoCore = require('./main');
const tplTool = require('./tpl-to-code');
var path = require('path');
var config = {};
module.exports.run = function (userconfig, callback,calldata) {
    config = {
        "dialect": "mysql",
        port: '3306',
        "host": userconfig.host || "127.0.0.1",
        "username": userconfig.username || "root",
        "pwd": userconfig.pwd || "test",
        "storage": userconfig.storage || "database",
        tables: null,
        skipTables: null,
        camelCase: false,
        schema: userconfig.schema,
        'Templates': userconfig.Templates || './',
        codetype:userconfig.codetype || "js",
        camelCase:userconfig.camelCase||false
    }
    var tpllist = util.getFileList(config.Templates+"/", 'ct')
    tpllist.forEach(function (element) {
        var Tpl = util.loadTemplate(element.path + element.filename);
        try {
            var auto = new AutoCore(config.storage, config.username, config.pwd, config);
            auto.run(function (self, callback) {
                if(calldata){
                    calldata(self.tables);
                }
                Object.keys(self.tables).forEach(function(tablekey){
                    self.tables[tablekey]=util.Codetype(self.tables[tablekey],config.codetype);
                });
                tplTool(Tpl).render(self.tables, function (data) {
                    if (data.output){
                        // if(data.output.substring(0,2)==="./"||data.output.substring(0,3)==="../"){
                        //     data.output="../"+data.output;
                        // }
                        self.write(data.code,path.resolve(data.output),callback);
                    }else
                        callback("not found optput");

                },config.camelCase);
            },callback)
        } catch (err) {
                callback(err);
        }
    });

}