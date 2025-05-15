package com.juuran.cykupuu.model;

import org.springframework.data.jpa.repository.JpaRepository;

public interface HenkiloRepository extends JpaRepository<Henkilo, Long> {

    Henkilo findByEtunimetAndSukunimet(String etunimet, String sukunimet);

}
