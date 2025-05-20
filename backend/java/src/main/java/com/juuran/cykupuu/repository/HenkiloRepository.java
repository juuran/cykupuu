package com.juuran.cykupuu.repository;

import com.juuran.cykupuu.model.Henkilo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HenkiloRepository extends JpaRepository<Henkilo, Long> {

    Henkilo findByEtunimetAndSukunimet(String etunimet, String sukunimet);

}

