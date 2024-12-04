 /*const courseList = [
    { id: 156, name: "Finite Mathematics", year: 1, prereq: [], slotsByTerm: {}}, //Not offered this year, special case
    { id: 160, name: "Comp Sci 1", year: 1, prereq: [], slotsByTerm: { 1: [5] } },
    { id: 161, name: "Comp Sci 2", year: 1, prereq: [160], slotsByTerm: { 1: [5] } },
    { id: 171, name: "Intro to Statistics", year: 1, prereq: [], slotsByTerm: { 1:[3, 4, 11], 2: [1, 3] } },
    { id: 172, name: "Intro to Stat Inference", year: 1, prereq: [], slotsByTerm: {2: [3] } },
    { id: 181, name: "Calculus 1", year: 1, prereq: [], slotsByTerm: { 1: [2], 2: [11] } },
    { id: 182, name: "linear Algebra I", year: 1, prereq: [], slotsByTerm: { 1: [1], 2: [4] } },
    { id: 191, name: "Calculus II", year: 1, prereq: [181], slotsByTerm: {2: [2] } },
    { id: 256, name: "Discrete Struct/Prog I", year: 2, prereq: [161], slotsByTerm: { 1: [3] } },
    { id: 257, name: "Discrete Struct/Prog II", year: 2, prereq: [256], slotsByTerm: {2: [3] } },
    { id: 261, name: "Intro Set Theory & Logic", year: 2, prereq: [181], slotsByTerm: { 1: [2] } },
    { id: 264, name: "Digital Comp Fundamentals", year: 2, prereq: [], slotsByTerm: { 1: [4] } },
    { id: 290, name: "Calculus III", year: 2, prereq: [191], slotsByTerm: { 1: [1] } },
    { id: 291, name: "Calculus IV", year: 2, prereq: [290], slotsByTerm: { 2: [5] } },
    { id: 351, name: "Real Analysis I", year: 3, prereq: [261], slotsByTerm: { 1: [2] } }, //Prereq and 290
    { id: 352, name: "Real Analysis II", year: 3, prereq: [351], slotsByTerm: { 2: [2] } },
    { id: 356, name: "Modern Algebra I", year: 3, prereq: [261], slotsByTerm: { 1: [4] } }, //4 prerequisites 252 or 292, 191 and 261
    { id: 357, name: "Modern Algebra II", year: 3, prereq: [356], slotsByTerm: { 2: [4] } },
    { id: 363, name: "Complex Analysis", year: 3, prereq: [290], slotsByTerm: { 1: [3] } },
    { id: 353, name: "Operating Systems I", year: 3, prereq: [257], slotsByTerm: { 1: [6] } },
    { id: 354, name: "Operating Systems II", year: 3, prereq: [353], slotsByTerm: {2: [6] } },
    { id: 367, name: "Computer Organization", year: 3, prereq: [256], slotsByTerm: { 1: [5] } },
    { id: 373, name: "Design/Analysis Algorithms", year: 3, prereq: [257], slotsByTerm: {2: [4] } },
    { id: 460, name: "Programming Languages", year: 4, prereq: [353], slotsByTerm: {2: [8] } },
    { id: 461, name: "Theory of Computation", year: 4, prereq: [261], slotsByTerm: { 1: [4] } },
    { id: 463, name: "Software Engineering", year: 4, prereq: [353], slotsByTerm: { 1: [8] } },
]; globalThis.courseList = courseList;*/


getData();
async function getData() {
    
    
    fetch('https://raw.githubusercontent.com/ZyrillK/ZyrillK.github.io/main/courses.json')
    .then(response => response.json())
    .then(data => processData(data))
    .catch(error => console.error('Error:', error));



  }

