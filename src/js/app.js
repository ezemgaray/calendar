window.onload = function () {
    printCalendar.init()
    clock()
}

Date.prototype.addHours = function (h) {
    this.setHours(this.getHours() + h);
    return this;
}
const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
]

let dataNewEvent = {
    id: "",
    event: "",
    title: "",
    description: "",
    eventType: "",
    initialDate: "",
    endDate: "",
    remind: 0,
    remindms: 0,
    reminded: false
}

document.addEventListener("click", function (e) {
    switch (e.target.id) {
        case "next-month":
            changeDate.nextMonth()
            break
        case "previous-month":
            changeDate.previousMonth()
            break
        case "next-year":
            changeDate.nextYear()
            break
        case "previous-year":
            changeDate.previousYear()
            break
        case "event-title":
            events.showEventInfo(e.target)
            break
    }

    if (!isNaN(parseInt(e.target.id)) || !isNaN(parseInt(e.target.dataset.ref))) {
        modal.init(e.target)
    }

});

/**
 * Recursive function. starts the clock
 */
function clock() {
    today = new Date()
    hour = today.getHours()
    minute = today.getMinutes()
    second = today.getSeconds()

    function pad(s) {
        return (s < 10) ? '0' + s : s;
    }
    document.getElementById('clock').value = pad(hour) + " : " + pad(minute) + " : " + pad(second)
    setTimeout("clock()", 1000)

    //check events and show alerts
    if (second === 30 || second == 0) {
        events.showAlert()
    }
}
/**
 * Object responsible for printing and updating the calendar
 */
let printCalendar = {
    /**
     * Starts the calendar on the current date
     * @param {*Date} date -> default current date
     */
    init: function (date = new Date()) {
        this.printYear(date.getFullYear())
        this.printMonth(date.getMonth())
        this.printDays(
            date.getFullYear(),
            date.getMonth() + 1,
            this.daysInMonth(
                date.getMonth() + 1,
                date.getFullYear()),
            //This short day is used to change the grid css adding a class 
            this.shortDay(new Date(`${date.getFullYear()}-${date.getMonth()+1}-1`)).toLowerCase() //end daysInMonth()
        ) //end printDays()
    },
    printYear: function (fullYear) {
        document.querySelector(".year__slide__number h3").innerText = fullYear
    },
    printMonth: function (month) {
        document.querySelector(".month__slide__name h2").innerText = monthNames[month]

    },
    printDays: function (year, month, days, start) {
        let today = new Date()
        today = today.setHours(0, 0, 0, 0)
        document.getElementById("calendar-days").className = "calendar__days " + start
        document.getElementById("calendar-days").innerHTML = ""
        for (let i = 0; i < days; i++) {

            let divDay = document.createElement("div") //day container
            divDay.className = "calendar__days__day"
            divDay.id = Date.parse(`${year}-${month}-${i + 1}`) // set id: day in ms.

            let template = `<div class="day__number">
                                <div class="add" data-ref="${divDay.id}"><span>+</span></div>
                                <div>${i + 1}</div> 
                                <div class="event__point"></div>
                             </div>`

            divDay.innerHTML = template
            document.getElementById("calendar-days").append(divDay)

            if (today === parseInt(divDay.id)) { //Add class to current date to differentiate it
                divDay.firstChild.className += " today"
            }
        }
        this.printDots(year, month, days, storage.getLocalStorage())

    },
    /**
     * Compare initial date of events with id of days (day in ms).
     * If a day have one or more events, add a dot [red (passed), yellow (current), green (next)]
     * @param {*Number} year 
     * @param {*Number} month 
     * @param {*Number} days 
     * @param {*Array} storage 
     */
    printDots: function (year, month, days, storage) {
        for (let i = 0; i < days; i++) {
            let today = new Date()
            today = today.setHours(0, 0, 0, 0) // current day at 00:00:00hs
            // the ID corresponding to the year, month and day being reviewed is taken
            let divDay = document.getElementById(`${Date.parse(`${year}-${month}-${i + 1}`)}`)

            // Check for events for this day
            for (let eventDay in storage) {
                let test = divDay.querySelector(".event__point")
                if (parseInt(divDay.id) === storage[eventDay].event) {
                    if (today === parseInt(divDay.id)) {
                        test.className += " yellow" //today
                    }
                    if (today > parseInt(divDay.id || today > Date.parse(storage[eventDay].endDate))) {
                        test.className += " red" //passed
                    }
                    if (today < parseInt(divDay.id)) {
                        test.className += " green" //next
                    }
                } // End the if of single day events
                //if an event covers more than one day, it will show a point on each day it occupies
                if (parseInt(divDay.id) >= Date.parse(storage[eventDay].initialDate) &&
                    parseInt(divDay.id) < Date.parse(storage[eventDay].endDate)) {
                    if (today === parseInt(divDay.id)) {
                        test.className += " yellow" //today
                    }
                    if (today > parseInt(divDay.id || today > Date.parse(storage[eventDay].endDate))) {
                        test.className += " red" //passed
                    }
                    if (today < parseInt(divDay.id)) {
                        test.className += " green" //next
                    }
                } // End the if of single day events
            } // End for check events
        } //End for days in month
    },
    daysInMonth: function (month, year) {
        return new Date(year, month, 0).getDate()
    },
    shortDay: function (date) {
        // return short name of day (mon, tue, wed...)
        return new Intl.DateTimeFormat('en-UK', {
            weekday: 'short'
        }).format(date)
    },
    refresh: function () {
        //Update calendar when an event is deleted
        let year = document.querySelector(".year__slide__number h3").innerText
        let month = monthNames.indexOf(document.querySelector(".month__slide__name h2").innerText) + 1
        this.init(new Date(`${year}-${month}-1`))
    }
}

