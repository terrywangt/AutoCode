require("./lib").run({
    host:'',
    username:'',
    pwd:'',
    storage:'',
    templates:'./test/tpl/',  //模板目录
    output:'./test/output/',  //输出目录    
    tables:['tb_bill_payment_info'],
    tablesConfig:{
        'tb_bill_payment_info':{'comment':'测试表'}
    }
},function(tablesData){
    //输出表数据
    //console.log(JSON.stringify(arguments[0]))
},function(err){
   console.log(JSON.stringify(err))
});
