package com.juuran.cykupuu.web;

import com.juuran.cykupuu.model.Henkilo;
import com.juuran.cykupuu.model.Suhde;
import com.juuran.cykupuu.repository.HenkiloRepository;
import com.juuran.cykupuu.repository.SuhdeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = { "http://localhost", "null" })  // toistaiseksi päälle, helpottaa kehittämistä!
public class HenkiloSuhteetController {

    private static final Logger log = LoggerFactory.getLogger(HenkiloSuhteetController.class);

    private HenkiloRepository henkiloRepo;
    private SuhdeRepository suhdeRepo;

    public HenkiloSuhteetController(HenkiloRepository henkiloRepository, SuhdeRepository suhdeRepository) {
        this.henkiloRepo = henkiloRepository;
        this.suhdeRepo = suhdeRepository;
    }

    @GetMapping("/henkilot")
    public HashMap<Long, Henkilo> getAllHenkiloData() {
        HashMap<Long, Henkilo> map = new HashMap<>();
        henkiloRepo.findAll().forEach(henkilo -> map.put(henkilo.getId(), henkilo));

        return map;
    }

    @GetMapping("/henkilo")
    public List<Henkilo> getHenkiloByEtunimetAndSukunimet(@RequestParam String sukunimet) {
        return henkiloRepo.findBySukunimet(sukunimet);
    }

    @GetMapping("/suhteet")
    public HashMap<Long, Suhde> getAllSuhdeData() {
        HashMap<Long, Suhde> map = new HashMap<>();
        suhdeRepo.findAll().forEach(suhde -> map.put(suhde.getId(), suhde));

        return map;
    }

}
