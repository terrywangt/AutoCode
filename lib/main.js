var Sequelize = require('sequelize');
var async = require('async');
var fs = require('graceful-fs-extra');
var path = require('path');
var mkdirp = require('mkdirp');
var dialects = require('./dialects');
var _ = Sequelize.Utils._;
var SqlString = require('./sql-string');

function AutoCore(database, username, password, options) {
    if (options && options.dialect === 'sqlite' && !options.storage)
        options.storage = database;

    if (database instanceof Sequelize) {
        this.sequelize = database;
    } else {
        this.sequelize = new Sequelize(database, username, password, options || {});
    }

    this.queryInterface = this.sequelize.getQueryInterface();
    this.tables = {};
    this.foreignKeys = {};
    this.dialect = dialects[this.sequelize.options.dialect];

    this.options = _.extend({
        global: 'Sequelize',
        local: 'sequelize',
        spaces: false,
        indentation: 1,
        directory: './models',
        additional: {},
        freezeTableName: true
    }, options || {});
}

AutoCore.prototype.build = function(callback) {
    var self = this;

    function mapTable(table, _callback) {
        self.queryInterface.describeTable(table, self.options.schema).then(function(fields) {
            self.tables[table] = fields
            _callback();
        }, _callback);
    }

    if (self.options.dialect === 'postgres' && self.options.schema) {
        var showTablesSql = this.dialect.showTablesQuery(self.options.schema);
        self.sequelize.query(showTablesSql, {
            raw: true,
            type: self.sequelize.QueryTypes.SHOWTABLES
        }).then(function(tableNames) {
            processTables(_.flatten(tableNames))
        }, callback);
    } else {
        this.queryInterface.showAllTables().then(processTables, callback);
    }

    function processTables(__tables) {
        if (self.sequelize.options.dialect === 'mssql')
            __tables = _.map(__tables, 'tableName');

        var tables;

        if (self.options.tables) tables = _.intersection(__tables, self.options.tables)
        else if (self.options.skipTables) tables = _.difference(__tables, self.options.skipTables)
        else tables = __tables

        async.each(tables, mapForeignKeys, mapTables);

        function mapTables(err) {
            if (err) console.error(err)

            async.each(tables, mapTable, callback);
        }
    }

    function mapForeignKeys(table, fn) {
        if (!self.dialect) return fn()

        var sql = self.dialect.getForeignKeysQuery(table, self.sequelize.config.database)

        self.sequelize.query(sql, {
            type: self.sequelize.QueryTypes.SELECT,
            raw: true
        }).then(function(res) {
            _.each(res, assignColumnDetails)
            fn()
        }, fn);

        function assignColumnDetails(ref) {
            // map sqlite's PRAGMA results
            ref = _.mapKeys(ref, function(value, key) {
                switch (key) {
                    case 'from':
                        return 'source_column';
                    case 'to':
                        return 'target_column';
                    case 'table':
                        return 'target_table';
                    default:
                        return key;
                }
            });

            ref = _.assign({
                source_table: table,
                source_schema: self.sequelize.options.database,
                target_schema: self.sequelize.options.database
            }, ref);

            if (!_.isEmpty(_.trim(ref.source_column)) && !_.isEmpty(_.trim(ref.target_column))) {
                ref.isForeignKey = true
                ref.foreignSources = _.pick(ref, ['source_table', 'source_schema', 'target_schema', 'target_table', 'source_column', 'target_column'])
            }

            if (_.isFunction(self.dialect.isUnique) && self.dialect.isUnique(ref))
                ref.isUnique = true

            if (_.isFunction(self.dialect.isPrimaryKey) && self.dialect.isPrimaryKey(ref))
                ref.isPrimaryKey = true

            if (_.isFunction(self.dialect.isSerialKey) && self.dialect.isSerialKey(ref))
                ref.isSerialKey = true

            self.foreignKeys[table] = self.foreignKeys[table] || {};
            self.foreignKeys[table][ref.source_column] = _.assign({}, self.foreignKeys[table][ref.source_column], ref);
        }
    }
}
AutoCore.prototype.test = function(success, callback) {
    var self = this;
    self.sequelize.query("select 1", {
        raw: true,
        type: self.sequelize.QueryTypes.SHOWTABLES
    }).then(success, callback);
}
AutoCore.prototype.run = function(success, callback) {
    var self = this;
    var text = {};
    var tables = [];

    this.build(generateText);

    function generateText(err) {
        if (err) {
            console.error(err);
            callback(err)
        } else {
            async.each(_.keys(self.tables), function(table, _callback) {
                var fields = _.keys(self.tables[table]);
                _.each(fields, function(field, i) {
                    var additional = self.options.additional
                    if (additional && additional.timestamps !== undefined && additional.timestamps) {
                        if ((additional.createdAt && field === 'createdAt' || additional.createdAt === field) ||
                            (additional.updatedAt && field === 'updatedAt' || additional.updatedAt === field) ||
                            (additional.deletedAt && field === 'deletedAt' || additional.deletedAt === field)) {
                            return true;
                        }
                    }
                    // Find foreign key
                    var foreignKey = self.foreignKeys[table] && self.foreignKeys[table][field] ? self.foreignKeys[table][field] : null

                    if (_.isObject(foreignKey)) {
                        self.tables[table][field].foreignKey = foreignKey
                    }

                    // column's attributes
                    var fieldAttr = _.keys(self.tables[table][field]);

                    // Serial key for postgres...
                    var defaultVal = self.tables[table][field].defaultValue;

                    // ENUMs for postgres...
                    if (self.tables[table][field].type === "USER-DEFINED" && !!self.tables[table][field].special) {
                        self.tables[table][field].type = "ENUM(" + self.tables[table][field].special.map(function(f) {
                            return f;
                        }).join(',') + ")";
                    }
                    var isUnique = self.tables[table][field].foreignKey && self.tables[table][field].foreignKey.isUnique;
                    _.each(fieldAttr, function(attr, x) {
                        var isSerialKey = self.tables[table][field].foreignKey && _.isFunction(self.dialect.isSerialKey) && self.dialect.isSerialKey(self.tables[table][field].foreignKey)

                        // We don't need the special attribute from postgresql describe table..
                        if (attr === "special") {
                            return true;
                        }

                        if (attr === "foreignKey") {
                            if (isSerialKey) {
                                self.tables[table][field].autoIncrement = true;
                                if (!self.tables[table][field].foreignKey.foreignSources)
                                    self.tables[table][field].foreignKey = null;
                            } else return true;
                        } else if (attr === "primaryKey") {
                            if (self.tables[table][field][attr] === true && (!_.has(self.tables[table][field], 'foreignKey') || (_.has(self.tables[table][field], 'foreignKey') && !!self.tables[table][field].foreignKey.isPrimaryKey)))
                                self.tables[table][field][attr] = true;
                            else self.tables[table][field][attr] = false;
                            return true;
                        } else if (attr === "defaultValue") {
                            if (self.sequelize.options.dialect === "mssql" && defaultVal && defaultVal.toLowerCase() === '(newid())') {
                                defaultVal = null; // disable adding "default value" attribute for UUID fields if generating for MS SQL
                            }

                            var val_text = defaultVal;

                            if (isSerialKey) return true;

                            //mySql Bit fix
                            if (self.tables[table][field].type.toLowerCase() === 'bit(1)') {
                                val_text = defaultVal === "b'1'" ? 1 : 0;
                            }
                            // mssql bit fix
                            else if (self.sequelize.options.dialect === "mssql" && self.tables[table][field].type.toLowerCase() === "bit") {
                                val_text = defaultVal === "((1))" ? 1 : 0;
                            }

                            if (_.isString(defaultVal)) {
                                var field_type = self.tables[table][field].type.toLowerCase();
                                if (field_type.indexOf('date') === 0 || field_type.indexOf('timestamp') === 0) {
                                    if (_.endsWith(defaultVal, '()')) {
                                        val_text = "sequelize.fn('" + defaultVal.replace(/\(\)$/, '') + "')"
                                    } else if (_.includes(['current_timestamp', 'current_date', 'current_time', 'localtime', 'localtimestamp'], defaultVal.toLowerCase())) {
                                        val_text = "sequelize.literal('" + defaultVal + "')"
                                    } else {
                                        val_text = val_text
                                    }
                                } else {
                                    val_text = val_text
                                }
                            }

                            if (defaultVal === null || defaultVal === undefined) {
                                return true;
                            } else {
                                val_text = _.isString(val_text) && !val_text.match(/^sequelize\.[^(]+\(.*\)$/) ? SqlString.escape(_.trim(val_text, '"'), null, self.options.dialect) : val_text;

                                // don't prepend N for MSSQL when building models...
                                val_text = _.trimStart(val_text, 'N');
                                self.tables[table][field][attr] = val_text;
                            }
                        }
                    });
                    if (isUnique) {
                        self.tables[table][field].unique = true
                    }
                });
            });
            success(self, callback);
            // if (self.options.directory) {
            //   return self.write(text, callback);
            // } else {
            //   return self.write(false, callback);
            // }
            //return callback(false, text);
        }
    }
}

AutoCore.prototype.write = function(attributes, directory, callback) {
    var tables = _.keys(attributes);
    var self = this;
    mkdirp.sync(path.resolve(directory));
    async.each(tables, createFile, callback);

    function createFile(table, _callback) {
        fs.writeFile(path.resolve(path.join(directory, table + '.js')), attributes[table], _callback);
    }
}

module.exports = AutoCore;