function processData(data) {
    globalThis.courseList = data;

    window.majorSelected = majorSelected;
    window.minorSelected = minorSelected;
    window.generateSchedule = generateSchedule;
    window.exportToExcel = exportToExcel;

    

const compSciMajor=[
    
    getCourse(160), getCourse(161), getCourse(171), getCourse(181), getCourse(182), getCourse(191),
    getCourse(256), getCourse(257), getCourse(261), getCourse(264), getCourse(290), getCourse(353),
    getCourse(367), getCourse(373), getCourse(460), getCourse(461), getCourse(463)

]; globalThis.compSciMajor = compSciMajor;

const mathMajor =[ //ALso has additional major requirements that have been omitted
    getCourse(171), getCourse(181), getCourse(182), getCourse(191), getCourse(261), getCourse(290),
    getCourse(291), getCourse(351), getCourse(352), getCourse(356), getCourse(357), getCourse(363)
]; globalThis.mathMajor = mathMajor;

const compSciMinor =[
    getCourse(160), getCourse(161)
]; globalThis.compSciMinor = compSciMinor;

const mathMinor=[
    getCourse(156), getCourse(171), getCourse(172)
]; globalThis.mathMinor = mathMinor;

//A global array for storing scheduled courses to ensure no conflicts
let scheduledCourses = []; globalThis.scheduledCourses = scheduledCourses;
//A global array containing the classes of the chosen Major and Minor
let finalCourses = []; globalThis.finalCourses = finalCourses;

function getCourse(id){
    return courseList.find(course => course.id === id);
}

//this function filters out the courses in the minor that aren't in the major already
function filterMinorReqs(chosenMajor, chosenMinor){
    const selectedMajor = globalThis[chosenMajor];
    const selectedMinor = globalThis[chosenMinor];
    return selectedMinor.filter(course =>
        !selectedMajor.some(selectedMajor => selectedMajor.id === course.id)
    )
}

function majorSelected(selectedMajor){
    //Ensure that a major is chosen
    if(selectedMajor !== ""){
        document.getElementById('minor-selection').style.display = 'block';
    }
    else{
        document.getElementById('minor-selection').style.display = 'none';
        document.getElementById('minorList').innerHTML = '';
    }
    createCheckboxes(selectedMajor, 'majorList');
}

function minorSelected(selectedMinor){
    if(selectedMinor === ""){
        return;
    }
    const filteredMinor = filterMinorReqs(document.getElementById('major').value, selectedMinor);
    createCheckboxes(filteredMinor, 'minorList');
}

function createCheckboxes(chosenCourse, targetContainer){
    let courseArray = chosenCourse;
    if(!Array.isArray(chosenCourse)) {
        courseArray = globalThis[chosenCourse];
    }
    const courseContainer = document.getElementById(targetContainer);
    courseContainer.innerHTML = ''; //Clear any checkboxes
    courseArray.forEach(course => {
        const courseItem = document.createElement('div');
        courseItem.classList.add('course-item');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `course-${course.id}`;
        checkbox.value = course.id;

        const label = document.createElement('label');
        label.setAttribute('for', `course-${course.id}`);
        label.textContent = `${course.name} (Course ID: ${course.id}, Year: ${course.year})`;

        courseItem.appendChild(checkbox);
        courseItem.appendChild(label);
        courseContainer.appendChild(courseItem);
    })
}

function generateSchedule() {
    scheduledCourses = []; //Resets the scheduled courses to be empty
    const selectedMajor = globalThis[document.getElementById('major').value];
    const selectedMinor = globalThis[document.getElementById('minor').value];
    finalCourses = [...selectedMajor, ...selectedMinor];
    console.log('final list', finalCourses);
    //Retrieve arrays of the checkboxes in the major and minor divs and combine them
    const allChecks = [
        ...Array.from(document.querySelectorAll('#majorList input[type="checkbox"]')),
        ...Array.from(document.querySelectorAll('#minorList input[type="checkbox"]'))
    ]

    //Unchecked is an object of untaken courses
    const unchecked = allChecks.filter(checkbox => !checkbox.checked);
    //untaken is an array of just course id numbers as strings
    const untakenStr = unchecked.map(checkbox => checkbox.value);
    let untaken = []
    for(let i = 0; i < untakenStr.length; i++) {untaken.push(parseInt(untakenStr[i]))} //Convert untaken to an int array
    console.log(untaken.length);
    finalCourses.forEach(course => {console.log(typeof course.id)})

    const tableItem = document.querySelectorAll("td");
            tableItem.forEach(cell => {
                
                let numPart = cell.id.slice(4,6);
                if(numPart[1] == "T") {
                    numPart = numPart[0];
                }
                cell.textContent = `Slot ${numPart}`;
            });

    
    displaySchedule(genTermSched(1, untaken), 'scheduleListTerm1')
    displaySchedule(genTermSched(2, untaken), 'scheduleListTerm2')
    this.updateStyle()
}

function genTermSched(term, untaken){
    const eligibleCourses = finalCourses.filter(course =>
        course.slotsByTerm[term] &&
        untaken.includes(course.id) &&
        course.prereq.every(prereq => !untaken.includes(prereq)) &&
        !scheduledCourses.includes(course.id)
    );
    console.log('Eligible:', eligibleCourses);
    //Sort the courses in ascending order by year
    eligibleCourses.sort((a,b) => a.id - b.id)
    //Select up to 4 courses that don't conflict
    let finalSchedule = [];
    const chosenSlots = new Set(); // Keep track of chosen slots, set has no duplicates
    for(const course of eligibleCourses){
        const availableSlot = course.slotsByTerm[term].find(slot => !chosenSlots.has(slot));
        console.log('Available:', availableSlot);
        if(availableSlot && !scheduledCourses.includes(course)){
            //Add to schedule, mark slot as taken
            finalSchedule.push({...course, selectedSlot: availableSlot});
            chosenSlots.add(availableSlot);
            scheduledCourses.push(course.id);
        }
        if(finalSchedule.length > 3) break;
    }
    return finalSchedule;
}

//Alter this function to work properly with the timetable layout designed
function displaySchedule(schedule, listId) {

    /*
    const scheduleList = document.getElementById(listId);
    console.log(listId);
    scheduleList.innerHTML = "";  // Clear any previous schedule
    */

    schedule.forEach(course => {

        /*
        const listItem = document.createElement("li");
        listItem.textContent = `Course ${course.id} - ${course.name}, Year ${course.year}, Selected Slot: ${course.selectedSlot}`;
        scheduleList.appendChild(listItem);*/

        let time = {
            1: "8:30-9:20",
            2: "9:30-10:20",
            3: "10:40-11:30",
            4: "11:40-12:30",
            5: "12:40-1:30",
            6: "1:40-2:30",
            7: "2:40-3:30",
            8: "3:40-5:00",
            10: "8:30-9:50",
            11: "10:10-11:30",
            12: "11:40-12:30",
            13: "1:40-4:30",
            14: "1:40-4:30",
            15: "3:40-5:30",
        }


        if(listId == "scheduleListTerm1") {

            const tableItem = document.querySelectorAll(`#slot${course.selectedSlot}T1`);
            console.log(`listTerm 1 ${course.selectedSlot}`);
            tableItem.forEach(cell => {
                cell.textContent = `${course.name} ${time[course.selectedSlot]}`;
                cell.classList.add("tooltip");

                
                const tipText = document.createElement('span');
                tipText.classList.add("tooltiptext");
                tipText.textContent = `${course.id}`;//
         
                data.forEach(xyz => {

                    if(`${xyz.id}` == `${course.id}`) {
                        console.log(`${xyz.description}`);
                        tipText.textContent = `${xyz.description}`;
                    }

                });

                cell.appendChild(tipText);

            });
        }
        else if(listId == "scheduleListTerm2") {

            const tableItem = document.querySelectorAll(`#slot${course.selectedSlot}T2`);
            console.log(`listTerm 2 ${course.selectedSlot}`);
            tableItem.forEach(cell => {
                cell.textContent = `${course.name} ${time[course.selectedSlot]}`;
                cell.classList.add("tooltip");

                
                const tipText = document.createElement('span');
                tipText.classList.add("tooltiptext");
                tipText.textContent = `${course.id}`;//
         
                data.forEach(xyz => {

                    if(`${xyz.id}` == `${course.id}`) {
                        console.log(`${xyz.description}`);
                        tipText.textContent = `${xyz.description}`;
                    }

                });

                cell.appendChild(tipText);

            });

        }


    });

    if (schedule.length === 0) {
        scheduleList.innerHTML = "<li>No available courses to schedule</li>";
    }


}

function exportToExcel(val){
    var table = document.getElementById(val);
    var wb = XLSX.utils.table_to_book(table);
    XLSX.writeFile(wb, `${val}.xlsx` );
}


}

