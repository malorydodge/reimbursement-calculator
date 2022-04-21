const inquirer = require('inquirer');
console.info('Welcome to the Reimbursement Calculator');
let set = [];
let newProject = {
    cityType: "",
    startDate: "",
    endDate: ""
}
const askQuestion = () => {
    inquirer
    .prompt([
        {
        type: 'list',
        name: 'default',
        message: 'Welcome to the Reimbursement Calculator',
        choices: ['Add project to set', 'View set', 'Calculate reimbursement', 'Start over'],
        },
    ])
    .then(answers => {
        switch(answers.default) {
            case 'Add project to set':
                inquirer
                    .prompt([
                        {
                        type: 'list',
                        name: 'cityType',
                        message: 'Type of City:',
                        choices: ['Low Cost', 'High Cost'],
                        },
                    ])
                    .then(answers => {
                        newProject.cityType = answers.cityType;
                        inquirer
                        .prompt([
                            {
                            name: 'startDate',
                            message: 'Start Date (mm/dd/yy):',
                            },
                        ])
                        .then(answers => {
                            newProject.startDate = answers.startDate;
                            inquirer
                            .prompt([
                                {
                                name: 'endDate',
                                message: 'End Date (mm/dd/yy):',
                                },
                            ])
                            .then(answers => {
                                newProject.endDate = answers.endDate;
                                set.push(newProject);
                                console.info("Project added!")
                                askQuestion();
                            });
                        });
                    });
                break;
            case 'View set':
                console.info(set);
                askQuestion();
                break;
            case 'Calculate reimbursement':
                console.info("Reimbursement Total: $0");
                askQuestion();
                break;
            case 'Start over':
                set = [];
                newProject = {
                    cityType: "",
                    startDate: "",
                    endDate: ""
                };
                askQuestion();
                break;

        }
    });
};
askQuestion();
