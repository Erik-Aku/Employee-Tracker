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
        viewAllDepartments();
      }

      if (data.choices === "View All Roles") {
        viewAllRoles();
      }

      if (data.choices === "View All Employees") {
        viewAllEmployees();
      }

      if (data.choices === "Add a Department") {
        addDepartment();
      }
    });
};

const viewAllDepartments = () => {
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
};

const viewAllRoles = () => {
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
  });
};

const viewAllEmployees = () => {
    let sql = `SELECT employee.id AS 'emp_id', employee.first_name, employee.last_name, role.title, role.salary, department.department_name, 
    employee.manager_id AS 'Manager'    
    FROM department
    INNER JOIN role ON department.id = role.department_id
    INNER JOIN employee ON role.id = employee.role_id
    ORDER BY employee.id ASC`;

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

const addDepartment = () => {
  inquirer
    .prompt([
      {
        name: "addDepartment",
        type: "input",
        message: "Enter the name of the new Department",
      },
    ])
    .then((data) => {
      let sql = `INSERT INTO department (department_name) VALUES (?)`;
      db.query(sql, data.addDepartment, (error, res) => {
        if (error) {
          throw error;
        }
        viewAllDepartments();
      });
    });
};
