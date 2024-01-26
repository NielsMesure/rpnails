import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import timeGridPlugin from '@fullcalendar/timegrid'

document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');

    fetch('/admin/api/get-business-hours')
        .then(response => response.json())
        .then(function(businessHoursData) {
    var calendar = new Calendar(calendarEl, {
        themeSystem: 'bootstrap5',
        plugins: [ dayGridPlugin , interactionPlugin, bootstrap5Plugin,timeGridPlugin ],
        dateClick: function(info) {
            handleDateClick(info.dateStr); // Gère le clic sur une date
        },
        events: '/get-disponibilites',
        headerToolbar: {

            center: 'title',
            left: 'dayGridMonth,timeGridWeek,timeGridDay' // user can switch between the two
        },
        businessHours: fetch('/admin/api/get-business-hours')
            .then(response => response.json())
            .then(function(businessHours) {
                calendar.setOption('businessHours', businessHours);
                calendar.refetchEvents();
            }),


    });


    calendar.render();
        })
        .catch(function(error) {
            console.error('Error:', error);
        });
});

function handleDateClick(date) {
    var startTime = prompt("Heure de début (HH:MM)", "14:30");
    var endTime = prompt("Heure de fin (HH:MM)", "19:00");

    if (startTime && endTime) {
        sendDisponibiliteData(date, startTime, endTime);
    }
}

function sendDisponibiliteData(date, startTime, endTime) {
    fetch('/add-disponibilite', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date: date, startTime: startTime, endTime: endTime })
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    calendar.addEvent({
        title: `Dispo: ${startTime} - ${endTime}`,
        start: `${date}T${startTime}`,
        end: `${date}T${endTime}`,
        color: '#28a745' // Choisissez la couleur que vous voulez
    });
}
