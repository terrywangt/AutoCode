using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;
using System.ComponentModel;
namespace ManageApi.Models.Entitys
{
	/// <summary>
    /// 借款申请
    /// </summary>
	public class tb_bill_loan_info : BaseEntity
	{
        /// <summary>
        /// 主键
        /// </summary>
        [DisplayName("主键")][Key]
        public int idx { get; set; }
     
        /// <summary>
        /// 申请金额
        /// </summary>
        [DisplayName("申请金额")]
        public decimal? money { get; set; }
     
        /// <summary>
        /// 申请人idx
        /// </summary>
        [DisplayName("申请人idx")]
        public int apply_idx { get; set; }
     
        /// <summary>
        /// 申请理由
        /// </summary>
        [DisplayName("申请理由")]
        public string apply_remark { get; set; }
     
        /// <summary>
        /// 借款类型(0差旅费，1招待费，2办公费，3交通费，4通讯费，5其他)
        /// </summary>
        [DisplayName("借款类型(0差旅费，1招待费，2办公费，3交通费，4通讯费，5其他)")]
        public int? loan_type { get; set; }
     
        /// <summary>
        /// 付款方
        /// </summary>
        [DisplayName("付款方")]
        public int? payment_idx { get; set; }
     
        /// <summary>
        /// 收款方
        /// </summary>
        [DisplayName("收款方")]
        public int? collection_idx { get; set; }
     
        /// <summary>
        ///  付款方式(0银行卡，1现金，2汇票，3电汇，4贷记，5支票，6其他)
        /// </summary>
        [DisplayName(" 付款方式(0银行卡，1现金，2汇票，3电汇，4贷记，5支票，6其他)")]
        public int? payment_type { get; set; }
     
        /// <summary>
        /// 借款单状态（-1已取消0待审核1待付款2已付款3.审批驳回）
        /// </summary>
        [DisplayName("借款单状态（-1已取消0待审核1待付款2已付款3.审批驳回）")]
        public int loan_state { get; set; }
     
        /// <summary>
        /// 关联预算单idx
        /// </summary>
        [DisplayName("关联预算单idx")]
        public int bill_budget_idx { get; set; }
     
        /// <summary>
        /// 生成应付款的idx（关联应付款单据）
        /// </summary>
        [DisplayName("生成应付款的idx（关联应付款单据）")]
        public int? bill_payment_idx { get; set; }
     		
	}
}