/**
 * Responsible of changing the months and year when using the navigation buttons
 */
let changeDate = {
    nextMonth: function () {
        let month = document.querySelector(".month__slide__name h2").innerText
        month = monthNames.indexOf(month) + 2 > 12 ? 1 : monthNames.indexOf(month) + 2
        let year = document.querySelector(".year__slide__number h3").innerText
        if (month === 1) {
            document.querySelector(".year__slide__number h3").innerText = (parseInt(year) + 1)
            year = parseInt(year) + 1
        }
        printCalendar.init(new Date(`${year}-${month}-1`))

    },
    previousMonth: function () {
        let month = document.querySelector(".month__slide__name h2").innerText
        month = monthNames.indexOf(month) < 1 ? 12 : monthNames.indexOf(month)
        let year = document.querySelector(".year__slide__number h3").innerText
        if (month === 12) {
            document.querySelector(".year__slide__number h3").innerText = (parseInt(year) - 1)
            year = parseInt(year) - 1
        }
        printCalendar.init(new Date(`${year}-${month}-1`))
    },
    nextYear: function () {
        let month = monthNames.indexOf(document.querySelector(".month__slide__name h2").innerText) + 1
        let year = parseInt(document.querySelector(".year__slide__number h3").innerText) + 1
        printCalendar.init(new Date(`${year}-${month}-1`))

    },
    previousYear() {
        let month = monthNames.indexOf(document.querySelector(".month__slide__name h2").innerText) + 1
        let year = parseInt(document.querySelector(".year__slide__number h3").innerText) - 1
        printCalendar.init(new Date(`${year}-${month}-1`))
    }
}

/**
 * Show modal window and show the corresponding content (form or events of the selected day)
 */
