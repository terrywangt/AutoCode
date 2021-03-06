# CodeAuto
通过命令行自动根据自定义模板生成代码文件
## Install
    npm install  
    node index.js
## 依赖
- 代码生成器基于sequelize（ORM）支持MSSQL、MySQL/MariaDB、Postgres、Sqlite
- 目前支持C# Javascript 数据类型自动生成
Example for MySQL/MariaDB

`npm install -g mysql`

Example for Postgres

`npm install -g pg pg-hstore`

Example for Sqlite3

`npm install -g sqlite`

Example for MSSQL

`npm install -g mssql`

## 模板内置变量
        tableName：表名
        columns：当前表的所有列
        columns item:
                name 列名
                type 数据类型
                CodeType 代码内使用的数据类型（根据配置代码类型生成（ c# || java || js ））
                primaryKey (false || true) 是否主键
                allowNull (false || true) 是否可以为NULL
                defaultValue 默认值


## 模板定义
- 模板必须包含在template内，同时在template上定义output属性做为生成输出路径

## 例


    <template output='./model'>
        /* jshint indent: 2 */
            module.exports = app => {
            const sequelize = app.Sequelize;
            const entity = {
                {{#columns.forEach(function(column,index){ }}
                    {{column.name}}: {
                        type: {{column.CodeType}},
                        allowNull: {{column.allowNull}},
                        {{column.primaryKey?"primaryKey:"+column.primaryKey+",":""}}
                        {{column.autoIncrement?"autoIncrement:"+column.autoIncrement:""}}
                    }{{index==(columns.length-1)?'':','}}
                {{# }); }}
            }
            const nav_cat = app.model.define('{{tableName}}', entity, {
                tableName: '{{tableName}}'
            });
            {{tableName}}.getModel=model=>{
                                        if(typeof model!=="object"){
                                            throw new  Error("请求参数错误");
                                            return false;
                                        }
                                        let newobj={};
                                        for (var key in model) {
                                            if (entity.hasOwnProperty(key)) {
                                                newobj[key]=model[key];
                                            }
                                        }
                                    return newobj;
                                    }
            return {{tableName}};
            };
    </template>