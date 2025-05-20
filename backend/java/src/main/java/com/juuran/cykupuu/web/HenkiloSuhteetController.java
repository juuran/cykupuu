package com.juuran.cykupuu.web;

import com.juuran.cykupuu.model.Henkilo;
import com.juuran.cykupuu.repository.HenkiloRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class HenkiloSuhteetController {

    private static final Logger log = LoggerFactory.getLogger(HenkiloSuhteetController.class);

    private HenkiloRepository henkiloRepository;

    public HenkiloSuhteetController(HenkiloRepository repo) {
        this.henkiloRepository = repo;
    }

    @GetMapping("/henkilot")
    public List<Henkilo> getAllHenkiloData() {
        return henkiloRepository.findAll();
    }

    @GetMapping("/henkilo")
    public Henkilo getHenkiloByEtunimetAndSukunimet(@PathVariable String etunimet, @PathVariable String sukunimet) {
        return henkiloRepository.findByEtunimetAndSukunimet(etunimet, sukunimet);
    }
}
