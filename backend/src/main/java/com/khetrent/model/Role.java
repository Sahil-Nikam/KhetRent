package com.khetrent.model;

public enum Role {
    OWNER,
    FARMER;

    public String toAuthority() {
        return "ROLE_" + this.name();
    }
}
