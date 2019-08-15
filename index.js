require("./lib").main({
    dialect:'mysql',
    host:'wxapp.kuaigolf.com',
    username:'sa',
    pwd:'kuaigolf123',
    storage:'kuaigolf_staging',//数据库
    templates:'./files/templates/test',  //模板目录
    output:'./files/output/',  //输出目录    
    codetype:'c#',//js c# java
    tables:[{
        tableName:'tb_bill_loan_info',//数据库表名称
        tableComment:'借款申请',//表备注
        className:'BillLoan',//类名称
    },{
        tableName:'tb_bill_budget_info',//数据库表名称
        tableComment:'预算申请',//表备注
        className:'BillBudget',//类名称
    }],//需要生成的表    
},function(tablesData){//生成完成回调
    //回调输出表数据
    ////console.log('tablesData:',tablesData)
},function(err){//错误回调
   console.log('error:',JSON.stringify(err));
});
