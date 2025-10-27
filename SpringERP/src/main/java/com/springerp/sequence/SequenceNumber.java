package com.springerp.sequence;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "sequence_numbers")
@Data
public class SequenceNumber {

    @Id
    private String sequenceName;

    private long nextValue;

    private String prefix;
}