<?php

namespace App\Repository;

use App\Entity\Absence;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Absence>
 *
 * @method Absence|null find($id, $lockMode = null, $lockVersion = null)
 * @method Absence|null findOneBy(array $criteria, array $orderBy = null)
 * @method Absence[]    findAll()
 * @method Absence[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class AbsenceRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Absence::class);
    }

    public function findAbsencesBeforeDate(\DateTime $date)
    {
        return $this->createQueryBuilder('a')
            ->where('a.date < :date')
            ->setParameter('date', $date)
            ->getQuery()
            ->getResult();
    }


    public function findAbsenceForTimeRange(\DateTime $date, ?\DateTime $startTime, ?\DateTime $endTime, bool $allDay): ?Absence {
        $qb = $this->createQueryBuilder('a')
            ->where('a.date = :date')
            ->setParameter('date', $date);

        if ($allDay) {
            $qb->andWhere('a.allDay = true');
        } else {
            $qb->andWhere('a.startTime <= :endTime AND a.endTime >= :startTime')
                ->setParameter('startTime', $startTime)
                ->setParameter('endTime', $endTime);
        }

        return $qb->getQuery()->getOneOrNullResult();
    }

//    /**
//     * @return Absence[] Returns an array of Absence objects
//     */
//    public function findByExampleField($value): array
//    {
//        return $this->createQueryBuilder('a')
//            ->andWhere('a.exampleField = :val')
//            ->setParameter('val', $value)
//            ->orderBy('a.id', 'ASC')
//            ->setMaxResults(10)
//            ->getQuery()
//            ->getResult()
//        ;
//    }

//    public function findOneBySomeField($value): ?Absence
//    {
//        return $this->createQueryBuilder('a')
//            ->andWhere('a.exampleField = :val')
//            ->setParameter('val', $value)
//            ->getQuery()
//            ->getOneOrNullResult()
//        ;
//    }
}
