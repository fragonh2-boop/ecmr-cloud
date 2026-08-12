import { NextRequest, NextResponse } from "next/server";
import { canonicalJson, createEcmrReference, createVerificationId, sha256, type CanonicalValue } from "@/lib/trust";

export const runtime = "nodejs";

type Party = {
  name: string;
  country?: string;
  vatId?: string;
};

type CreateEcmrRequest = {
  externalReference?: string;
  consignor: Party;
  carrier: Party;
  consignee: Party;
  goods: Array<{
    description: string;
    packages?: number;
    grossWeightKg?: number;
  }>;
};

function isParty(value: unknown): value is Party {
  return Boolean(value && typeof value === "object" && "name" in value && typeof (value as Party).name === "string" && (value as Party).name.trim());
}

function isValidPayload(value: unknown): value is CreateEcmrRequest {
  if (!value || typeof value !== "object") return false;
  const payload = value as Partial<CreateEcmrRequest>;
  return (
    isParty(payload.consignor) &&
    isParty(payload.carrier) &&
    isParty(payload.consignee) &&
    Array.isArray(payload.goods) &&
    payload.goods.length > 0 &&
    payload.goods.every((item) => Boolean(item && typeof item.description === "string" && item.description.trim()))
  );
}

export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  if (!isValidPayload(payload)) {
    return NextResponse.json(
      {
        error: "INVALID_ECMR_PAYLOAD",
        required: ["consignor.name", "carrier.name", "consignee.name", "goods[0].description"],
      },
      { status: 422 }
    );
  }

  const now = new Date();
  const ecmrId = createEcmrReference(now);
  const verificationId = createVerificationId();
  const version = 1;

  const canonicalDocument = {
    schema: "ecmr-cloud.canonical.v0.1",
    ecmrId,
    version,
    externalReference: payload.externalReference ?? null,
    consignor: payload.consignor,
    carrier: payload.carrier,
    consignee: payload.consignee,
    goods: payload.goods,
  } as unknown as CanonicalValue;

  const documentHash = sha256(canonicalJson(canonicalDocument));
  const occurredAt = now.toISOString();
  const eventPayload = {
    ecmrId,
    type: "ECMR_CREATED",
    occurredAt,
    documentVersion: version,
    documentHash,
    previousEventHash: null,
  } as unknown as CanonicalValue;
  const eventHash = sha256(canonicalJson(eventPayload));

  return NextResponse.json(
    {
      ecmrId,
      externalReference: payload.externalReference ?? null,
      status: "DRAFT",
      version,
      verificationId,
      createdAt: occurredAt,
      integrity: {
        algorithm: "SHA-256",
        canonicalization: "sorted-json-v0.1",
        documentHash,
      },
      ledger: {
        firstEvent: {
          type: "ECMR_CREATED",
          occurredAt,
          previousEventHash: null,
          eventHash,
        },
      },
      links: {
        verify: `/verify/${verificationId}`,
      },
    },
    { status: 201 }
  );
}