let modal = {
    /**
     * Modal Controller
     * @param {*HTML Element} element 
     */
    init: function (element) {
        if (element.dataset.ref) {
            this.modalAdd(element)
        } else {
            this.modalEvents(element)
        }

    },
    /**
     * Show form add
     * @param {*HTML Element} element 
     */
    modalAdd: function (element) {
        let form = document.getElementById("form").innerHTML
        this.modalAnimation(element.parentElement, form)
    },
    /**
     * Show event list
     * @param {*HTML Element} element 
     */
    modalEvents: function (element) {
        let eventList = document.createElement("div")
        eventList.append(events.getEvents(element))

        //if there are no events on this day, show the form to add
        if (element.querySelector(".green") || element.querySelector(".red") || element.querySelector(".yellow")) {
            this.modalAnimation(element.firstChild, eventList.innerHTML)

        } else {
            this.modalAdd(element.firstChild.firstChild)
        }

    },
    /**
     * animates the modal window taking as reference the element that 
     * generates the click and adds the corresponding content
     * @param {*HTML Element} element 
     * @param {*HTML text} content -> HTML text (form or event list)
     */
    modalAnimation: function (element, content) {
        let modal = document.getElementById("modal")
        let squareModal = document.createElement("div")
        let position = element.getBoundingClientRect()

        squareModal.className = "modal__content"
        squareModal.id = "divModal"
        squareModal.style.cssText = `top: ${position.top}px; 
                        left: ${position.left}px; width: 50px; 
                        height: 50px; border-radius: 50%;`
        modal.style.cssText = "display: block; visibility: visible; opacity: 1;"
        modal.appendChild(squareModal)

        setTimeout(function () {
            squareModal.style.cssText = ` top: 50%; left: 50%; width: 50%;
                                height: 80%; border-radius: 5px; 
                                transform: translate(-50%, -50%); 
                                background: rgb(11, 201, 191);`
            setTimeout(function () {
                squareModal.innerHTML = content
                modal.style.background = "rgba(0,0,0,.3)"
                squareModal.style.cssText += " min-width: 400px;"

                if (document.getElementById("formadd")) {
                    validateForm.formListeners(element)
                }
                if(document.getElementById('event-list')){
                    squareModal.style.cssText += " overflow: auto;"
                }

            }, 700)

            // Close modal window by clicking or pressing escape
            modal.onclick = function (e) {
                if (e.target.id === "modal" || e.target.dataset.close) {
                    closeModal()
                }
                if (e.target.dataset.delete) {
                    storage.removeEvent(e.target.dataset.delete)
                    e.target.parentElement.parentElement.remove()
                }
            }
            document.onkeyup = function (e) {
                if (e.keyCode === 27) {
                    closeModal()
                }
            }


        }, 500)

        //Modal window close animation
        function closeModal() {
            squareModal.style.cssText = `top: ${position.top}px; 
                                    left: ${position.left}px; width: 50px;
                                    height: 50px; border-radius: 50%;`
            squareModal.innerHTML = ""
            printCalendar.refresh()
            setTimeout(function () {
                modal.style.cssText = "display: none; visibility: hidden; opacity: 0;"
                modal.innerHTML = ""
            }, 900);
        }

    }
}

/**
 * Generate event views and alerts.
 */
