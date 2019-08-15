using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;
using System.ComponentModel;
namespace ManageApi.Models.Entitys
{
	/// <summary>
    /// 预算申请
    /// </summary>
	public class tb_bill_budget_info : BaseEntity
	{
        /// <summary>
        /// 主键
        /// </summary>
        [DisplayName("主键")][Key]
        public int idx { get; set; }
     
        /// <summary>
        /// 预算类型(0.采购1.差旅2.其他)
        /// </summary>
        [DisplayName("预算类型(0.采购1.差旅2.其他)")]
        public int budget_type { get; set; }
     
        /// <summary>
        /// 申请总金额
        /// </summary>
        [DisplayName("申请总金额")]
        public decimal? money { get; set; }
     
        /// <summary>
        /// 申请人idx
        /// </summary>
        [DisplayName("申请人idx")]
        public int apply_idx { get; set; }
     
        /// <summary>
        /// 申请事由
        /// </summary>
        [DisplayName("申请事由")]
        public string apply_remark { get; set; }
     
        /// <summary>
        /// 已使用金额
        /// </summary>
        [DisplayName("已使用金额")]
        public decimal? use_money { get; set; }
     
        /// <summary>
        /// 余额
        /// </summary>
        [DisplayName("余额")]
        public decimal? balance { get; set; }
     
        /// <summary>
        /// 预算状态（-1已取消0待审批1.使用中2.使用完3.审核驳回）
        /// </summary>
        [DisplayName("预算状态（-1已取消0待审批1.使用中2.使用完3.审核驳回）")]
        public int budget_state { get; set; }
     
        /// <summary>
        /// 申请备注
        /// </summary>
        [DisplayName("申请备注")]
        public string remark { get; set; }
     
        /// <summary>
        /// 财务备注
        /// </summary>
        [DisplayName("财务备注")]
        public string finance_remarks { get; set; }
     		
	}
}