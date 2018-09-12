/* jshint indent: 2 */

module.exports = app => {
  const sequelize = app.Sequelize;
  const entity = {
        id: {
            type: INTEGER(11),
            allowNull: false,
            primaryKey:true,
        },
        name: {
            type: STRING(50),
            allowNull: true,
        }
  }
  const nav_cat = app.model.define('course', entity, {
    tableName: 'course'
  });
  course.getModel=model=>{
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
  return course;
};