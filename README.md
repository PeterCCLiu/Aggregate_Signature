# Aggregate Signatures

The purpose of this repository is to implement an Aggregate Signature scheme for EY Blockchain. 
Jira ticket: O40-1716.

Goal:
- Implement a **secondary key management scheme** for BEC wallet, such that each member of organization possesses a different key.
- Achieve **full traceability of operations**, meaning each critical operation processed by a member of group is auditable, and eventually forms an audit trail.
- Balance performance, compatibility to BEC, gas costs, etc. 

How to use:

`git clone`

Install truffle, the tester environment and Ganache, the private Ethereum endpoint simulator.

`npm i`

Run Ganache, it runs on localhost:8545

`ganache-cli`

Build binaries of contract

`truffle build`

Do tests

`truffle test`

Architecture:

For best performance without sacrificing security, we have the architecture designed as follows:
- A smart contract that serves as an on-chain signature aggregator and public verifier. It does the following:
    - Signature aggregation
    - Single signature verification
    - Aggregated signature verification
- A local Javascript library that locally sign transactions and calls the above contract. It does the following:
    - Signing a transaction/message
    
Construction base:
- Cryptographic: Pairing-friendly crypto
  - alt_bn128 
  - BLS12-381
- Dev: Ethereum pre-compiled contracts that supports pairing operations
  - EIP 197 (alt_bn128, now, at address 0x05-0x08)
  - EIP-2537 (BLS12-381, ongoing, at address 0x0a-0x12)

Forked from [bgls-on-evm](https://github.com/Project-Arda/bgls-on-evm), _a Library for the verification of BGLS signatures on the EVM using Solidity_, with few modifications.

This is an ongoing project.
