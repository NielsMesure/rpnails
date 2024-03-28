document.addEventListener('DOMContentLoaded', function() {

    const bookingForm = document.getElementById('bookingForm');
    const bookingModal = new bootstrap.Modal(document.getElementById('bookingModal'));
    let selectedServiceDuration;
    let selectedService;
    let selectedServiceName;
    let selectedDate;
    let bookingDate;
    let selectedTime;

    const prestationsButtons = document.querySelectorAll('.prestation-btn');

    prestationsButtons.forEach(button => {
        button.setAttribute('data-original-text', button.textContent);
    });
    prestationsButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Réinitialisez tous les boutons à leur texte original et retirez la classe de sélection
            prestationsButtons.forEach(btn => {
                btn.textContent = btn.getAttribute('data-original-text');
                btn.classList.remove('prestation-selected');
            });

            // Mettez à jour le bouton cliqué pour indiquer "Sélectionné" et ajoutez la classe de sélection
            this.textContent = "Sélectionné";
            this.classList.add('prestation-selected');

            // Mettez à jour les variables et l'affichage comme avant
            selectedServiceDuration = this.dataset.duration;
            selectedService = this.dataset.id;
            selectedServiceName = this.dataset.name;

            const scrollAnchor = document.getElementById('scroll-anchor');
            scrollAnchor.style.marginBottom = '-50vh';
            scrollAnchor.scrollIntoView({ behavior: 'smooth', block: 'center' });

            fillDateContainer(selectedServiceDuration);
        });
    });
    document.querySelectorAll('.prestation-btn').forEach(button => {
        button.addEventListener('click', function() {
            selectedServiceDuration = this.getAttribute('data-duration'); // Stockez la durée de la prestation pour l'utiliser lors du calcul des créneaux disponibles

            // Affichez l'accordéon et le bouton "Voir plus"
            document.getElementById('accordionFlushExample').style.display = '';
            document.getElementById('loadMoreDays').style.display = '';
            selectedServiceName = this.dataset.name;
            selectedService = this.dataset.id;
            fillDateContainer(selectedServiceDuration);
        });

    });



    let daysDisplayed = 0; // Variable globale pour suivre le nombre de jours déjà affichés

    function fillDateContainer(serviceDuration, increment = false) {
        const accordionContainer = document.getElementById('accordionFlushExample');

        // Si increment est false, cela signifie que nous initialisons ou réinitialisons l'accordéon
        if (!increment) {
            accordionContainer.innerHTML = '';
            daysDisplayed = 0;
        }

        let daysToShow = 6; // Nombre de jours à ajouter à chaque appel
        let tempDate = new Date();
        tempDate.setDate(tempDate.getDate() + daysDisplayed); // Démarrez à partir du dernier jour affiché

        for (let i = 0; i < daysToShow; i++) {
            const dayString = tempDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
            const isoDate = tempDate.toISOString().split('T')[0];

            const accordionItem = document.createElement('div');
            accordionItem.className = 'accordion-item';
            accordionItem.innerHTML = `
            <h2 class="accordion-header" id="flush-heading${daysDisplayed}">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapse${daysDisplayed}" aria-expanded="false" aria-controls="flush-collapse${daysDisplayed}">
                    ${dayString}
                </button>
            </h2>
            <div id="flush-collapse${daysDisplayed}" class="accordion-collapse collapse" aria-labelledby="flush-heading${daysDisplayed}" data-bs-parent="#accordionFlushExample">
                <div class="accordion-body">
                    <!-- Les créneaux horaires disponibles seront ajoutés ici par loadAvailableTimeSlots -->
                </div>
            </div>
        `;
            accordionContainer.appendChild(accordionItem);

            loadAvailableTimeSlots(isoDate, serviceDuration, daysDisplayed);
            tempDate.setDate(tempDate.getDate() + 1); // Préparez la date pour le prochain jour
            daysDisplayed++; // Incrémente le compteur de jours affichés
        }
    }

