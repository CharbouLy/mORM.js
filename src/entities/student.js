import Entity from "./entity";

export default class Student extends Entity {
  constructor(dbInstance) {
    super(dbInstance);

    this.tableName = Student.meta().name;
  }

  static meta() {
    return {
      name: "student",
      columns: {
        id: {
          primary: true,
          generated: true
        },
        firstname: {
          type: "string"
        },
        lastname: {
          type: "string"
        },
        age: {
          type: "number",
          optional: true
        }
      }
    };
  }
}
