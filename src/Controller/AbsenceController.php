<?php

namespace App\Controller;

use App\Entity\Absence;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class AbsenceController extends AbstractController
{
    #[Route('/add-absence', name: 'add_absence')]

    public function addAbsence(Request $request, EntityManagerInterface $entityManager): JsonResponse {
        $data = json_decode($request->getContent(), true);

        $absence = new Absence();
        $absence->setDate(new \DateTime($data['date']));
        $absence->setFullDay($data['allDay']);

        if (!$data['allDay']) {
            // Assurez-vous que les heures sont correctement converties
            $startTime = \DateTime::createFromFormat('H:i', $data['startTime']);
            $endTime = \DateTime::createFromFormat('H:i', $data['endTime']);

            if ($startTime && $endTime) {
                $absence->setStartTime($startTime);
                $absence->setEndTime($endTime);
            }
        }

        $entityManager->persist($absence);
        $entityManager->flush();

        return new JsonResponse(['status' => 'success']);
    }
}
