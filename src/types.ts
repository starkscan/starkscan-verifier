// Map of file path: content of file
export type Files = Record<string, string>

// CodePkg used to verify a class
export type SourceCode = {
  main_file_path: string,
  class_hash: string,
  name: string,
  compiler_version: string,
  is_account_contract: boolean,
  files: Files,
}

export type networkType = "mainnet" | "testnet"

export type StarknetCompilerVersion = 
  "0.10.1" | "0.10.0" | "0.9.1" | "0.9.0" | "0.8.2" | "0.8.1" |"0.8.0"