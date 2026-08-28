import { contractV1 } from "./v1";
import { contractV2 } from "./v2";
import type { ContractContent } from "./types";

export type { ContractContent } from "./types";

const contractContentByVersion: Record<string, ContractContent> = {
    [contractV1.version]: contractV1,
    [contractV2.version]: contractV2,
};

export function getContractContent(version: string) {
    return contractContentByVersion[version] ?? null;
}
