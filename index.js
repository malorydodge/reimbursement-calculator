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
                let total = calculateReimbursement(set);
                console.info("Reimbursement Total: $", total);
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

const calculateReimbursement = (set) => {
    let reimbursement = 0;
    let lastEndDate = "";
    for (let i = 0; i < set.length; i++) {
        let project = set[i];
        let startDateCost = getTravelCost(project.cityType);
        let endDateCost = getTravelCost(project.cityType);
        let fullDays = 0;
        if (project.startDate !== project.endDate) {
            fullDays = getDaysBetween(project.startDate, project.endDate);
        }
        else {
            endDateCost = 0; // only one day in project - count it only once
        }
        // check for gap before project
        if (i > 0) { // if previous project in set exists 
            if (!checkForGap(lastEndDate, project.startDate)) { // if no gap between previous project and current project
                if (lastEndDate !== project.startDate) { // if dates of projects do not overlap
                    startDateCost = getFullCost(project.cityType);
                }
            }
        }        
        if (i !== (set.length - 1)) { // current project is not the last in the set
            //check for gap after project
            if (!checkForGap(project.endDate, set[i+1].startDate)) {
                endDateCost = getFullCost(project.cityType);
            }
        }
        lastEndDate = project.endDate;
        reimbursement += (startDateCost + endDateCost  + fullDays*getFullCost(project.cityType));
    }
    return reimbursement;
}

const getTravelCost = (cityType) => {
    switch (cityType) {
        case 'Low Cost': 
            return 45;
        case 'High Cost': 
            return 55;
        default: 
            return 45;
    }
}

const getFullCost = (cityType) => {
    switch (cityType) {
        case 'Low Cost': 
            return 75;
        case 'High Cost': 
            return 85;
        default: 
            return 75;
    }
}

const getDaysBetween = (date1, date2) => { // TODO
    return 1; // testing
}

const checkForGap = (date1, date2) => { // TODO
    return 1; // testing
}