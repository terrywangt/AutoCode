require("./lib").main({
    dialect:'mysql',
    host:'wxapp.kuaigolf.com',
    username:'sa',
    pwd:'kuaigolf123',
    storage:'kuaigolf_staging',//数据库
    templates:'./test/tpl/',  //模板目录
    output:'./test/output/',  //输出目录    
    codetype:'c#',//js c# java
    tables:[{
        tableName:'tb_bill_loan_info',
        tableComment:'借款申请',//表备注
        className:'BillLoan',//类名称
    },{
        tableName:'tb_bill_budget_info'
    }],//需要生成的表    
},function(tablesData){//生成完成回调
    //回调输出表数据
    //console.log(JSON.stringify(arguments[0]))
},function(err){//错误回调
   console.log(JSON.stringify(err));
});
