"use strict";

var config = {
    open: '{{',
    close: '}}'
};

var tool = {
    exp: function (str, x) {
        return new RegExp(str, x || 'g');
    },
    //匹配满足规则内容
    query: function (type, _, __, x) {
        var types = [
            '#([\\s\\S])+?', //js语句
            '([^{#}])*?' //普通字段
        ][type || 0];
        return exp((_ || '') + config.open + types + config.close + (__ || ''), x);
    },
    escape: function (html) {
        return String(html || '').replace(/&(?!#?[a-zA-Z0-9]+;)/g, '&amp;')
            .replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#39;').replace(/"|'/g, '&quot;');
    },
    error: function (e, tplog) {
        var error = 'Laytpl Error：';
        typeof console === 'object' && console.error(error + e + '\n' + (tplog || ''));
        return error + e;
    }
};

var exp = tool.exp,
    Tpl = function (tpl) {
        tpl = /<template[\s\S]*?output=['|"|'']([\s\S]*?)['|"|''][\s\S]*?>([\r][\n]|)([\s\S]*?)([\r][\n]|)<\/template>/gi.exec(tpl);
        this.tpl = tpl[3];
        this.output = tpl[1].replace(/[\s]['|"|output|=|''|\/]/, "");
    };

Tpl.pt = Tpl.prototype;

//编译模版
Tpl.pt.parse = function (tpl, tableName, columns,camelCase,primaryKey) {
    var that = this,
        tplog = tpl;
    var jss = exp('^' + config.open + '#', ''),
        jsse = exp(config.close + '$', '');

    //tpl = tpl.replace(/\s+|\r|\t|\n/g, ' ').replace(exp(config.open + '#'), config.open + '# ')
    tpl = tpl.replace(/\r|\t|\n/g, function (t) {
        if (/\n/g.test(t)) {
            return "._n";
        }
        if (/\r/g.test(t)) {
            return "._r";
        }
        return t;
    });
    var isrow = true;
    while (isrow) {
        var test = true;
        tpl = tpl.replace(tool.query(1, "(._r._n)[\\s|]*?", "*?[\\s|]*?(._r._n)", 'i'), function (str) {
            test = false;
            str = str.replace(tool.query(1), function (jsval) {
                return "{{(" + jsval.substring(2, jsval.length - 2) + ")==''?'_tpl_No_val':(" + jsval.substring(2, jsval.length - 2) + ")}}";
            });
            return "._r_.d_._n" + str.substring(6);
        })
        if (test) isrow = false;
    }
    tpl = tpl.replace(exp(config.open + '#'), config.open + '# ')
        .replace(exp(config.close + '}'), '} ' + config.close).replace(/\\/g, '\\\\')
        .replace(/(?="|')/g, '\\').replace(tool.query(0, "(._r._n|._r|._n|)[\\s|]*?"), function (str) {
            str = str.replace(exp("._r"), '').replace(exp("._n"), '');
            str = str.trim();
            str = str.replace(jss, '').replace(jsse, '');
            return '";' + str.replace(/\\/g, '') + ';view+="';
        })
        .replace(tool.query(1), function (str) {
            var start = '"+(';
            if (str.replace(/\s/g, '') === config.open + config.close) {
                return '';
            }
            str = str.replace(exp(config.open + '|' + config.close), '');
            if (/^=/.test(str)) {
                str = str.replace(/^=/, '');
                start = '"+_escape_(';
            }
            return start + str.replace(/\\/g, '') + ')+"';
        });

    tpl = '"use strict";var M_tableName=camelCase(tableName,1);var view = "' + tpl + '";return view;';

    try {
        that.cache = tpl = new Function('tableName,columns,_escape_,camelCase,primaryKey', tpl);
        return tpl(tableName, columns, tool.escape,camelCase,primaryKey);
    } catch (e) {
        delete that.cache;
        return tool.error(e, tplog);
    }
};

Tpl.pt.render = function (data, callback,camelCase) {
    var that = this,
        tpl = {};
    let columns = [];

    function camelCase(str,type=0) {
        var re = /_(\w)/g;
        if(type){
            str=str.replace(/^\S/,function(s){return s.toUpperCase();});
        }
        str = str.replace(re, function ($0, $1) {
            return $1.toUpperCase();
        });
        return str;
    };
    if (!data) return tool.error('no data');
    Object.keys(data).forEach(function (key) {
        var primaryKey={}
        Object.keys(data[key]).forEach(function (colkey) {
            data[key][colkey].name = colkey;
            if(data[key][colkey].primaryKey&&!data[key][colkey].foreignKey){
                primaryKey=data[key][colkey];
            }
            columns.push(data[key][colkey]);
        });
        let filename=key;
        if(camelCase){
            filename=camelCase(key);
        }
        tpl[filename] = that.cache ? that.cache(key, columns, tool.escape,camelCase,primaryKey) : that.parse(that.tpl, key, columns,camelCase,primaryKey);
        tpl[filename] = tpl[filename].replace(/_.d_/g, '').replace(/._r._n[\s|]+_tpl_No_val/g, "")
            .replace(/\._t/g, "").replace(/\._n/g, "\n").replace(/\._r/g, "\r");
        columns = [];
    })
    if (!callback) return {
        output: this.output,
        code: tpl
    };
    callback({
        output: this.output,
        code: tpl
    });
};

var to_tpl = function (tpl) {
    if (typeof tpl !== 'string') return tool.error('Template not found');
    return new Tpl(tpl);
};

to_tpl.config = function (options) {
    options = options || {};
    for (var i in options) {
        config[i] = options[i];
    }
};
module.exports = to_tpl;