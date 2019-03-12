import Core from "./core";
import { Client } from "pg";
import { isEmpty } from "lodash";

export default class PostgreSQL extends Core {
  async initialize() {
    const {
      host,
      port,
      username,
      password,
      database,
      synchronize,
      entities
    } = this;

    this.client = new Client({
      user: username,
      host,
      database,
      password,
      port
    });

    try {
      await this.client.connect();

      const arEntities = Object.values(entities);

      for (const entity of arEntities) {
        const { name: tableName, columns } = entity.meta();

        let query = `CREATE TABLE IF NOT EXISTS ${tableName} (`;

        for (const [key, item] of Object.entries(columns)) {
          let type;
          switch (item.type) {
            case "string":
              type = "varchar(255)";
              break;
            case "number":
              type = "integer";
              break;

            default:
              type = "";
          }

          query += `${key} ${type}`;

          if (item.primary) {
            if (item.generated) {
              query += ` SERIAL`;
            }
            query += ` PRIMARY KEY`;
          } else {
            query += ` ${item.optional === true ? "NULL" : "NOT NULL"}`;
          }

          query += ", ";
        }

        query = query.slice(0, -2) + ")";

        this.client.query(query, (err, res) => {
          if (err) {
            throw new Error(err.stack);
          } else {
            console.log(`Table ${tableName} has been created`);
          }
        });
      }

      // Synchronizing --> remove existing datas
      if (synchronize) {
        for (const entity of arEntities) {
          const { name: tableName } = entity.meta();
          this.client.query(`DELETE FROM ${tableName}`, (err, res) => {
            if (err) {
              throw new Error(err.stack);
            } else {
              console.log(`Table ${tableName} has been erased`);
            }
          });
        }
      }
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async save(tableName, data) {
    return new Promise((resolve, reject) => {
      const columns = Object.keys(data).join(', ')
      const formatedValues = Object.values(data).map(value => {return `${value}`})
      const values = Object.values(formatedValues).join("','");
      
      this.client.query(`INSERT INTO ${tableName} (${columns}) VALUES ('${values}');`, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  async count(tableName) {
    return new Promise((resolve, reject) => {
      this.client.query(`SELECT COUNT(*) FROM ${tableName}`, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result.rows[0].count);
        }
      });
    });
  }

  async findAll(tableName, { attributes }) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT ${isEmpty(attributes) ? "*" : attributes.join(",")}
        FROM ${tableName}
      `;

      this.client.query(query, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result.rows);
        }
      });
    });
  }

  async findOne(tableName, {where, attributes}) {
    return new Promise((resolve, reject) => {
      let find = []
      for (const keys in where){
        find.push(`${keys}='${where[keys]}'`);
      }
      const formatedWhere = find.join(' AND ');

      let query = `
        SELECT ${isEmpty(attributes) ? "*" : attributes.join(",")}
        FROM ${tableName}
        WHERE ${formatedWhere}
        ;
      `;

      this.client.query(query, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result.rows);
        }
      });
    });
  }
}
