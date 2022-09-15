<!-- logo -->
<p align="center">
  <a href="https://starkscan.co">
    <img width='320' src="https://raw.githubusercontent.com/starkscan/starkscan-verifier/main/docs/logo.svg">
  </a>
</p>

<!-- primary badges -->
<p align="center">
  <a href="https://www.npmjs.com/package/starkscan">
    <img src='https://img.shields.io/npm/v/starkscan' />
  </a>
  <a href="https://www.npmjs.com/package/starkscan">
    <img src='https://img.shields.io/npm/dt/starkscan?color=blueviolet' />
  </a>
  <a href="https://github.com/starkscan/starkscan-verifier/blob/main/LICENSE/">
    <img src="https://img.shields.io/badge/license-MIT-black">
  </a>
  <a href="https://github.com/starkscan/starkscan-verifier/stargazers">
    <img src='https://img.shields.io/github/stars/starkscan/starkscan-verifier?color=yellow' />
  </a>
  <a href="https://starkware.co/">
    <img src="https://img.shields.io/badge/powered_by-StarkWare-navy">
  </a>
</p>

<p align="center">
  <img width="200" src="https://raw.githubusercontent.com/starkscan/starkscan-verifier/main/docs/demo.gif" alt="demo" />
</p>

## Why verify?

Anyone can upload any ABI to Starknet and block explorers will assume it is correct when it doesn't have to be. The information is misleading because it is possible to upload an incorrect ABI. This could potentially introduce a security risk when interacting with unverified contracts on Starknet. This verifier allows you to verify the ABI of a contract on Starknet and confirm that it is correct. Jonathan Lei mentioned this in a [community post here](https://community.starknet.io/t/remove-abi-from-contract-deployment-request-and-get-code-response/308).

### What happens after you verify?

- [Transactions](https://starkscan.co/txs) and [Events](https://starkscan.co/events) are correctly decoded to human readable functions, inputs and outputs.
- Run read and write operations on the contract state safely and accurately.
- Users who look at your contracts on Starkscan can trust that all the information is correct.

## Getting Started

### Pre-requisites

- 🐍 Python users that use [Nile](https://github.com/OpenZeppelin/nile) please activate your virtual environment.
- 🌟 Protostar users please run `protostar install` before running this tool.

### Usage

###### npx

```bash
# in your project directory
npx starkscan
```

###### npm

```bash
npm install -g starkscan

# in your project directory
starkscan
```

## Help

- DM us on [Twitter](https://twitter.com/starkscanco)

## License

Copyright (c) 2022 Diamond Paws Inc

Licensed under the [MIT license](https://github.com/starkscan/starkscan-verifier/blob/main/LICENSE).

## Website

- [Starkscan](https://starkscan.co)
