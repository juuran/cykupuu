package com.juuran.cykupuu.repository;

import com.juuran.cykupuu.model.Henkilo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HenkiloRepository extends JpaRepository<Henkilo, Long> {

    List<Henkilo> findBySukunimet(String sukunimet);

}

