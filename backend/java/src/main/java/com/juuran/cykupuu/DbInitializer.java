package com.juuran.cykupuu;

import com.juuran.cykupuu.model.Henkilo;
import com.juuran.cykupuu.model.Suhde;
import com.juuran.cykupuu.model.SuhdeTyyppi;
import com.juuran.cykupuu.repository.HenkiloRepository;
import com.juuran.cykupuu.repository.SuhdeRepository;
import com.juuran.cykupuu.repository.SuhdeTyyppiRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DbInitializer implements CommandLineRunner {

    private final HenkiloRepository henkiloRepo;
    private final SuhdeRepository suhdeRepo;
    private final SuhdeTyyppiRepository suhdeTyyppiRepo;

    public DbInitializer(HenkiloRepository henkiloRepository, SuhdeRepository suhdeRepository,
            SuhdeTyyppiRepository stRepo) {
        this.henkiloRepo = henkiloRepository;
        this.suhdeRepo = suhdeRepository;
        this.suhdeTyyppiRepo = stRepo;
    }

    @Override
    public void run(String... args) {
        Henkilo pekka = henkiloRepo.save(new Henkilo("Pekka Eevertti", "Ismonperä"));
        Henkilo irmal = henkiloRepo.save(new Henkilo("Irmal Irmeli", "Ala-Hallava"));
        Henkilo eskil = henkiloRepo.save(new Henkilo("Eskil Studio", "Ismonperä"));
        Henkilo jalom = henkiloRepo.save(new Henkilo("Jalomiina", "Ryntäinen"));
        Henkilo bappe = henkiloRepo.save(new Henkilo("Isä Bappe", "Ryntäinen"));

        Suhde s1 = suhdeRepo.save(Suhde.builder() //
                .onkoNaimisissa(false) //
                .onkoYhdessa(true) //
                .build() //
        );
        Suhde s2 = suhdeRepo.save(Suhde.builder() //
                .onkoNaimisissa(true) //
                .onkoYhdessa(true) //
                .build() //
        );
        Suhde s3 = suhdeRepo.save(Suhde.builder() //
                .onkoNaimisissa(true) //
                .onkoYhdessa(false) //
                .build() //
        );

        SuhdeTyyppi st1 = new SuhdeTyyppi("avoliitto");
        SuhdeTyyppi st2 = new SuhdeTyyppi("avioliitto");

        st1 = suhdeTyyppiRepo.save(st1);
        st2 = suhdeTyyppiRepo.save(st2);
        st1.addSuhde(s1);
        st1.addSuhde(s2);
        st2.addSuhde(s3);
        suhdeTyyppiRepo.save(st1);
        suhdeTyyppiRepo.save(st2);

        pekka.addPariSuhde(s1);
        irmal.addPariSuhde(s1);
        eskil.addVanhempiSuhde(s1, true);
        eskil.addPariSuhde(s2);
        jalom.addVanhempiSuhde(s3, false);
        jalom.addPariSuhde(s2);
        bappe.addPariSuhde(s3);

        henkiloRepo.save(pekka);
        henkiloRepo.save(irmal);
        henkiloRepo.save(eskil);
        henkiloRepo.save(jalom);
        henkiloRepo.save(bappe);

        System.out.println("*********** Aloitetaan suhteiden hakeminen.");
        List<Suhde> strings = suhdeRepo.findAll();
        System.out.println("Tulostetaan löytyneet suhteet:");
        for (var str : strings) {
            System.out.println(str);
        }

        System.out.println("*********** Aloitetaan henkilöiden hakeminen.");
        List<Henkilo> strings2 = henkiloRepo.findAll();
        System.out.println("Tulostetaan löytyneet henkilöt:");
        for (var str : strings2) {
            System.out.println(str);
        }
    }

}
