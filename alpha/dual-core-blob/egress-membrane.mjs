export const EGRESS_SCHEMA='GVAULT_PUBLIC_SOFT_EGRESS_MEMBRANE_V1';
const FIXED=Object.freeze({allowed:false,status:'SOFT_EGRESS_REJECT',publicMessage:'INDISPONIBLE_SUR_CETTE_SURFACE'});
export function sendOutward(_internalContent){return FIXED}
export function probeEgress(){return {schema:EGRESS_SCHEMA,policy:'SOFT_DENY_ALL_INTERNAL_CONTENT',throwsOnReject:false,outwardRawPayload:false,outwardDerivedPayload:false,outwardHash:false,outwardSize:false,outwardReasonDetail:false,externalWrites:'NONE'}}
