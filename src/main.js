import mOrm from "./mOrm";
import Student from "./entities/student";

(async () => {
  const orm = new mOrm();

  try {
    await orm.createConnection(
      {
        type: "postgres",
        host: "localhost",
        port: 5432,
        username: "postgres",
        password: "root",
        database: "pragmazoo",
        synchronize: false
      },
      {
        entities: [Student]
      }
    );

    orm.dbInstance.dump();

    let student = {
      firstname: 'zizou',
      lastname: 'tabarnak',
      age: 20
    }
    const studentEntity = orm.getEntity("Student");
    const addStudent = await studentEntity.save(student);
    const count = await studentEntity.count();
    const findOneStudent = await studentEntity.findOne({where: {firstname: "zizou", lastname: "tabarnak"}, attributes: []});
    const students = await studentEntity.findAll();
    // console.log(`There are ${count} student(s)`);
    // console.log(findOneStudent);
    // console.log("Current students:\n%o", students);

  } catch (err) {
    console.log(err);
    process.exit(-1);
  }
})();
