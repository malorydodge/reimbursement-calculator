const inquirer = require('inquirer');
const sets = require('./sets.json'); 

const askQuestion = () => {
    inquirer.prompt([{
            type: 'list',
            name: 'set',
            message: 'Please select a set of projects to calculate the reimbursement:',
            choices: ['Set 1', 'Set 2', 'Set 3', 'Set 4']
        },]).then(answers => {
            console.info(sets[answers.set]);
            let reimbursement = calculateReimbursement(sets[answers.set]);
            console.info("Reimbursement total: $", reimbursement)
            askQuestion();
        }
    );
};

console.info('Welcome to the Reimbursement Calculator');
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
        } else {
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
        if (i !== (set.length - 1)) {
            // current project is not the last in the set
            // check for gap after project
            if (!checkForGap(project.endDate, set[i + 1].startDate)) {
                endDateCost = getFullCost(project.cityType);
            }
        }
        lastEndDate = project.endDate;
        reimbursement += (startDateCost + endDateCost + fullDays * getFullCost(project.cityType));
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

const getDaysBetween = (dateString1, dateString2) => { // TODO
    let date1 = new Date(dateString1);
    let date2 = new Date(dateString2);
    let diff = date2.getTime() - date1.getTime();
    let days = diff / (1000 * 3600 * 24)
    return days - 1; // do not count start or end date
}

const checkForGap = (date1, date2) => { // TODO
    if (getDaysBetween(date1, date2) > 0) {
        return true;
    } else 
        return false;
    
}
