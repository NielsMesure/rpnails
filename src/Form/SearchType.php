<?php

namespace App\Form;


use App\Classe\Search;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class SearchType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('string',TextType::class,[
                'label'=>false,
                'required' => false,
                'attr'=>[
                    'class'=>'research-field',
                    'placeholder'=>'Rechercher'
                ]

            ])
            ->add('submit', SubmitType::class,[
                'label'=>'Rechercher',
                'attr'=>[
                    'class'=>'custom-submit , mt-0',
                ]

            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Search::class,
            'method' => 'GET',
            'crsf_protection' => false,
        ]);
    }

    public function getBlockPrefix()
    {
        return '';
    }
}