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