import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import timeGridPlugin from '@fullcalendar/timegrid';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap';

document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');
    var absenceOffCanvas = new bootstrap.Offcanvas(document.getElementById('absenceOffCanvas'));
    var deleteButton = document.getElementById('deleteAbsenceButton');
    var selectedAbsenceId;
    var absencesMap = {};
    var calendar;

    // Récupérer les heures d'ouverture
    fetch('/admin/api/get-business-hours')
        .then(response => response.json())
        .then(function(businessHoursData) {
            // Récupérer les absences
            fetch('/get-absences')
                .then(response => response.json())
                .then(absences => {
                    absences.forEach(absence => {
                        absencesMap[absence.start] = absence.id; // Stocker l'ID de l'absence
                    });
                    initializeCalendar(businessHoursData);
                })
                .catch(error => console.error('Erreur lors de la récupération des absences:', error));
        })
        .catch(function(error) {
            console.error('Error:', error);
        });

    function initializeCalendar(businessHoursData) {
        calendar = new Calendar(calendarEl, {
            contentHeight: 'auto',
            selectable: true,
            selectMirror: true,
            slotMinTime: '08:00:00',
            slotMaxTime: '20:30:00',
            themeSystem: 'bootstrap5',
            plugins: [dayGridPlugin, interactionPlugin, bootstrap5Plugin, timeGridPlugin],
            headerToolbar: {
                center: 'title',
                left: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            businessHours: businessHoursData,
            dateClick: function(info) {
                const dateStr = info.dateStr;
                const absenceId = absencesMap[dateStr];

                if (absenceId) {
                    selectedAbsenceId = absenceId;
                    deleteButton.style.display = 'block';
                } else {
                    deleteButton.style.display = 'none';
                }

                absenceOffCanvas.show();
                document.getElementById('absenceDate').value = dateStr;
            },
            events: '/get-absences',
        });

        calendar.render();
    }

    deleteButton.addEventListener('click', function() {
        if (selectedAbsenceId) {
            fetch(`/delete-absence/${selectedAbsenceId}`, {
                method: 'DELETE'
            })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        delete absencesMap[selectedAbsenceId]; // Supprimer l'absence de l'objet
                        absenceOffCanvas.hide();
                        calendar.refetchEvents();
                    }
                })
                .catch(error => console.error('Erreur:', error));
        }
    });

    document.getElementById('absenceForm').addEventListener('submit', function(e) {
        e.preventDefault();

        var formData = new FormData(this);
        var startHour = formData.get('startHour');
        var startMinute = formData.get('startMinute');
        var endHour = formData.get('endHour');
        var endMinute = formData.get('endMinute');

        var data = {
            date: formData.get('date'),
            allDay: formData.get('allDay') === 'on',
            startTime: `${startHour}:${startMinute}`,
            endTime: `${endHour}:${endMinute}`
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