let events = {
    getEvents: function (element) {
        let events = document.createElement("div")
        events.id = "event-list"
        events.className = "event__list"
        events.innerHTML = `<span class="close" data-close="close">close</span>`

        let currentEvents = [] //to save events of this day
        let tempLocalStorage = storage.tempLocalStorage

        //search events and save
        for (let event in tempLocalStorage) {
            if (parseInt(element.id) === tempLocalStorage[event].event ||
                (parseInt(element.id) >= tempLocalStorage[event].event &&
                    parseInt(element.id) < Date.parse(tempLocalStorage[event].endDate))) {
                currentEvents.push(tempLocalStorage[event])
            }
        }
        //sort events according to start time
        currentEvents = currentEvents.sort((a, b) => {
            return a.initialDate > b.initialDate ? 1 : a.initialDate < b.initialDate ? -1 : 0
        })

        // If there are events, generate the list
        if (currentEvents.length) {
            for (let event in currentEvents) {
                let eventContainer = document.createElement("div")
                eventContainer.className = "event__container"
                let template = `<h3 id="event-title" class="event__title">${currentEvents[event].title} 
                                    <span data-delete="${currentEvents[event].id}" class="delete">delete</span>
                                </h3>
                                <div class="event__info">
                                    <p><span>Description: </span> ${currentEvents[event].description}</p>
                                    <p><span>Event type: </span>${currentEvents[event].eventType}</p>
                                    <p><span>Initial Date: </span>${this.getCurrentDate(currentEvents[event].initialDate)}</p>
                                    <p><span>Finish Event: </span>${this.getCurrentDate(currentEvents[event].endDate)}</p>
                                    <p><span>Remind: </span>${currentEvents[event].remind} min.</p>
                                </div>`
                eventContainer.innerHTML = template

                events.append(eventContainer)
            }

            return events

        }
    },
    // animate the view of the clicked event
    showEventInfo: function (etarget) {
        if (etarget.parentElement.className === "event__container") {
            etarget.parentElement.querySelector(".event__info").classList.toggle("event__show")
        }
    },
    /**
     * generates the date text format
     * @param {*Date} eventDate 
     */
    getCurrentDate: function (eventDate) {
        function pad(s) {
            return (s < 10) ? '0' + s : s;
        }
        var dateFormat = new Date(eventDate)

        let myFullDate = [
            pad(dateFormat.getDate()),
            pad(dateFormat.getMonth() + 1),
            dateFormat.getFullYear()
        ].join('/') + " " + [
            pad(dateFormat.getHours()),
            pad(dateFormat.getMinutes())
        ].join(":") + " hs."
        return myFullDate
    },
    /**
     * Show event alert
     */
    showAlert: function () {
        let tempLocalStorage = storage.getLocalStorage()
        let alertsContainer = document.getElementById("alerts")

        for (let event in tempLocalStorage) {
            let template
            let isreminded = tempLocalStorage[event].reminded === false
            let endDatems = Date.parse(new Date(tempLocalStorage[event].endDate)) //end date in milliseconds
            let initialDatems = Date.parse(new Date(tempLocalStorage[event].initialDate)) // initial date in milliseconds
            let showAlert = document.createElement("div")
            showAlert.className = "alert"

            if (Date.parse(new Date()) >= tempLocalStorage[event].remindms && isreminded) {

                template = `<p>Event starts soon:</p>
                            <h3>${tempLocalStorage[event].title}</h3>
                            <p>Start: ${this.getCurrentDate(tempLocalStorage[event].initialDate)}</p>`
            }

            if (Date.parse(new Date()) >= endDatems && isreminded) {

                template = `<p>Finished event:</p>
                            <h3>${tempLocalStorage[event].title}</h3>
                            <p>Finished: ${this.getCurrentDate(tempLocalStorage[event].endDate)}</p>`
            }

            if (Date.parse(new Date()) === initialDatems && isreminded) {

                template = `<p>Starts NOW:</p>
                            <h3>${tempLocalStorage[event].title}</h3>
                            <p>Start: ${this.getCurrentDate(tempLocalStorage[event].initialDate)}</p>`
            }

            if (Date.parse(new Date()) >= initialDatems && Date.parse(new Date()) <= endDatems && isreminded) {
                template = `<p>Ongoing event:</p>
                            <h3>${tempLocalStorage[event].title}</h3>
                            <p>Start: ${this.getCurrentDate(tempLocalStorage[event].initialDate)}</p>
                            <p>End: ${this.getCurrentDate(tempLocalStorage[event].endDate)}</p>`
            }

            if (template) {
                tempLocalStorage[event].reminded = true // will not display the message again
                localStorage.setItem("events", JSON.stringify(tempLocalStorage)) //Update localStorage
                tempLocalStorage = storage.getLocalStorage() //recover updated localStorage 
                showAlert.innerHTML = template // save alert
                alertsContainer.append(showAlert) // insert alert

                showAlert.style.cssText = "opacity: 1; visibility: visible"
                setTimeout(function () { // close the message after 10 seconds
                    showAlert.style.cssText = "opacity: 0; visibility: hidden"
                    showAlert.ontransitionend = function () {
                        this.remove()
                    }
                }, 10000)
            }

        }
    }
}

/**
 * LocalStorage controller
 */
let storage = {
    tempLocalStorage: "",
    getLocalStorage: function () {
        this.tempLocalStorage = JSON.parse(localStorage.getItem("events"))
        return this.tempLocalStorage
    },
    /**
     * Save events in localStorage
     * @param {*Object} currentEvent 
     */
    saveLocalStorage: function (currentEvent) {
        let storage = this.getLocalStorage()

        if (storage) {
            currentEvent.id = Date.parse(new Date()) //Set Id for the event (now in ms)
            storage.push(currentEvent) //add event to the list
        } else {
            let arr = [] //if the localstorage is empty create an array where the events will be saved
            currentEvent.id = Date.parse(new Date()) //Set Id for the event (now in ms)
            arr.push(currentEvent) // add event
            localStorage.setItem("events", JSON.stringify(arr)) // save the new list
            return
        }
        localStorage.setItem("events", JSON.stringify(storage)) // save list
    },
    /**
     * Remove event from localStorage
     * @param {*Numbre} id  -> Item ID (date in milliseconds from the time the event was saved)
     */
    removeEvent: function (id) {
        let storage = this.getLocalStorage()

        //Sear event in localStorage
        for (let event in storage) {
            if (storage[event].id == id) {
                storage.splice(event, 1) //Delete event
            }
        }

        if (storage.length) {
            localStorage.setItem("events", JSON.stringify(storage)) //Save again
        } else {
            localStorage.removeItem("events") // If storage is empty, remove localStorage
        }
    }
}

