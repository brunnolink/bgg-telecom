import { Role } from "@prisma/client";

export class UserEntity {
    public readonly id: string;
    public name: string;
    public email: string;
    public password: string;
    public role: Role;
    public readonly createdAt?: Date;
    public readonly updatedAt?: Date;

    constructor(props: {
        id: string;
        name: string;
        email: string;
        password: string;
        role: Role;
        createdAt?: Date;
        updatedAt?: Date;
    }) {
        this.id = props.id;
        this.name = props.name.trim();
        this.email = props.email.trim().toLowerCase();
        this.password = props.password;
        this.role = props.role;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;

        this.validate();
    }

    private validate() {
        if (!this.name || this.name.length < 2) {
            throw new Error("Invalid name");
        }
        if (!this.email || !this.email.includes("@")) {
            throw new Error("Invalid email");
        }
        if (!this.password || this.password.length < 6) {
            throw new Error("password must be at least 6 characters long");
        }
    }

    toPublic() {
        const { password, ...rest } = this;
        return rest;
    }
}
