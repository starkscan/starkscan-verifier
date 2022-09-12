import fs from "fs"
import TOML from "@iarna/toml"
import * as path from "path"

const PROTOSTAR_TOML = "protostar.toml"
export async function getCairoPathsForProtostar(): Promise<string[]> {
  if (fs.existsSync(PROTOSTAR_TOML)) {
    const tomlFile = fs.readFileSync(PROTOSTAR_TOML, "utf-8")
    const parsedTomlFile = TOML.parse(tomlFile) as any
    const cairoPathsFromBuild = parsedTomlFile["protostar.build"]?.["cairo-path"] ?? []
    const cairoPathsFromSharedCommandConfigs = parsedTomlFile["protostar.shared_command_configs"]?.["cairo-path"] ?? []
    return [...cairoPathsFromBuild, ...cairoPathsFromSharedCommandConfigs]
  }
  return []
}

const NILE_DIRECTORY = "contracts"
const PYTHON_VERSIONS = ["python3.7", "python3.8", "python3.9", "python3.10", "python3.11"]
export async function getCairoPathsForNile(): Promise<string[]> {
  // nile recommends python env as setup
  if (process.env.VIRTUAL_ENV) {
    const pythonVirtualEnv = process.env.VIRTUAL_ENV
    // currently running in virtual environment, try to guess site-packages directory
    for (let i = 0; i < PYTHON_VERSIONS.length; i++) {
      const pythonVersion = PYTHON_VERSIONS[i]
      const potentialPythonSitePackagesPath = path.join(pythonVirtualEnv, "lib", pythonVersion, "site-packages")
      if (fs.existsSync(potentialPythonSitePackagesPath)) {
        return [potentialPythonSitePackagesPath, NILE_DIRECTORY]
      }
    }
  }
  return []
}
