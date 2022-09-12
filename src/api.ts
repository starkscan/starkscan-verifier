import axios from "axios";
import { networkType, SourceCode } from "./types.js";

export function getStarkscanClassUrl({
  classHash,
  network,
}: {
  classHash: string;
  network: networkType;
}): string {
  if (network === "mainnet") {
    return `https://starkscan.co/class/${classHash}`;
  }
  return `https://testnet.starkscan.co/class/${classHash}`;
}
interface HashDetailsRes {
  type: "class" | "contract";
  class_hash: string;
  is_verified: boolean
}
export async function getHashDetails({
  hash,
  network,
}: {
  hash: string;
  network: networkType;
}): Promise<HashDetailsRes | null> {
  let url = `https://api-testnet.starkscan.co/api/hash/${hash}`;
  if (network === "mainnet") {
    url = `https://api.starkscan.co/api/hash/${hash}`;
  }

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
  let url = `https://api-testnet.starkscan.co/api/verify_class_job_status/${jobId}`;
  if (network === "mainnet") {
    url = `https://api.starkscan.co/api/verify_class_job_status/${jobId}`;
  }

  const { data } = await axios.default.get(url);
  return data;
}


export async function submitVerifyClass({
  sourceCode,
  network
} : {
  sourceCode: SourceCode,
  network: networkType,
}): Promise<string> {
  let url = "https://api-testnet.starkscan.co/api/verify_class"
  if (network === "mainnet") {
    url = "https://api.starkscan.co/api/verify_class"
  }

  try {
    const { data } = await axios.default.post(url, sourceCode);
    return data.job_id
  } catch (err) {
    console.log("[submitVerifyClass]", err)
    throw err
  }
}
