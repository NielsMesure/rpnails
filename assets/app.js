import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import timeGridPlugin from '@fullcalendar/timegrid'

var calendar;
document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');

    fetch('/admin/api/get-business-hours')
        .then(response => response.json())
        .then(function(businessHoursData) {
     calendar = new Calendar(calendarEl, {
         contentHeight: 'auto',

        // Définit l'heure de début pour toutes les vues
        slotMinTime: '08:00:00', // Heure de début à 8h
        // Définit l'heure de fin pour toutes les vues
        slotMaxTime: '20:30:00', // Heure de fin à 20h30
        themeSystem: 'bootstrap5',
        plugins: [ dayGridPlugin , interactionPlugin, bootstrap5Plugin,timeGridPlugin ],
        dateClick: function(info) {
            handleDateClick(info.dateStr); // Gère le clic sur une date
        },
        events: '/get-disponibilites',
        headerToolbar: {

            center: 'title',
            left: 'dayGridMonth,timeGridWeek,timeGridDay'
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
