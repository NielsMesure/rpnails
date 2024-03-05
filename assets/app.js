import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import timeGridPlugin from '@fullcalendar/timegrid';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.css';


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
                    console.log('Absences:', absences); // Pour le débogage
                    absences.forEach(absence => {
                        // Extraire uniquement la partie date
                        const datePart = absence.start.split(' ')[0];
                        absencesMap[datePart] = absence.id;
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
                start: 'prev,next today', // Boutons sur le côté gauche
                center: 'title', // Titre au centre
                end: 'dayGridMonth,timeGridWeek,timeGridDay'
            },

            businessHours: businessHoursData,
            dateClick: function(info) {
                const dateStr = info.dateStr;
                const absenceId = absencesMap[dateStr];
                console.log('Date cliquée:', dateStr, 'ID d\'absence:', absenceId); // Pour le débogage
                if (absenceId) {
                    selectedAbsenceId = absenceId;
                    deleteButton.style.display = 'block';  // Afficher le bouton
                } else {
                    deleteButton.style.display = 'none';  // Cacher le bouton s'il n'y a pas d'absence
                }

                absenceOffCanvas.show();
                document.getElementById('absenceDate').value = dateStr;
            },
            events: '/get-absences',
            eventClick: function(info) {
                // Exemple de récupération des détails de l'événement
                var eventStart = info.event.start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                var eventEnd = info.event.end ? info.event.end.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 'Non spécifié';

                // Mise à jour du contenu de la modale
                document.getElementById('absenceDetail').innerHTML = `Début: ${eventStart}<br>Fin: ${eventEnd}`;

                // Affichage de la modale
                var modal = new bootstrap.Modal(document.getElementById('absenceDetailModal'));
                modal.show();
            }
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
                        // Trouvez la clé correspondant à l'ID dans absencesMap
                        const dateKey = Object.keys(absencesMap).find(key => absencesMap[key] === selectedAbsenceId);
                        if (dateKey) {
                            delete absencesMap[dateKey]; // Supprimez l'entrée de la map
                        }

                        absenceOffCanvas.hide();
                        calendar.refetchEvents(); // Rafraîchir les événements du calendrier
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
                if (data.status === 'error') {
                    alert(data.message); // Affiche un message d'erreur
                } else {
                    // Mettre à jour absencesMap avec la nouvelle absence
                    const datePart = formData.get('date');
                    absencesMap[datePart] = data.id;

                    absenceOffCanvas.hide();
                    calendar.refetchEvents(); // Rafraîchir les événements du calendrier
                }
            })
            .catch(error => {
                console.error('Erreur:', error);
            });
    });
});