const mysql = require('mysql');
const inquirer = require('inquirer');
const table = require('console.table');

const connection = mysql.createConnection({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: 'root',
    database: 'employees_db'
});

connection.connect(err => {
    if(err) console.log(err);
    mainMenu();
});


//Menus
function mainMenu() {
    inquirer
    .prompt({
        type: 'list',
        name: 'choice',
        message: 'What would you like to view?',
        choices: [
            'Departments',
            'Roles',
            'Employees',
            'Exit'
        ]
    })
    .then(({ choice }) => {
        switch(choice) {
            case 'Departments':
                departmentMenu();
                break;
            case 'Roles':
                roleMenu();
                break;
            case 'Employees':
                EmployeeMenu();
                break;
            case 'Exit':
                connection.end();
                break;
        }
    })
}

function departmentMenu() {
    inquirer
    .prompt({
        type: 'list',
        name: 'choice',
        message: 'What would you like to do?',
        choices: [
            'Add Department',
            'View Departments',
            'Back'
        ]
    })
    .then(({ choice }) => {
        switch(choice) {
            case 'Add Department':
                addDepartment();
                break;
            case 'View Departments':
                viewDepartments();
                break;
            case 'Back':
                mainMenu();
                break;
        }
    })
}

function roleMenu() {
    inquirer
    .prompt({
        type: 'list',
        name: 'choice',
        message: 'What would you like to do?',
        choices: [
            'Add Role',
            'View Roles',
            'Back'
        ]
    })
    .then(({ choice }) => {
        switch(choice) {
            case 'Add Role':
                addRole();
                break;
            case 'View Roles':
                viewRoles();
                break;
            case 'Back':
                mainMenu();
                break;
        }
    })
}

function EmployeeMenu() {
    inquirer
    .prompt({
        type: 'list',
        name: 'choice',
        message: 'What would you like to do?',
        choices: [
            'Add Employee',
            'View Employees',
            'Update Employee Roles',
            'Back'
        ]
    })
    .then(({ choice }) => {
        switch(choice) {
            case 'Add Employee':
                addEmployee();
                break;
            case 'View Employees':
                viewEmployees();
                break;
            case 'Update Employee Roles':
                updateEmployeeRoles();
                break;
            case 'Back':
                mainMenu();
                break;
        }
    })
}

//Department Functions
function addDepartment() {
    inquirer
    .prompt({
        type: 'input',
        name: 'name',
        message: 'Enter new department name.'
    })
    .then(({name}) => {
        connection.query('INSERT INTO department SET ?', {name: name});
        viewDepartments();
    });
}

function viewDepartments() {
    connection.query('SELECT * FROM department', (err, res) => {
        if(err) console.log(err);
        console.table(res);
        mainMenu();
    })
}

//Role Functions
function addRole() {
    let departments;
    connection.query('SELECT * FROM department', (err, res) => {
        if(err) console.log(err);
        departments = res.map((i) => i.name);

        inquirer
        .prompt([
        {
            type: 'input',
            name: 'title',
            message: 'Enter new role title.'
        },
        {
            type: 'input',
            name: 'salary',
            message: 'Enter the roles salary.'
        },
        {
            type: 'list',
            name: 'id',
            message: 'Select department for the role',
            choices: departments
        }
        ])
        .then(({title, salary, id}) => {
            connection.query(`SELECT id FROM department where name='${id}'`, (err, res) => {
                if(err) console.log(err);

                connection.query(`INSERT INTO role (title, salary, department_id)
                    VALUES('${title}','${salary}',${res[0].id})`, 
                );
                viewRoles();
            });
            
        });
    })
}

function viewRoles() {
    connection.query('SELECT * FROM role', (err, res) => {
        if(err) console.log(err);
        console.table(res);
        mainMenu();
    })
}

//Employee Functions
function addEmployee() {
    let roles;
    connection.query('SELECT * FROM role', (err, res) => {
        if(err) console.log(err);
        roles = res.map((i) => i.title);
        
        inquirer
        .prompt([
        {
            type: 'input',
            name: 'firstName',
            message: "Enter the employee's first name."
        },
        {
            type: 'input',
            name: 'lastName',
            message: "Enter the employee's last name."
        },
        {
            type: 'list',
            name: 'id',
            message: 'Select department for the role',
            choices: roles
        }
        ])
        .then(({firstName, lastName, id}) => {
            console.log(id);
            connection.query(`SELECT id FROM role where title='${id}'`, (err, res) => {
                if(err) console.log(err);
                console.log(res);
                connection.query(`INSERT INTO employee (first_name, last_name, role_id)
                    VALUES('${firstName}','${lastName}',${res[0].id})`, 
                );
                viewEmployees();
            });
        });
    });
}

function viewEmployees() {
    connection.query('SELECT * FROM employee', (err, res) => {
        if(err) console.log(err);
        console.table(res);
        mainMenu();
    })
}

function updateEmployeeRoles() {
    let employees;
    connection.query('SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee', (err, res) => {
        if(err) console.log(err);

        employees = res.map((i) => i.name);
        
    inquirer
    .prompt({
        type: 'list',
        name: 'employee',
        message: 'Select an employee to update.',
        choices: employees
    })
    .then(({ employee }) => {
        let roles;
        connection.query('SELECT * FROM role', (err, res) => {
            if(err) console.log(err);
    
            roles = res.map((i) => i.title);
            inquirer
        .prompt({
            type: 'list',
            name: 'newRole',
            message: 'Select a new role for the employee.',
            choices: roles
        })
        .then(({ newRole }) => {
            connection.query(`SELECT id FROM role where title='${newRole}'`, (err, res) => {
                connection.query(`UPDATE employee SET role_id = ${res[0].id} 
                WHERE first_name = '${employee.substring(0, employee.indexOf(' '))}'
                AND last_name = '${employee.substring(employee.indexOf(' ')+1)}'`, (err, res) => {
                    if(err) console.log(err);
                    mainMenu();
                });
            });
        })
        });
    });
    });
}