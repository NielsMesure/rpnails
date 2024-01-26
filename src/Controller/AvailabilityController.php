<?php

namespace App\Controller;


use App\Entity\BusinessHours;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;

class AvailabilityController extends AbstractController
{
    #[Route('/admin/ajouthoraires', name: 'app_availability')]
    public function enregistrerHoraires(Request $request, EntityManagerInterface $entityManager): JsonResponse {
        $entityManager->createQuery('DELETE FROM App\Entity\BusinessHours')->execute();


        $data = $request->request->all('days');

        foreach ($data as $day => $info) {
            $businessHour = new BusinessHours();
            $businessHour->setDay($day);
            $businessHour->setIsActive(isset($info['isActive']) && $info['isActive'] == '1');

            if (isset($info['startTime'])) {
                $businessHour->setStartTime(new \DateTime($info['startTime']));
            }

            if (isset($info['endTime'])) {
                $businessHour->setEndTime(new \DateTime($info['endTime']));
            }

            $entityManager->persist($businessHour);
        }

        $entityManager->flush();
        return new JsonResponse(['status' => 'success']);
    }

    #[Route('/admin/api/get-business-hours', name: 'api_get_business_hours')]
    public function getBusinessHours(EntityManagerInterface $entityManager, SerializerInterface $serializer): JsonResponse {
        $businessHoursRepo = $entityManager->getRepository(BusinessHours::class);
        $businessHoursEntities = $businessHoursRepo->findAll();


        $formattedBusinessHours = [];
        foreach ($businessHoursEntities as $entity) {
            if (!$entity->isIsActive()) {
                $dayNumeric = $this->convertDayToNumeric($entity->getDay()); // Implémentez cette fonction selon votre besoin
                $formattedBusinessHours[] = [
                    'daysOfWeek' => [$dayNumeric],
                    'startTime' => $entity->getStartTime()->format('H:i'),
                    'endTime' => $entity->getEndTime()->format('H:i'),
                ];
            }

        }

        return new JsonResponse($formattedBusinessHours);
    }

    private function convertDayToNumeric($dayString) {
        $days = ['sunday' => 0, 'monday' => 1, 'tuesday' => 2, 'wednesday' => 3, 'thursday' => 4 , 'friday' => 5,'saturday' => 6];
        return $days[strtolower($dayString)] ?? null;
    }

}
