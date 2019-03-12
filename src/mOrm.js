import { isEmpty } from "lodash";
import fs from "fs";
import PostgreSQL from "./engine/postgresql";

export default class mOrm {
  configPathName = "./mOrm.config.js";

  async createConnection(dbConfig = {}, extras = { entities: [] }) {
    if (isEmpty(dbConfig)) {
      if (!fs.existsSync(this.configPathName)) {
        throw new Error("Config required");
      }

      this.config = require(this.configPathName);
    } else if (dbConfig.uri) {
      const regExp = /(.*):\/\/(.*):(.*)@(.*):(.*)\/(.*)/gm;
      const [, type, username, password, host, port, database] = regExp.exec(
        dbConfig.uri
      );

      let newConfig = {
        type,
        username,
        password,
        host,
        port,
        database
      };

      this.config = newConfig;
    } else {
      this.config = dbConfig;
    }

    this.config.synchronize =
      dbConfig.synchronize !== undefined ? dbConfig.synchronize : false;

    this.entities = {};
    for (const entities of extras.entities) {
      this.entities[entities.prototype.constructor.name] = entities;
    }

    switch (this.config.type) {
      case "postgres":
        this.dbInstance = new PostgreSQL(this.config, this.entities);
        break;

      case "mysql":
        break;

      case "sqlite":
        break;

      default:
    }

    await this.dbInstance.initialize();
    console.log(`Connected to ${this.config.database}`);
  }

  getEntity(name) {
    return new this.entities[name](this.dbInstance);
  }
}
