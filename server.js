const inquirer = require("inquirer");
const db = require("./env");
const mysql = require("mysql2");
const asTable = require("as-table").configure({ delimiter: " | ", dash: "-" });

db.connect((error) => {
  if (error) throw error;
  mainMenu();
});


const mainMenu = () => {
  inquirer
    .prompt([
      {
        name: "choices",
        type: "list",
        message: "What would you like to do?",
        choices: [
          "View All Departments",
          "View All Roles",
          "View All Employees",
          "Add a Department",
          "Add a Role",
          "Add an Employee",
          "Update an Employee Role",
          "Quit",
        ],
      },
    ])
    .then((data) => {
      if (data.choices === "View All Departments") {
        let sql = `SELECT department.id AS id, department.department_name AS department FROM department`;
        db.query(sql, (error, res) => {
          if (error) {
            throw error;
          }
          console.log("\n");
          console.log(asTable(res));
          console.log("\n");
          mainMenu();
        });
      }

      if (data.choices === "View All Roles") {
        let sql = `SELECT role.id, role.title, department.department_name AS department, role.salary
        FROM role
        INNER JOIN department ON role.department_id = department.id`;
        db.query(sql, (error, res) => {
            if (error) {
                throw error;
            }
            console.log("\n");
            console.log(asTable(res));
            console.log("\n");
            mainMenu();
        })
      }
    });
};
