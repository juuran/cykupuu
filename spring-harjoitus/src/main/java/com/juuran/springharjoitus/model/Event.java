package com.juuran.springharjoitus.model;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Entity
public class Event {

    @Id
    @GeneratedValue
    private Long id;
    private Instant date;
    private String title;
    private String description;
    @ManyToMany(cascade = CascadeType.ALL)
    private Set<User> attendees = new HashSet<>();

    public Event(Long id, Instant date, String title, String description, Set<User> attendees) {
        this.id = id;
        this.date = date;
        this.title = title;
        this.description = description;
        this.attendees = attendees;
    }

    public Event() {
        this.attendees = new HashSet<>();
    }

    public Long getId() {
        return this.id;
    }

    public Instant getDate() {
        return this.date;
    }

    public String getTitle() {
        return this.title;
    }

    public String getDescription() {
        return this.description;
    }

    public Set<User> getAttendees() {
        return this.attendees;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setDate(Instant date) {
        this.date = date;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setAttendees(Set<User> attendees) {
        this.attendees = attendees;
    }

    public String toString() {
        return "Event(id=%d, date=%s, title=%s, description=%s, attendees=[will not be shown])".formatted(this.getId(), this.getDate(), this.getTitle(), this.getDescription());
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {

        private Event builtEvent;

        private Builder() {
            this.builtEvent = new Event();
        }

        public Builder id(Long id) {
            builtEvent.id = id;
            return this;
        }

        public Builder date(Instant date) {
            builtEvent.date = date;
            return this;
        }

        public Builder title(String title) {
            builtEvent.title = title;
            return this;
        }

        public Builder description(String description) {
            builtEvent.description = description;
            return this;
        }

        public Builder attendees(Set<User> attendees) {
            builtEvent.attendees = attendees;
            return this;
        }

        public Event build() {
            Event event = this.builtEvent;
            this.builtEvent = null;
            return event;
        }

    }

}
