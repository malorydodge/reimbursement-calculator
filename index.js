const inquirer = require('inquirer');
const sets = require('./sets.json');

const askQuestion = () => {
    inquirer.prompt([{
            type: 'list',
            name: 'set',
            message: 'Please select a set of projects to calculate the reimbursement:',
            choices: ['Set 1', 'Set 2', 'Set 3', 'Set 4']
        },]).then(answers => {
            console.info(answers.set + ': ', sets[answers.set]);
            let reimbursement = calculateReimbursement(sets[answers.set]);
            console.info('Reimbursement total: $', reimbursement)
            askQuestion();
    });
};

console.info('Welcome to the Reimbursement Calculator');
askQuestion();

const calculateReimbursement = (set) => { // creates list of dates to add, then calls function to add up dates in dateList
    let dateList = [];
    for (let i = 0; i < set.length; i++) {
        let project = set[i];
        let singleLastDay = ((i === (set.length - 1)) && (project.startDate === project.endDate)); // is current date last in the set?        
        if (i === 0) { // do not need to perform checks if date exists in dateList
            dateList = addStartDate(dateList, project, true, singleLastDay);
        } else { // need to perform checks if date exists in dateList
            let dateIndex = checkForDate(dateList, project.startDate);
            if (dateIndex !== -1) { // startDate exists in dateList
                dateList = editDateList(dateList, dateIndex, project.city, singleLastDay); // startDate is last in set if equal to endDate
            } else { // startDate needs to be added to dateList
                dateList = addStartDate(dateList, project, false, singleLastDay);
            }
        }
        if (project.startDate !== project.endDate) {
            dateList = addFullDays(dateList, project);
            // add endDate to dateList
            let endDateToAdd = {
                date: project.endDate,
                type: 'Travel',
                city: project.city,
                isFirstInSequence: false
            }
            dateList.push(endDateToAdd);
        }
    }
    let totalReimbursement = getDateListTotal(dateList);
    return totalReimbursement;
}

const getTravelCost = (city) => {
    switch (city) {
        case 'Low Cost':
            return 45;
        case 'High Cost':
            return 55;
        default:
            return 45;
    }
}

const getFullCost = (city) => {
    switch (city) {
        case 'Low Cost':
            return 75;
        case 'High Cost':
            return 85;
        default:
            return 75;
    }
}

const getDaysBetween = (dateString1, dateString2) => { // returns number of days between 2 dates (not including the dates given)
    let date1 = new Date(dateString1);
    let date2 = new Date(dateString2);
    let diff = date2.getTime() - date1.getTime();
    let days = diff / (1000 * 3600 * 24) - 1;
    return days;
}

const getDateToAdd = (dateString1, days) => {
    let date1 = new Date(dateString1);
    var options = {
        year: '2-digit',
        month: 'numeric',
        day: 'numeric'
    };
    let date2 = new Date(date1.getTime() + (days * 1000 * 3600 * 24)).toLocaleDateString('en', options);
    return date2;
}

const checkForGap = (date1, date2) => { // returns true if gap exists between 2 dates
    if (getDaysBetween(date1, date2) > 0) {
        return true;
    } else {
        return false;
    }
}

const checkForDate = (dateList, date) => { // returns index of date if date exists in dateList, or -1 if not found
    let dateIndex = -1;
    for (let i = 0; i < dateList.length; i++) {
        if (dateList[i].date === date) {
            dateIndex = i;
        }
    }
    return dateIndex;
}

const getMostRecentDate = (dateList) => { // returns most recent date in list
    if (dateList.length > 1) {
        return dateList.reduce((a, b, currentIndex) => {
            return new Date(a.MeasureDate) > new Date(b.MeasureDate) ? currentIndex - 1 : currentIndex;
        });
    } else return 0;
}

const editDateList = (dateList, dateListIndex, projectCity, lastInSet) => { // check and change city/reimbursement types if needed
    if (dateList[dateListIndex]) {
        if (dateList[dateListIndex].city !== projectCity) { // if low cost and high cost projects on same date, set to high cost
            dateList[dateListIndex].city = 'High Cost';
        }
        if (dateList[dateListIndex].isFirstInSequence || lastInSet) { // if first or last date in a sequence of projects
            dateList[dateListIndex].type = 'Travel';
        } else {
            dateList[dateListIndex].type = 'Full';
        }
    }
    return dateList;
}

const getDateListTotal = (dateList) => { // returns total calculated reimbursement
    let reimbursement = 0;
    for (date of dateList) {
        if (date.type === 'Full') {
            reimbursement += getFullCost(date.city);
        } else { // date type is Travel
            reimbursement += getTravelCost(date.city);
        }
    }
    return reimbursement;
}

const addFullDays = (dateList, project) => {
    let fullDays = getDaysBetween(project.startDate, project.endDate); // days in middle of project are counted as full days
    if (fullDays > 0) {
        for (let j = 1; j <= fullDays; j++) {
            let currentDate = getDateToAdd(project.startDate, j);
            let currentDateIndex = checkForDate(dateList, currentDate);
            if (currentDateIndex !== -1) { // date exists in dateList
                dateList = editDateList(currentDateIndex, project.city, false);
            } else {
                let dateToAdd = {
                    date: currentDate,
                    type: 'Full',
                    city: project.city,
                    isFirstInSequence: false
                }
                dateList.push(dateToAdd);
            }
        }
    }
    return dateList;
}

const addStartDate = (dateList, project, isFirstInSet, singleLastDay) => {
    let startDateToAdd = {
        date: project.startDate,
        type: 'Travel',
        city: project.city,
        isFirstInSequence: false
    };
    if (!isFirstInSet) {
        let mostRecentIndex = getMostRecentDate(dateList);
        if (checkForGap(dateList[mostRecentIndex].date, project.startDate)) { // gap exists between most recent & current date
            startDateToAdd.isFirstInSequence = true;
        } else { // no gap between most recent date and startDate
            if (!dateList[mostRecentIndex].isFirstInSequence) {
                dateList[mostRecentIndex].type = 'Full'; // set most recent date to full day - projects push up against each other
            }
            if (!singleLastDay) {
                startDateToAdd.type = 'Full';
            }
        }
    }
    else { // first date in set
        startDateToAdd.isFirstInSequence = true;
    }
    dateList.push(startDateToAdd);
    return dateList;
}