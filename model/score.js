/* jshint indent: 2 */

module.exports = app => {
  const sequelize = app.Sequelize;
  const entity = {
        student_id: {
            type: INTEGER(11),
            allowNull: false,
            primaryKey:true,
        },
        course_id: {
            type: INTEGER(11),
            allowNull: false,
            primaryKey:true,
        },
        grade: {
            type: FLOAT,
            allowNull: true,
        }
  }
  const nav_cat = app.model.define('score', entity, {
    tableName: 'score'
  });
  score.getModel=model=>{
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
  return score;
};