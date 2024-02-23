document.addEventListener('DOMContentLoaded', function() {
    const dateContainer = document.getElementById('dateContainer');
    const prevWeek = document.getElementById('prevWeek');
    const nextWeek = document.getElementById('nextWeek');
    const bookingForm = document.getElementById('bookingForm');
    const bookingModal = new bootstrap.Modal(document.getElementById('bookingModal'));
    let selectedServiceDuration;
    let selectedService;
    let selectedServiceName;
    let selectedDate;
    let bookingDate;
    let selectedTime;
    let currentDate = new Date();

    document.querySelectorAll('.prestation-btn').forEach(button => {
        button.addEventListener('click', function() {
            selectedServiceDuration = this.dataset.duration;
            selectedServiceName = this.dataset.name;
            selectedService = this.dataset.id;

            // Stockez la durée ou l'ID de la prestation selon le besoin
            // Affichez les sélecteurs de date et les créneaux
            document.getElementById('dateSelector').style.display = 'flex';
            // Peut-être initialiser le calendrier ici ou faire d'autres actions
        });
    });

    function fillDateContainer() {
        dateContainer.innerHTML = '';
        let tempDate = new Date(currentDate);

        for (let i = 0; i < 5; i++) {
            let dayDiv = document.createElement('div');
            dayDiv.textContent = `${tempDate.getDate()}/${tempDate.getMonth() + 1}`;
            dayDiv.dataset.date = tempDate.toISOString().split('T')[0];
            dayDiv.className = 'day-slot btn m-1';
            dayDiv.addEventListener('click', function() {
                fetchOpeningHoursAndAbsences(this.dataset.date);
            });
            dateContainer.appendChild(dayDiv);
            tempDate.setDate(tempDate.getDate() + 1);
        }
        prevWeek.disabled = currentDate <= new Date();

        let thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        // Désactiver le bouton "nextWeek" si currentDate dépasse thirtyDaysFromNow
        nextWeek.disabled = currentDate > thirtyDaysFromNow;

    }



    function fetchOpeningHoursAndAbsences(date) {
        Promise.all([
            fetch(`/get-opening-hours/${date}`).then(response => response.json()),
            fetch(`/get-absences/${date}`).then(response => response.json())
        ])
            .then(([openingHoursResponse, absencesResponse]) => {
                const openingHours = openingHoursResponse.hours;
                const absences = absencesResponse.absences;
                const timeSlots = calculateAvailableTimeSlots(openingHours, absences, date); // Passez la date sélectionnée ici
                renderTimeSlots(timeSlots, date);
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des données:', error);
            });
    }

    function calculateAvailableTimeSlots(openingHours, absences, selectedDate) {
        const timeSlots = [];
        const now = moment();
        const selectedMomentDate = moment(selectedDate, 'YYYY-MM-DD');

        openingHours.forEach(hour => {
            let openTime = moment(`${selectedDate} ${hour.open}`, 'YYYY-MM-DD HH:mm');
            const closeTime = moment(`${selectedDate} ${hour.close}`, 'YYYY-MM-DD HH:mm');

            while (openTime.isBefore(closeTime)) {
                let isAvailable = selectedMomentDate.isSameOrAfter(now, 'day') && (!selectedMomentDate.isSame(now, 'day') || now.isBefore(openTime, 'minute'));

                if (isAvailable) {
                    absences.forEach(absence => {
                        const absenceStart = absence.start ? moment(`${selectedDate} ${absence.start}`, 'YYYY-MM-DD HH:mm') : null;
                        const absenceEnd = absence.end ? moment(`${selectedDate} ${absence.end}`, 'YYYY-MM-DD HH:mm') : null;
                        if (absence.allDay || (absenceStart && absenceEnd && (openTime.isBetween(absenceStart, absenceEnd) || openTime.isSame(absenceStart)))) {
                            isAvailable = false;
                        }
                    });
                }

                if (isAvailable) {
                    timeSlots.push(openTime.format('HH:mm'));
                }

                openTime.add(30, 'minutes');
            }
        });

        return timeSlots;

    }





    function renderTimeSlots(timeSlots, date) {
        const availableTimesContainer = document.getElementById('availableTimes');
        availableTimesContainer.innerHTML = '';

        if (timeSlots.length === 0) {
            availableTimesContainer.innerHTML = '<p>Aucunes disponibilités pour ce jour</p>';
        } else {
            timeSlots.forEach(slot => {
                const timeSlotButton = document.createElement('button');
                timeSlotButton.className = 'time-slot btn btn-primary m-1';
                timeSlotButton.textContent = slot;

                timeSlotButton.addEventListener('click', function() {
                    selectedDate = new Date(date + 'T' + slot);
                    bookingDate = date;
                    selectedTime = slot;
                    if (userIsLoggedIn()) {
                        const durationInHoursAndMinutes = convertDuration(selectedServiceDuration);
                        // Afficher la modale avec les informations préremplies
                        const formattedDate = selectedDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

                        document.getElementById('bookingDate').textContent = selectedDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
                        document.getElementById('bookingTime').textContent = selectedTime;
                        document.getElementById('serviceDuration').textContent = durationInHoursAndMinutes;
                        document.getElementById('serviceName').textContent = selectedServiceName;
                        bookingModal.show();
                    } else {
                        // Redirigez vers la page de connexion si l'utilisateur n'est pas connecté
                        window.location.href = '/login';
                    }
                });
                availableTimesContainer.appendChild(timeSlotButton);
            });
        }
    }

    function convertDuration(durationInMinutes) {
        const hours = Math.floor(durationInMinutes / 60);
        const minutes = durationInMinutes % 60;
        return `${hours} heure(s) et ${minutes} minute(s)`;
    }



    function userIsLoggedIn() {
        return document.cookie.split('; ').some((item) => item.trim().startsWith('isLoggedIn=true'));
    }

    prevWeek.addEventListener('click', function() {
        currentDate.setDate(currentDate.getDate() - 7);
        fillDateContainer();
    });

    nextWeek.addEventListener('click', function() {
        currentDate.setDate(currentDate.getDate() + 7);
        fillDateContainer();
    });

    fillDateContainer();




    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const formData = new FormData();
        formData.append('prestationId', selectedService); // Assurez-vous d'avoir l'ID de la prestation
        formData.append('date', bookingDate);
        formData.append('startTime', selectedTime);
        // Calculez et ajoutez 'endTime' basé sur 'startTime' et 'serviceDuration'
        formData.append('customerName', document.getElementById('customerName').value);
        formData.append('customerSurname', document.getElementById('customerSurname').value);
        formData.append('customerPhone', document.getElementById('customerPhone').value);
        formData.append('customerEmail', document.getElementById('customerEmail').value);

        // Envoyez la requête
        fetch('add/booking', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                // Gérez la réponse de succès ici, par exemple, affichez un message de confirmation
                console.log('Réservation réussie', data);
            })
            .catch(error => {
                console.error('Erreur lors de l’envoi de la réservation', error);
            });
    });

});