/**
 * Form validation
 */
let validateForm = {
    /**
     * Add form listeners and default values ​​to dates
     * @param {*HTML Element} element -> indicates the day the form is activated
     */
    formListeners: function (element) {
        let form = document.formadd

        //Set default values
        document.getElementById("finitialdate").value = (new Date(parseInt(element.parentElement.id)).addHours(2)).toISOString().slice(0, 16)
        document.getElementById("fenddate").value = (new Date(parseInt(element.parentElement.id)).addHours(3)).toISOString().slice(0, 16)
        //to save events in past days, comment on these two lines
        document.getElementById("finitialdate").min = (new Date()).toISOString().slice(0, 16)
        document.getElementById("fenddate").min = (new Date()).toISOString().slice(0, 16)


        //SUBMIT
        form.onsubmit = this.addEvent

        // ONCHANGE DATE
        form.finitialdate.onchange = function () {
            document.getElementById("fenddate").value = (new Date(Date.parse(document.getElementById("finitialdate").value))
                .addHours(3)).toISOString().slice(0, 16)
        }

        //ONCHANGE CHECKBOX
        form.onchange = function (e) {
            if (e.target.id === form.fisenddate.id) {
                if (form.fenddate.disabled === false) {
                    form.fenddate.disabled = true
                } else {
                    form.fenddate.disabled = false
                }
            }
            if (e.target.id === form.fisremind.id) {
                if (form.fremind.disabled === false) {
                    form.fremind.disabled = true
                } else {
                    form.fremind.disabled = false
                }
            }
        }

    },
    addEvent: function (e) {
        e.preventDefault();

        if (validateForm.validateInputs()) {
            storage.saveLocalStorage(dataNewEvent) //save new event
            storage.getLocalStorage() // update tempLocalStorage
            printCalendar.refresh() //Update calentar

            document.getElementById("modal").style.opacity = "0"
            setTimeout(function(){
                document.getElementById("modal").removeAttribute("style")
                document.getElementById("modal").innerHTML = ""

            }, 500)
        }
    },
    validateInputs: function () {
        let form = document.formadd

        function showError(input, hidden) {
            let labelError = document.querySelectorAll(`[for="${input.id}"]`)[1]
            if (input && hidden) {
                labelError.classList.remove("show")
            }
            if (input && !hidden) {
                labelError.classList.add("show")
            }
        }

        if (!form.ftitle.value.trim().length) {
            showError(form.ftitle)
            return
        }
        showError(form.ftitle, true)

        if (!form.finitialdate.value.trim().length) {
            showError(form.finitialdate)
            return
        }
        showError(form.finitialdate, true)

        if (form.fisenddate.checked && !form.fenddate.value.trim().length) {
            showError(form.fenddate)
            return
        }
        showError(form.fenddate, true)

        if (form.fisremind.checked && !form.fremind.value.trim().length) {
            showError(form.fremind)
            return
        }
        showError(form.fremind, true)

        if (!form.fdescription.value.trim().length || form.fdescription.value.trim().length > 500) {
            showError(form.fdescription)
            return
        }
        showError(form.fdescription, true)

        if (!form.feventtype.value.trim().length) {
            showError(form.feventtype)
            return
        }
        showError(form.feventtype, true)

        let date = new Date(form.finitialdate.value)

        //reference, day of the event
        dataNewEvent.event = Date.parse(`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`)

        //Save Event data
        dataNewEvent.title = form.ftitle.value
        dataNewEvent.description = form.fdescription.value
        dataNewEvent.eventType = form.feventtype.value
        dataNewEvent.initialDate = form.finitialdate.value
        dataNewEvent.endDate = form.fenddate.value
        if (form.fremind.value != "") {
            dataNewEvent.remind = form.fremind.value
            dataNewEvent.remindms = Date.parse(form.finitialdate.value) - (form.fremind.value * 60 * 1000)
        } else {
            dataNewEvent.remind = 0
            dataNewEvent.remindms = Date.parse(form.finitialdate.value)
        }
        dataNewEvent.reminded = false


        form.fenddate.disabled = true
        form.fremind.disabled = true
        form.reset()

        //clear errors
        for (let label of document.querySelectorAll(".error")) {
            label.classList.remove("show")
        }

        return true
    }

}