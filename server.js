const inquirer = require("inquirer");
const db = require("./env");
const mysql = require("mysql2");
const viewDepartment = require("./db/queries");
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
        db.query(viewDepartment, (error, res) => {
          if (error) {
            throw error;
          }
          console.log("\n");
          console.log(asTable(res));
          console.log("\n");
          mainMenu();
        });
      }
    });
};
