<?php

namespace App\Controller;

use App\Entity\Absence;
use Doctrine\ORM\EntityManagerInterface;
use Exception;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class AbsenceController extends AbstractController
{
    /**
     * @throws Exception
     */
    #[Route('/add-absence', name: 'add_absence')]

    public function addAbsence(Request $request, EntityManagerInterface $entityManager): JsonResponse {
        $data = json_decode($request->getContent(), true);

        $date = new \DateTime($data['date']);
        $allDay = $data['allDay'];
        $startTime = $allDay ? null : \DateTime::createFromFormat('H:i', $data['startTime']);
        $endTime = $allDay ? null : \DateTime::createFromFormat('H:i', $data['endTime']);
        $absenceRepository = $entityManager->getRepository(Absence::class);
        $existingAbsence = $absenceRepository->findOneBy([
            'date' => $date,
            'startTime' => $startTime,
            'endTime' => $endTime
        ]);

        if ($existingAbsence) {
            return new JsonResponse(['status' => 'error', 'message' => 'Une absence est déjà planifiée pour cette date.'], Response::HTTP_CONFLICT);
        }

        $absence = new Absence();
        $absence->setDate($date);
        $absence->setFullDay($allDay);

        if (!$allDay) {
            if ($startTime && $endTime) {
                $absence->setStartTime($startTime);
                $absence->setEndTime($endTime);
            }
        }

        $entityManager->persist($absence);
        $entityManager->flush();

        return new JsonResponse(['status' => 'success', 'id' => $absence->getId()]);
    }


    #[Route('/get-absences', name: 'get-absences')]
    public function getAbsences(EntityManagerInterface $entityManager): JsonResponse {
        $absences = $entityManager->getRepository(Absence::class)->findAll();

        $events = array_map(function ($absence) {
            $event = [
                'id' => $absence->getId(),
                'title' => 'Absent',
                'start' => $absence->getDate()->format('Y-m-d'),
                'allDay' => $absence->isFullDay(),
                'color' => 'grey',
            ];

            if (!$absence->isFullDay()) {
                $startDateTime = $absence->getDate()->format('Y-m-d') . ' ' . $absence->getStartTime()->format('H:i:s');
                $endDateTime = $absence->getDate()->format('Y-m-d') . ' ' . $absence->getEndTime()->format('H:i:s');
                $event['start'] = $startDateTime;
                $event['end'] = $endDateTime;
            }

            return $event;
        }, $absences);

        return new JsonResponse($events);
    }

    #[Route('/delete-absence/{id}', name: 'delete_absence', methods: ['DELETE'])]
    public function deleteAbsence(int $id, EntityManagerInterface $entityManager): JsonResponse {
        $absence = $entityManager->getRepository(Absence::class)->find($id);

        if ($absence) {
            $entityManager->remove($absence);
            $entityManager->flush();

            return new JsonResponse(['status' => 'success']);
        }

        return new JsonResponse(['status' => 'error', 'message' => 'Absence not found'], 404);
    }

}
