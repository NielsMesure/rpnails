<?php

namespace App\Command;

use App\Repository\AbsenceRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;



// Quand le site sera en ligne inserer cette commande dans Cron 0 0 * * * /chemin/vers/ton/php /chemin/vers/ton/projet/bin/console app:cleanup-absences
class CleanUpAbsencesCommand extends Command
{
    protected static $defaultName = 'app:cleanup-absences';

    private AbsenceRepository $absenceRepository;
    private EntityManagerInterface $entityManager;

    public function __construct(AbsenceRepository $absenceRepository, EntityManagerInterface $entityManager)
    {
        parent::__construct();
        $this->absenceRepository = $absenceRepository;
        $this->entityManager = $entityManager;
    }

    protected function configure()
    {
        $this->setDescription('Supprime les absences passées.');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $dateToday = new \DateTime();
        $absences = $this->absenceRepository->findAbsencesBeforeDate($dateToday);

        foreach ($absences as $absence) {
            $this->entityManager->remove($absence);
        }

        $this->entityManager->flush();

        $output->writeln('Les absences passées ont été supprimées.');

        return Command::SUCCESS;
    }
}
