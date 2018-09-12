
require("./lib").run({
    host:'127.0.0.1',
    username:'root',
    pwd:'wangtian',
    storage:'test',
    Templates:'./test/tpl/',
    schema
},function(){
    console.log(JSON.stringify(arguments))
},function(){
    console.log(JSON.stringify(arguments))});
