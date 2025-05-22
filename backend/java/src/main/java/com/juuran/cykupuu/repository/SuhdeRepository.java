package com.juuran.cykupuu.repository;

import com.juuran.cykupuu.model.Suhde;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Set;

public interface SuhdeRepository extends JpaRepository<Suhde, Long> {

    Set<Suhde> findAllByOnkoNaimisissa(Boolean onkoNaimisissa);

}
