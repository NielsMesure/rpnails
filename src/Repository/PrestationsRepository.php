<?php

namespace App\Repository;

use App\Entity\Prestations;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Prestations>
 *
 * @method Prestations|null find($id, $lockMode = null, $lockVersion = null)
 * @method Prestations|null findOneBy(array $criteria, array $orderBy = null)
 * @method Prestations[]    findAll()
 * @method Prestations[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class PrestationsRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Prestations::class);
    }

//    /**
//     * @return Prestations[] Returns an array of Prestations objects
//     */
//    public function findByExampleField($value): array
//    {
//        return $this->createQueryBuilder('p')
//            ->andWhere('p.exampleField = :val')
//            ->setParameter('val', $value)
//            ->orderBy('p.id', 'ASC')
//            ->setMaxResults(10)
//            ->getQuery()
//            ->getResult()
//        ;
//    }

//    public function findOneBySomeField($value): ?Prestations
//    {
//        return $this->createQueryBuilder('p')
//            ->andWhere('p.exampleField = :val')
//            ->setParameter('val', $value)
//            ->getQuery()
//            ->getOneOrNullResult()
//        ;
//    }
}
