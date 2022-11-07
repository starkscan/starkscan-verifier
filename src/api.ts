import axios from "axios";
import { networkType, SourceCode } from "./types.js";

function getStarkscanBaseUrl(network: networkType) {
  if (network === "mainnet") {
    return "https://api.starkscan.co/api"
  } else if (network === "testnet-2") {
    return "https://api-testnet-2.starkscan.co/api"
  }
  return "https://api-testnet.starkscan.co/api"
}

export function getStarkscanClassUrl({
  classHash,
  network,
}: {
  classHash: string;
  network: networkType;
}): string {
  if (network === "mainnet") {
    return `https://starkscan.co/class/${classHash}#code`;
  } else if (network === "testnet-2") {
    return `https://testnet-2.starkscan.co/class/${classHash}#code`;
  }
  return `https://testnet.starkscan.co/class/${classHash}#code`;
}
interface HashDetailsRes {
  type: "class" | "contract";
  class_hash: string;
  is_verified: boolean;
}
export async function getHashDetails({
  hash,
  network,
}: {
  hash: string;
  network: networkType;
}): Promise<HashDetailsRes | null> {
  const url = `${getStarkscanBaseUrl(network)}/hash/${hash}`

  try {
    const { data } = await axios.default.get(url);
    return data;
  } catch (err: any) {
    if (err?.response?.status === 404) {
      // cannot find, expected error
      return null;
    } else {
      throw err;
    }
  }
}

export interface JobStatusRes {
  class_hash: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
  error_message: string | null;
}
export async function getJobStatus({
  jobId,
  network,
}: {
  jobId: string;
  network: networkType;
}): Promise<JobStatusRes> {
  const url = `${getStarkscanBaseUrl(network)}/verify_class_job_status/${jobId}`
  const { data } = await axios.default.get(url);
  return data;
}

export async function submitVerifyClass({
  sourceCode,
  network,
}: {
  sourceCode: SourceCode;
  network: networkType;
}): Promise<string> {
  const url = `${getStarkscanBaseUrl(network)}/verify_class`

  try {
    const { data } = await axios.default.post(url, sourceCode);
    return data.job_id;
  } catch (err) {
    console.log("[submitVerifyClass]", err);
    throw err;
  }
}
