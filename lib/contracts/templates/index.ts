import { ContractV1 } from "./v1";
import { ContractV2 } from "./v2";

export type ContractTemplateProps = {
    managerName: string;
    nationalId: string;
    phoneNumber: string;
    ipAddress: string;
    userAgent: string;
    date: string;
};

const templates: Record<string, React.ComponentType<ContractTemplateProps>> = {
    "1.0.0": ContractV1,
    "2.0.0": ContractV2,
};

export function getContractTemplate(version: string) {
    return templates[version] ?? null;
}