// Modifiez le gestionnaire du bouton "Voir plus" pour appeler fillDateContainer avec increment = true
    document.getElementById('loadMoreDays').addEventListener('click', function() {
        fillDateContainer(selectedServiceDuration, true); // Passer true pour ajouter des jours sans réinitialiser
    });


    function loadAvailableTimeSlots(date, serviceDuration, accordionIndex) {
        Promise.all([
            fetch(`/get-opening-hours/${date}`).then(response => response.json()),
            fetch(`/get-absences/${date}`).then(response => response.json()),
            fetch(`/get-bookings/${date}`).then(response => response.json()) // Nouvelle requête pour les réservations
        ])
            .then(([openingHoursResponse, absencesResponse, bookingsResponse]) => {
                const openingHours = openingHoursResponse.hours;
                const absences = absencesResponse.absences;
                const bookings = bookingsResponse.bookings; // Récupérer les réservations
                const timeSlots = calculateAvailableTimeSlots(openingHours, absences, bookings, date, serviceDuration); // Inclure les réservations dans le calcul

                // Récupérez l'élément container pour les créneaux du jour concerné
                const timeSlotsContainer = document.querySelector(`#flush-collapse${accordionIndex} .accordion-body`);
                timeSlotsContainer.innerHTML = ''; // Nettoyez d'abord le container

                // Affichez chaque créneau disponible
                timeSlots.forEach(slot => {
                    const slotButton = document.createElement('button');
                    slotButton.textContent = slot;
                    slotButton.className = 'time-slot btn m-1';
                    // Ajoutez ici la logique pour réserver le créneau lors du clic sur le bouton
                    slotButton.addEventListener('click', function() {
                        selectedDate = new Date(date + 'T' + slot);
                        bookingDate = date;
                        selectedTime = slot;


                        if (userIsLoggedIn()) {
                            document.getElementById('bookingDateFormated').textContent = new Date(date + 'T' + slot).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            });
                            document.getElementById('bookingTime').textContent = slot;
                            document.getElementById('serviceDuration').textContent = convertDuration(serviceDuration);
                            document.getElementById('serviceName').textContent = selectedServiceName;
                            bookingModal.show();
                        } else {
                            localStorage.setItem('selectedServiceDuration', serviceDuration);
                            localStorage.setItem('selectedServiceName', selectedServiceName);
                            localStorage.setItem('selectedService', selectedService);
                            localStorage.setItem('selectedDateFormated', date);
                            localStorage.setItem('selectedDate', date);
                            localStorage.setItem('selectedTime', slot);
                            window.location.href = `/login?redirect=app_booking`;
                        }
                    });
                    timeSlotsContainer.appendChild(slotButton);
                });

                if(timeSlots.length === 0) {
                    timeSlotsContainer.innerHTML = '<p>Aucun créneau disponible</p>';
                }
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des données:', error);
            });
    }


    function calculateAvailableTimeSlots(openingHours, absences, bookings, selectedDate) {
        /**
         * @property {date} breakStart - Heure de début de la pause de midi
         * @property {date} breakEnd - Heure de fin de la pause de midi
         */

        const timeSlots = [];
        const now = moment();
        const selectedMomentDate = moment(selectedDate, 'YYYY-MM-DD');

        // Récupérer la durée de la prestation depuis le localStorage
        localStorage.setItem('selectedServiceDuration', selectedServiceDuration);
        const serviceDuration = parseInt(localStorage.getItem('selectedServiceDuration'), 10);
        console.log(serviceDuration); // Pour le débogage

        openingHours.forEach(hour => {
            let openTime = moment(`${selectedDate} ${hour.open}`, 'YYYY-MM-DD HH:mm');
            const closeTime = moment(`${selectedDate} ${hour.close}`, 'YYYY-MM-DD HH:mm');
            const breakStart = hour.breakStart ? moment(`${selectedDate} ${hour.breakStart}`, 'YYYY-MM-DD HH:mm') : null;
            const breakEnd = hour.breakEnd ? moment(`${selectedDate} ${hour.breakEnd}`, 'YYYY-MM-DD HH:mm') : null;

            while (openTime.isBefore(closeTime)) {
                let isAvailable = selectedMomentDate.isSameOrAfter(now, 'day') && (!selectedMomentDate.isSame(now, 'day') || now.isBefore(openTime, 'minute'));
                const slotEndTime = moment(openTime).add(serviceDuration, 'minutes');

                // Check break time
                if (breakStart && breakEnd && (openTime.isBefore(breakEnd) && slotEndTime.isAfter(breakStart) || slotEndTime.isAfter(closeTime))) {
                    isAvailable = false;
                }

                // Check absences
                absences.forEach(absence => {
                    const absenceStart = moment(`${selectedDate} ${absence.start}`, 'YYYY-MM-DD HH:mm');
                    const absenceEnd = moment(`${selectedDate} ${absence.end}`, 'YYYY-MM-DD HH:mm');

                    if ((openTime.isSameOrBefore(absenceEnd) && slotEndTime.isSameOrAfter(absenceStart)) || absence.allDay) {
                        isAvailable = false;
                    }
                });

                // Check reservations
                bookings.forEach(booking => {
                    const bookingStart = moment(`${selectedDate} ${booking.start}`, 'YYYY-MM-DD HH:mm');
                    const bookingEnd = moment(`${selectedDate} ${booking.end}`, 'YYYY-MM-DD HH:mm');

                    if (openTime.isSameOrBefore(bookingEnd) && slotEndTime.isSameOrAfter(bookingStart)) {
                        isAvailable = false;
                    }
                });

                if (isAvailable) {
                    timeSlots.push(openTime.format('HH:mm'));
                }

                openTime.add(30, 'minutes');
            }
        });

        return timeSlots;
    }

    if (localStorage.getItem('selectedService') && userIsLoggedIn()) {
        selectedServiceDuration = localStorage.getItem('selectedServiceDuration');
        selectedServiceName = localStorage.getItem('selectedServiceName');
        selectedService = localStorage.getItem('selectedService');
        bookingDate = localStorage.getItem('selectedDate');
        selectedDate = localStorage.getItem('selectedDateFormated');
        selectedTime = localStorage.getItem('selectedTime');

        // Clear les données enregistrées
        localStorage.removeItem('selectedServiceDuration');
        localStorage.removeItem('selectedServiceName');
        localStorage.removeItem('selectedService');
        localStorage.removeItem('selectedDate');
        localStorage.removeItem('selectedDateFormated');
        localStorage.removeItem('selectedTime');

        // Logique d'ouverture de la fenêtre modale avec la sélection récupérée
        bookingModal.show();
        console.log(selectedDate);
        document.getElementById('bookingDateFormated').textContent = new Date(selectedDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
        document.getElementById('bookingTime').textContent = selectedTime;
        document.getElementById('serviceDuration').textContent = convertDuration(selectedServiceDuration);
        document.getElementById('serviceName').textContent = selectedServiceName;
    }
    function convertDuration(durationInMinutes) {
        const hours = Math.floor(durationInMinutes / 60);
        const minutes = durationInMinutes % 60;
        return `${hours} heure(s) et ${minutes} minute(s)`;
    }

    function userIsLoggedIn() {
        return App.user.isLoggedIn && App.user.isUser;
    }

    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const formData = new FormData();
        formData.append('prestationId', selectedService);
        formData.append('date', bookingDate);
        formData.append('startTime', selectedTime);
        formData.append('customerName', document.getElementById('customerName').value);
        formData.append('customerSurname', document.getElementById('customerSurname').value);
        formData.append('customerPhone', document.getElementById('customerPhone').value);
        formData.append('customerEmail', document.getElementById('customerEmail').value);

        fetch('add/booking', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                console.log('Réservation réussie', data);
                window.location.href = '/monCompte';
            })
            .catch(error => {
                console.error('Erreur lors de l’envoi de la réservation', error);
            });
    });

});

