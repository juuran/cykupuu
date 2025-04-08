package com.juuran.springharjoitus.model;

import jakarta.persistence.*;
import org.springframework.lang.NonNull;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "user_group")
public class Group {

    @Id
    @GeneratedValue
    private Long id;
    @NonNull
    private String name;
    private String address;
    private String city;
    private String stateOrProvince;
    private String country;
    private String postalCode;
    @ManyToOne(cascade = CascadeType.PERSIST)
    private User user;
    @OneToMany(fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    private Set<Event> events = new HashSet<>();

    public Group() {
        this.events = new HashSet<>();
    }

    public Group(@NonNull String name) {
        this.name = name;
    }

    public Long getId() {
        return this.id;
    }

    public @NonNull String getName() {
        return this.name;
    }

    public String getAddress() {
        return this.address;
    }

    public String getCity() {
        return this.city;
    }

    public String getStateOrProvince() {
        return this.stateOrProvince;
    }

    public String getCountry() {
        return this.country;
    }

    public String getPostalCode() {
        return this.postalCode;
    }

    public User getUser() {
        return this.user;
    }

    public Set<Event> getEvents() {
        return this.events;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setName(@NonNull String name) {
        this.name = name;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public void setStateOrProvince(String stateOrProvince) {
        this.stateOrProvince = stateOrProvince;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setEvents(Set<Event> events) {
        this.events = events;
    }

    public String toString() {
        return "Group(id=%d, name=%s, address=%s, city=%s, stateOrProvince=%s, country=%s, postalCode=%s, user=%s, events=%s)".formatted(this.getId(), this.getName(), this.getAddress(), this.getCity(), this.getStateOrProvince(), this.getCountry(), this.getPostalCode(), this.getUser() != null ? this.getUser().getName() : "null", this.getEvents() != null ? this.getEvents() : "null");
    }

}
