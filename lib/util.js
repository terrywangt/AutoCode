var fs = require('fs');
var _path = require('path');
var _ = require('lodash');
var getdatatype = (codetype, type,column) => {
  //columns: {"type":"INT(11)",//字段数据库类型
  //"allowNull":true,//是否允许为空
  //"defaultValue":null,//默认值
  //"primaryKey":false,//是否主键
  //"autoIncrement":false,//是否自增
  //"comment":"xx"}//字段备注
  var val = '';
  switch (codetype) {
    case "js":
      if (type.indexOf('ENUM') === 0) {
        val = '' + type;
      }
      if (type === "boolean" || type === "bit(1)" || type === "bit") {
        val = 'BOOLEAN';
      } else if (type.match(/^(smallint|mediumint|tinyint|int)/i)) {
        var length = type.match(/\(\d+\)/i);
        val = 'INTEGER' + (!_.isNull(length) ? length : '');
        var unsigned = type.match(/unsigned/i);
        if (unsigned) val += '.UNSIGNED'
        var zero = type.match(/zerofill/i);
        if (zero) val += '.ZEROFILL'
      } else if (type.match(/^bigint/i)) {
        val = 'BIGINT';
      } else if (type.match(/^varchar/i)) {
        var length = type.match(/\(\d+\)/i);
        val = 'STRING' + (!_.isNull(length) ? length : '');
      } else if (type.match(/^string|varying|nvarchar/i)) {
        val = 'STRING';
      } else if (type.match(/^char/i)) {
        var length = type.match(/\(\d+\)/i);
        val = 'CHAR' + (!_.isNull(length) ? length : '');
      } else if (type.match(/^real/i)) {
        val = 'REAL';
      } else if (type.match(/text|ntext$/i)) {
        val = 'TEXT';
      } else if (type.match(/^(date)/i)) {
        val = 'DATE';
      } else if (type.match(/^(time)/i)) {
        val = 'TIME';
      } else if (type.match(/^(float|float4)/i)) {
        val = 'FLOAT';
      } else if (type.match(/^decimal/i)) {
        val = 'DECIMAL';
      } else if (type.match(/^(float8|double precision|numeric)/i)) {
        val = 'DOUBLE';
      } else if (type.match(/^uuid|uniqueidentifier/i)) {
        val = 'UUIDV4';
      } else if (type.match(/^json/i)) {
        val = 'JSON';
      } else if (type.match(/^jsonb/i)) {
        val = 'JSONB';
      } else if (type.match(/^geometry/i)) {
        val = 'GEOMETRY';
      }
      break;
    case "java":
    case "c#":
      if (type.indexOf('ENUM') === 0) {
        val = "string";
      }
      if (type === "boolean" || type === "bit(1)" || type === "bit") {
        val = type;
      } else if (type.match(/^(smallint|mediumint|tinyint|int)/i)) {
        var length = type.match(/\(\d+\)/i);
        val = 'int'+(column.allowNull?'?':'');
      } else if (type.match(/^bigint/i)) {
        val = 'Int64'+(column.allowNull?'?':'');
      } else if (type.match(/^varchar/i)) {
        val = "string"
      } else if (type.match(/^string|varying|nvarchar/i)) {
        val = 'string';
      } else if (type.match(/^char/i)) {
        val = "char"+(column.allowNull?'?':'')
      } else if (type.match(/^real/i)) {
        val = 'double'+(column.allowNull?'?':'');
      } else if (type.match(/text|ntext$/i)) {
        val = 'string';
      } else if (type.match(/^(date)/i)) {
        val = 'DateTime'+(column.allowNull?'?':'');
      } else if (type.match(/^(time)/i)) {
        val = 'DateTime'+(column.allowNull?'?':'');
      } else if (type.match(/^(float|float4)/i)) {
        val = 'float'+(column.allowNull?'?':'');
      } else if (type.match(/^decimal/i)) {
        val = 'decimal'+(column.allowNull?'?':'');
      } else if (type.match(/^(float8|double precision|numeric)/i)) {
        val = 'decimal'+(column.allowNull?'?':'');
      } else if (type.match(/^uuid|uniqueidentifier/i)) {
        val = 'string';
      } else if (type.match(/^json/i)) {
        val = 'string';
      } else if (type.match(/^jsonb/i)) {
        val = 'string';
      } else if (type.match(/^geometry/i)) {
        val = 'string';
      }
      break;
  }
    if(!val){
      console.log(type);
    }
    return val;
}
module.exports.Codetype = (table,codetype) => {
  Object.keys(table).forEach(function (element) {
    table[element].codeType = getdatatype(codetype,table[element].type,table[element],table[element]);
  }, this);
  return table;
}
const readFileList = (path, filesList,filetype) => {
  
  var files = fs.readdirSync(path);
  files.forEach(function (itm, index) {
    var stat = fs.statSync(path + itm);
    if (stat.isDirectory()) {
      //递归读取文件
      readFileList(path + itm + "/", filesList,filetype)
    } else {
      if(_path.extname(itm)===(filetype?'.'+filetype:_path.extname(itm))){
          var obj = {}; //定义一个对象存放文件的路径和名字
          obj.path = path; //路径
          obj.filename = itm //名字
          filesList.push(obj);
      }
    }
  })
  return filesList
}
module.exports.getFileList = (path,filetype) => {
  var filesList = [];
  return readFileList(path, filesList,filetype);
}
module.exports.loadTemplate = (path) => {
  return fs.readFileSync(path,"utf-8");
}