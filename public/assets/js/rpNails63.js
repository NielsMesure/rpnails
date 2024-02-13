document.addEventListener('DOMContentLoaded', function() {
    const dateContainer = document.getElementById('dateContainer');
    const availableTimesContainer = document.getElementById('availableTimes');
    const prevWeek = document.getElementById('prevWeek');
    const nextWeek = document.getElementById('nextWeek');

    let currentDate = new Date();

    document.querySelectorAll('.prestation-btn').forEach(button => {
        button.addEventListener('click', function() {
            const duration = this.dataset.duration;
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
                const timeSlots = calculateAvailableTimeSlots(openingHours, absences);
                renderTimeSlots(timeSlots, date);
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des données:', error);
            });
    }

    function calculateAvailableTimeSlots(openingHours, absences) {
        const timeSlots = [];
        openingHours.forEach(hour => {
            const openTime = moment(hour.open, 'HH:mm');
            const closeTime = moment(hour.close, 'HH:mm');

            while (openTime.isBefore(closeTime)) {
                const slotStart = moment(openTime);
                const slotEnd = moment(openTime).add(30, 'minutes');
                let isAvailable = true;

                absences.forEach(absence => {
                    const absenceStart = moment(absence.start, 'HH:mm');
                    const absenceEnd = moment(absence.end, 'HH:mm');

                    if (absence.allDay || (slotStart.isBefore(absenceEnd) && slotEnd.isAfter(absenceStart))) {
                        isAvailable = false;
                    }
                });

                if (isAvailable) {
                    timeSlots.push(slotStart.format('HH:mm'));
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
                timeSlotButton.dataset.datetime = `${date} ${slot}`;
                timeSlotButton.addEventListener('click', function() {
                    console.log(`Créneau sélectionné : ${this.dataset.datetime}`);
                    // Ajoutez ici votre logique de réservation
                });
                availableTimesContainer.appendChild(timeSlotButton);
            });
        }
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
});