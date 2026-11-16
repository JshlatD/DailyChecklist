
// ==========================================
// DAILY CHECKLIST - ALPHA 1
// ==========================================

// DOM Elements
const calendar = document.getElementById("calendar");
const monthYear = document.getElementById("monthYear");

const taskInput = document.getElementById("taskInput");
const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");

const calendarScreen = document.getElementById("calendarScreen");
const taskScreen = document.getElementById("taskScreen");


// ==========================================
// APPLICATION DATA
// ==========================================

let currentDate = new Date();
let selectedDate = new Date();

// Load saved tasks from browser
function loadTasks() {
    try {
        const saved = localStorage.getItem("dailyChecklistTasks");
        const data = saved ? JSON.parse(saved) : {};

        return data && typeof data === "object" && !Array.isArray(data)
            ? data
            : {};

    } catch (error) {
        console.error("Error loading tasks:", error);
        return {};
    }
}

let tasksByDate = loadTasks();


// ==========================================
// DATE FUNCTIONS
// ==========================================

// Convert date to YYYY-MM-DD
function getDateKey(date) {

    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


// Get tasks belonging to a date
function getTasks(date) {

    const tasks = tasksByDate[getDateKey(date)];

    return Array.isArray(tasks) ? tasks : [];
}


// Save tasks in LocalStorage
function saveTasks() {

    try {

        localStorage.setItem(
            "dailyChecklistTasks",
            JSON.stringify(tasksByDate)
        );

    } catch (error) {

        alert("Unable to save your tasks. Browser storage may be full.");

        console.error("Saving error:", error);

    }
}


// ==========================================
// SCREEN NAVIGATION
// ==========================================

// Open checklist screen
function showTaskScreen() {

    calendarScreen.classList.add("hidden");

    taskScreen.classList.remove("hidden");

    renderTasks();

}


// Return to calendar
function showCalendarScreen() {

    taskScreen.classList.add("hidden");

    calendarScreen.classList.remove("hidden");

    renderCalendar();

    updateStats();

}


// Back button
document.getElementById("backButton").addEventListener("click", () => {

    showCalendarScreen();

});


// ==========================================
// COMPLETION CHECK
// ==========================================

// Check if every task of a day is completed
function isDayComplete(date) {

    const tasks = getTasks(date);

    return tasks.length > 0 &&
        tasks.every(task => task.completed === true);

}


// ==========================================
// CALENDAR
// ==========================================

function renderCalendar() {

    calendar.innerHTML = "";

    const year = currentDate.getFullYear();

    const month = currentDate.getMonth();

    // Display month and year
    monthYear.textContent = currentDate.toLocaleDateString(
        "en-IN",
        {
            month: "long",
            year: "numeric"
        }
    );


    // Weekday headings
    const weekdays = [
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat",
        "Sun"
    ];

    weekdays.forEach(day => {

        const div = document.createElement("div");

        div.className = "day-name";

        div.textContent = day;

        calendar.appendChild(div);

    });


    // First day of month
    const firstDay = new Date(year, month, 1).getDay();

    // Convert Sunday-first to Monday-first
    const offset = (firstDay + 6) % 7;


    // Total days in month
    const totalDays = new Date(year, month + 1, 0).getDate();


    // Empty calendar spaces
    for (let i = 0; i < offset; i++) {

        const empty = document.createElement("div");

        empty.className = "calendar-day empty";

        calendar.appendChild(empty);

    }


    // Generate dates
    for (let day = 1; day <= totalDays; day++) {

        const date = new Date(year, month, day);

        const div = document.createElement("button");

        div.type = "button";

        div.className = "calendar-day";

        div.textContent = day;


        // Highlight today's date
        if (getDateKey(date) === getDateKey(new Date())) {

            div.classList.add("today");

        }


        // Highlight selected date
        if (getDateKey(date) === getDateKey(selectedDate)) {

            div.classList.add("selected");

        }


        // Mark fully completed dates
        if (isDayComplete(date)) {

            div.classList.add("day-complete");

        }


        // Open checklist when date is clicked
        div.addEventListener("click", () => {

            selectedDate = new Date(year, month, day);

            showTaskScreen();

        });


        calendar.appendChild(div);

    }

}


// ==========================================
// CHECKLIST SCREEN
// ==========================================

function renderTasks() {

    const tasks = getTasks(selectedDate);

    const dateText = selectedDate.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );


    // Display selected date
    document.getElementById("selectedDate").textContent = dateText;


    // Calculate progress
    const completed = tasks.filter(
        task => task.completed === true
    ).length;

    const total = tasks.length;

    const percentage = total === 0
        ? 0
        : Math.round((completed / total) * 100);


    // Update task message
    document.getElementById("taskMessage").textContent =
        total === 0
            ? "No tasks added for this day."
            : `${completed} of ${total} tasks completed.`;


    // Update progress bar
    document.getElementById("progressBar").style.width =
        percentage + "%";


    // Update task count
    document.getElementById("taskCount").textContent =
        `${total} ${total === 1 ? "task" : "tasks"}`;


    // Clear previous task display
    taskList.innerHTML = "";


    // Empty checklist message
    if (total === 0) {

        const message = document.createElement("p");

        message.className = "empty-message";

        message.textContent = "Add your first task above!";

        taskList.appendChild(message);

    }


    // Display every task
    tasks.forEach(task => {

        const item = document.createElement("div");

        item.className = "task-item";

        if (task.completed) {

            item.classList.add("completed");

        }


        // Checkbox
        const checkbox = document.createElement("input");

        checkbox.type = "checkbox";

        checkbox.className = "task-checkbox";

        checkbox.checked = task.completed;


        checkbox.addEventListener("change", () => {

            task.completed = checkbox.checked;

            saveTasks();

            renderTasks();

            renderCalendar();

        });


        // Task text
        const text = document.createElement("span");

        text.className = "task-text";

        text.textContent = task.text;


        // Delete button
        const deleteButton = document.createElement("button");

        deleteButton.type = "button";

        deleteButton.className = "delete-task";

        deleteButton.textContent = "×";

        deleteButton.setAttribute("aria-label", "Delete task");


        deleteButton.addEventListener("click", () => {

            const key = getDateKey(selectedDate);

            tasksByDate[key] = getTasks(selectedDate)
                .filter(t => t.id !== task.id);

            saveTasks();

            renderTasks();

            renderCalendar();

        });


        // Add elements to task
        item.append(checkbox, text, deleteButton);

        taskList.appendChild(item);

    });


    updateStats();

}


