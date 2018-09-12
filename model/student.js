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
            allowNull: false,
        },
        idcard: {
            type: STRING(18),
            allowNull: true,
        },
        age: {
            type: INTEGER(11),
            allowNull: true,
        },
        city: {
            type: STRING(50),
            allowNull: true,
        }
  }
  const nav_cat = app.model.define('student', entity, {
    tableName: 'student'
  });
  student.getModel=model=>{
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
  return student;
};