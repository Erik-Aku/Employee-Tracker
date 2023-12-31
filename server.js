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
      if (data.choices === "Add a Role") {
        addRole();
      }
      if (data.choices === "Add an Employee") {
        addEmployee();
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
};

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
      db.query(sql, data.addDepartment, (error) => {
        if (error) {
          throw error;
        }
        console.log("The Department has been added!");
        viewAllDepartments();
      });
    });
};

const addRole = () => {
  let sql = `SELECT * from department`;

  db.query(sql, (error, response) => {
    if (error) {
      throw error;
    }

    let existingDeptNames = [];

    response.forEach((department) => {
      existingDeptNames.push(department.department_name);
    });

    inquirer
      .prompt([
        {
          name: "departmentChoice",
          type: "list",
          message: "Select a department for this new role.",
          choices: existingDeptNames,
        },

        {
          name: "newRole",
          type: "input",
          message: "What is the name of the new role?",
        },

        {
          name: "salary",
          type: "input",
          message: "What is the salary?",
        },
      ])
      .then((data) => {
        let deptId;

        response.forEach((department) => {
          if (data.departmentChoice === department.department_name) {
            deptId = department.id;
          }
        });

        let sql = `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`;
        let params = [data.newRole, data.salary, deptId];

        db.query(sql, params, (error) => {
          if (error) {
            throw error;
          }
          console.log("The Role has been added!");
          viewAllRoles();
        });
      });
  });
};

const addEmployee = () => {
  let sql = `SELECT * from role`;
  db.query(sql, (error, response) => {
    if (error) {
      throw error;
    }

    let existingRoles = [];

    response.forEach((role) => {
      existingRoles.push(role.title);
    });
    inquirer
      .prompt([
        {
          name: "firstName",
          type: "input",
          message: "What is the employees first name?",
        },

        {
          name: "lastName",
          type: "input",
          message: "what is the employees last name?",
        },

        {
          name: "roleChoice",
          type: "list",
          message: "What is the employee's role?",
          choices: existingRoles,
        },
      ])
      .then((data) => {
        let roleId;
        let params = [data.firstName, data.lastName];

        response.forEach((role) => {
          if (data.roleChoice === role.title) {
            roleId = role.id;
            params.push(roleId);
          }
        });

        let managerSql = `SELECT * FROM employee`;
        db.query(managerSql, (error, response) => {
          if (error) {
            throw error;
          }

          const existingManagers = response.map(
            ({ id, first_name, last_name }) => ({
              name: first_name + " " + last_name,
              value: id,
            })
          );

          inquirer
            .prompt([
              {
                name: "managerChoice",
                type: "list",
                message: "Who is the employee's manager?",
                choices: existingManagers,
              },
            ])
            .then((managerData) => {
              const manager = managerData.managerChoice;
              params.push(manager);

              let sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
            VALUES (?, ?, ?, ?)`;
              db.query(sql, params, (error) => {
                if (error) {
                  throw error;
                }
                console.log("Employee has been added!");
                viewAllEmployees();
              });
            });
        });
      });
  });
};
