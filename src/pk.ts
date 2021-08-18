import fetch from "node-fetch";
import { MemoizeExpiring } from "typescript-memoize";
import { logger } from "./logger";

export class PluralKitAPI {
    PK_BASE = "https://api.pluralkit.me/v1";
    constructor(private token: string, private system: string) { }

    private async getJSON(path: string): Promise<any> {
        const res = await fetch(this.PK_BASE + path, { headers: { Authorization: this.token } });
        const json = await res.json();
        logger.debug(`${path} => ${JSON.stringify(json)}`);
        return json;
    }

    private async postJSON(path: string, data: any): Promise<void> {
        logger.debug(`${path} + ${JSON.stringify(data)}`);
        await fetch(this.PK_BASE + path, {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                Authorization: this.token,
                "Content-Type": "application/json"
            }
        });
    }

    @MemoizeExpiring(1000 * 60)
    async getMembers(): Promise<SystemMember[]> {
        const json = await this.getJSON(`/s/${this.system}/members`);
        return json;
    }

    @MemoizeExpiring(500)
    async getFronters(): Promise<SystemMember[]> {
        const json = await this.getJSON(`/s/${this.system}/fronters`);
        return json.members;
    }

    async postSwitch(members: SystemMember[]) {
        await this.postJSON("/s/switches", { members: members.map(m => m.id) });
    }
}

export interface SystemMember {
    id: string;
    name: string;
    color: string;
    avatar_url: string;
    birthday: string;
    pronouns: string;
    description: string;
    proxy_tags: { prefix: string, suffix: string }[];
    keep_proxy: boolean;
    created: string;
    // there are more fields but they seem to be null in the docs
    // so we're ignoring them.
}
