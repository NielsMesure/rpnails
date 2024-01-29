import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import timeGridPlugin from '@fullcalendar/timegrid';
import 'bootstrap';



document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');
    var absenceOffCanvas = new bootstrap.Offcanvas(document.getElementById('absenceOffCanvas'));
    var calendar;
    fetch('/admin/api/get-business-hours')
        .then(response => response.json())
        .then(function(businessHoursData) {
            calendar = new Calendar(calendarEl, {
                contentHeight: 'auto',
                selectable: true,
                selectMirror: true,
                slotMinTime: '08:00:00', // Heure de début à 8h
                slotMaxTime: '20:30:00', // Heure de fin à 20h30
                themeSystem: 'bootstrap5',
                plugins: [dayGridPlugin, interactionPlugin, bootstrap5Plugin, timeGridPlugin],
                headerToolbar: {
                    center: 'title',
                    left: 'dayGridMonth,timeGridWeek,timeGridDay'
                },
                businessHours: businessHoursData,
                dateClick: function(info) {
                    // Ouvrir l'OffCanvas
                    absenceOffCanvas.show();

                    // Pré-remplir le champ de date dans l'OffCanvas
                    document.getElementById('absenceDate').value = info.dateStr;
                },
            });

            calendar.render();
        })
        .catch(function(error) {
            console.error('Error:', error);
        });

    document.getElementById('absenceForm').addEventListener('submit', function(e) {
        e.preventDefault();

        var formData = new FormData(this); // 'this' fait référence à l'élément form

        // Assurez-vous que les champs 'date', 'startTime', 'endTime' et 'allDay' existent dans votre formulaire
        var data = {
            date: formData.get('date'), // Récupère la valeur du champ 'date'
            startTime: formData.get('startTime'), // Récupère la valeur du champ 'startTime'
            endTime: formData.get('endTime'), // Récupère la valeur du champ 'endTime'
            allDay: formData.get('allDay') === 'on' // Récupère la valeur du champ 'allDay'
        };

        fetch('/add-absence', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(data => {
                absenceOffCanvas.hide();
                calendar.refetchEvents();
            })
            .catch(error => {
                console.error('Erreur:', error);
            });
    });
});



