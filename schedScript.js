

const MAX_COURSES = 4;
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
    getCourse(62160), getCourse(62161), getCourse(62171), getCourse(62181), getCourse(62182), getCourse(62191),
    getCourse(62256), getCourse(62257), getCourse(62261), getCourse(62264), getCourse(62290), getCourse(62353),
    getCourse(62367), getCourse(62373), getCourse(62460), getCourse(62461), getCourse(62463)
]; globalThis.compSciMajor = compSciMajor;

const mathMajor =[ //ALso has additional major requirements that have been omitted
    getCourse(62171), getCourse(62181), getCourse(62182), getCourse(62191), getCourse(62261), getCourse(62290),
    getCourse(62291), getCourse(62351), getCourse(62352), getCourse(62356), getCourse(62357), getCourse(62363)
]; globalThis.mathMajor = mathMajor;

const physMajor =[
    getCourse(74161), getCourse(74162), getCourse(74272), getCourse(74273), getCourse(74275), getCourse(74276),
    getCourse(74281), getCourse(74382), getCourse(74387), getCourse(74388), getCourse(62181), getCourse(62191),
    getCourse(62290), getCourse(62291)
]; globalThis.physMajor = physMajor;

const compSciMinor =[
    getCourse(62160), getCourse(62161)
]; globalThis.compSciMinor = compSciMinor;

const mathMinor=[
    getCourse(62156), getCourse(62171), getCourse(62172)
]; globalThis.mathMinor = mathMinor;

const physMinor =[
    getCourse(74161), getCourse(74162), getCourse(74272), getCourse(74273), getCourse(74275)
]; globalThis.physMinor = physMinor;

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
    console.log(!Array.isArray(chosenCourse));
    if(!Array.isArray(chosenCourse)) {
        courseArray = globalThis[chosenCourse];
    }
    const courseContainer = document.getElementById(targetContainer);
    courseContainer.innerHTML = ''; //Clear any checkboxes
    courseArray.forEach(course => {
        const courseItem = document.createElement('div');
        courseItem.classList.add('course-item');

        console.log(courseArray);

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
    const selectedMinor = filterMinorReqs(
        document.getElementById('major').value,
        document.getElementById('minor').value
    );
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
    eligibleCourses.sort((a, b) => a.year - b.year || a.id - b.id);
    //Select up to 4 courses that don't conflict
    const finalSchedule = [];
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
        if(finalSchedule.length >= MAX_COURSES) break;
    }
    return finalSchedule;
}

//Alter this function to work properly with the timetable layout designed
function displaySchedule(schedule, listId) {

    schedule.forEach(course => {


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
                tipText.textContent = `${course.id}`;
         
                data.forEach(xyz => {

                    if(`${xyz.id}` == `${course.id}`) {
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
                        tipText.textContent = `${xyz.description}`;
                    }

                });

                cell.appendChild(tipText);
            });

        }


    });

}

function exportToExcel(val){
    var table = document.getElementById(val);
    var wb = XLSX.utils.table_to_book(table);
    XLSX.writeFile(wb, `${val}.xlsx` );
}


}