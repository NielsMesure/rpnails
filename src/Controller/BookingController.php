<?php

namespace App\Controller;

use App\Entity\Booking;
use App\Entity\Prestations;
use App\Repository\AbsenceRepository;
use App\Repository\BookingRepository;
use App\Repository\BusinessHoursRepository;
use App\Repository\PrestationsRepository;
use DateTime;
use Doctrine\ORM\EntityManagerInterface;
use Exception;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class BookingController extends AbstractController
{

    /**
     * @throws Exception
     */
    #[Route('add/booking', name: 'booking_create')]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse {
        $user = $this->getUser(); // Assurez-vous que l'utilisateur est connecté
        $prestationRepository = $em->getRepository(Prestations::class);

        $prestationId = $request->request->get('prestationId');
        $prestation = $prestationRepository->find($prestationId);

        if (!$prestation) {
            return new JsonResponse(['error' => 'Prestation not found'], Response::HTTP_BAD_REQUEST);
        }

        $startTime = new \DateTime($request->request->get('startTime'));
        $duration = $prestation->getDuration();
        $endTime = (clone $startTime)->modify("+{$duration} minutes");

        $booking = new Booking();
        $booking->setUser($user);
        $booking->setPrestation($prestation);
        $booking->setDate(new \DateTime($request->request->get('date')));
        $booking->setStartTime(new \DateTime($request->request->get('startTime')));
        $booking->setEndTime($endTime);
        $booking->setCustomerFirstName($request->request->get('customerName'));
        $booking->setCustomerLastName($request->request->get('customerSurname'));
        $booking->setCustomerMobilePhone($request->request->get('customerPhone'));
        $booking->setCustomerEmail($request->request->get('customerEmail'));

        $em->persist($booking);
        $em->flush();

        // Répondez avec succès ou toute autre logique nécessaire
        return new JsonResponse(['success' => 'Booking created successfully']);
    }



    #[Route('/reserver', name: 'app_booking')]
    public function index(PrestationsRepository $prestationsRepository): Response
    {
        $prestations = $prestationsRepository->findAll();

        return $this->render('booking/index.html.twig', [
            'prestations' => $prestations,
        ]);
    }
    // src/Controller/ReservationController.php


    /**
     * @throws Exception
     */
    #[Route('/get-opening-hours/{date}', name: 'get_opening_hours')]
    public function getOpeningHours($date, BusinessHoursRepository $businessHoursRepository): JsonResponse {

        $dateTime = new \DateTime($date);
        $dayOfWeek = $dateTime->format('l'); // 'l' pour obtenir le nom complet du jour en anglais


        $businessHours = $businessHoursRepository->findBy([
            'day' => $dayOfWeek,
            'isActive' => false
        ]);

        $hours = [];
        foreach ($businessHours as $businessHour) {
            // Assurez-vous que votre méthode findForDate renvoie quelque chose que vous pouvez itérer
            $hours[] = [
                'open' => $businessHour->getStartTime()->format('H:i'),
                'close' => $businessHour->getEndTime()->format('H:i'),
                'breakStart' => $businessHour->getBreakStartTime() ->format('H:i'),
                'breakEnd' => $businessHour->getBreakEndTime() ->format('H:i'),
            ];
        }



        return new JsonResponse([
            'hours' => $hours,
        ]);
    }


    /**
     * @throws Exception
     */
    #[Route('/get-absences/{date}', name: 'get_absences')]
    public function getAbsencesByDate($date, BusinessHoursRepository $businessHoursRepository,AbsenceRepository $absenceRepository): JsonResponse {

        $dateObject = new \DateTime($date);
        $absences = $absenceRepository->findBy(['date' => $dateObject]);


        $absenceTimes = [];
        foreach ($absences as $absence) {
            $absenceTimes[] = [
                'start' => $absence->getStartTime() ? $absence->getStartTime()->format('H:i') : null,
                'end' => $absence->getEndTime() ? $absence->getEndTime()->format('H:i') : null,
                'allDay' => $absence->isFullDay(),
            ];
        }

        return new JsonResponse([

            'absences' => $absenceTimes,
        ]);
    }

    #[Route('/get-bookings/{date}', name: 'get_bookings')]
    public function getBookingsForDate(\DateTime $date, BookingRepository $bookingRepository): JsonResponse {
        $bookings = $bookingRepository->findByDate($date);

        $bookingsData = [];
        foreach ($bookings as $booking) {
            $bookingsData[] = [
                'start' => $booking->getStartTime()->format('H:i'),
                'end' => $booking->getEndTime()->format('H:i'),
            ];
        }

        return new JsonResponse(['bookings' => $bookingsData]);
    }




}
