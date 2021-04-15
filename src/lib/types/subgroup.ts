export interface Profile {
    name: string;
    imageUrl: string | null;
}

export interface Role {
    name: string;
    members: Array<Profile>;
}

export interface Subgroup {
    name: string;
    info: string;
    roles: Array<Role>;
}

export interface ProfileRaw {
    name: string;
    picture: {
        url: string;
    };
}

export interface RoleRaw {
    name: string;
    membersCollection: {
        items: Array<ProfileRaw>;
    };
}

export interface SubgroupRaw {
    name: string;
    info: string;
    rolesCollection: {
        items: Array<RoleRaw>;
    };
}