// ==========================================
// ADD NEW TASK
// ==========================================

taskForm.addEventListener("submit", event => {

    event.preventDefault();

    const text = taskInput.value.trim();

    if (!text) return;


    const key = getDateKey(selectedDate);


    // Create date entry if it doesn't exist
    if (!tasksByDate[key]) {

        tasksByDate[key] = [];

    }


    // Create task
    const newTask = {

        id: Date.now() + Math.random(),

        text: text,

        completed: false

    };


    tasksByDate[key].push(newTask);


    // Clear input
    taskInput.value = "";


    // Save and refresh
    saveTasks();

    renderTasks();

    renderCalendar();

    taskInput.focus();

});


// ==========================================
// DELETE COMPLETED TASKS
// ==========================================

document.getElementById("clearCompleted").addEventListener("click", () => {

    const key = getDateKey(selectedDate);

    tasksByDate[key] = getTasks(selectedDate)
        .filter(task => !task.completed);

    saveTasks();

    renderTasks();

    renderCalendar();

});


// ==========================================
// STREAK CALCULATION
// ==========================================

function calculateStreak() {

    const today = new Date();

    today.setHours(0, 0, 0, 0);


    const cursor = new Date(today);


    // If today isn't completed, check from yesterday.
    // This prevents an unfinished current day from
    // immediately breaking the previous streak.

    if (!isDayComplete(cursor)) {

        cursor.setDate(cursor.getDate() - 1);

    }


    let streak = 0;


    // Count consecutive completed days
    while (isDayComplete(cursor)) {

        streak++;

        cursor.setDate(cursor.getDate() - 1);

    }


    return streak;

}


// ==========================================
// DASHBOARD STATISTICS
// ==========================================

function updateStats() {

    const today = new Date();

    const todayTasks = getTasks(today);


    const completed = todayTasks.filter(
        task => task.completed
    ).length;


    const total = todayTasks.length;


    const percentage = total === 0
        ? 0
        : Math.round((completed / total) * 100);


    // Today's progress
    document.getElementById("progress").textContent =
        percentage + "%";


    // Current streak
    document.getElementById("streak").textContent =
        calculateStreak() + " Days";

}


// ==========================================
// MONTH NAVIGATION
// ==========================================

// Previous month
document.getElementById("prevMonth").addEventListener("click", () => {

    currentDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1,
        1
    );

    renderCalendar();

});


// Next month
document.getElementById("nextMonth").addEventListener("click", () => {

    currentDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        1
    );

    renderCalendar();

});


// ==========================================
// APPLICATION INITIALIZATION
// ==========================================

function initializeApp() {

    // Show calendar on startup
    calendarScreen.classList.remove("hidden");

    taskScreen.classList.add("hidden");

    // Load calendar and dashboard
    renderCalendar();

    updateStats();

}


// Start application
initializeApp();
