const bls = require('noble-bls12-381');
const {deriveMaster, deriveChild} = require('bls12-381-keygen');
// const AggBLS = artifacts.require("AggBLS");
// const AggBLSTestProxy = artifacts.require("AggBLSTestProxy");
const BGLS = artifacts.require("BGLS");
const BGLSTestProxy = artifacts.require("BGLSTestProxy");
// under dev, use original first

const master = deriveMaster(new Uint8Array([0xde, 0xad, 0xbe, 0xef]));
const privateKey = Buffer.from(master).toString('hex'); // uint8array to hexstring

let child = [];
let privateKeys= [];
const n = 3; // number of child keys

for (let i=0; i<n; i++){
    child[i] = deriveChild(master, i); // i is numeric index
    privateKeys[i] = Buffer.from(child[i]).toString('hex')
}

console.log('private key', privateKey);
console.log('private keys', privateKeys);


const message = 'dd';
let messages = [];

for (let i=0; i<n; i++){
    messages[i] = Math.random().toString(16).substr(2, 8);
    console.log('messages[i]:', messages[i]);
}

const publicKey = bls.getPublicKey(privateKey);
let publicKeys = [];
for (let i=0; i<n; i++){
    publicKeys[i] = bls.getPublicKey(privateKeys[i]);
}

async function localSign () {
    const sig = await bls.sign(message, privateKey);
    const isCorrect = await bls.verify(sig, message, publicKey);
    console.log(isCorrect);

    let sigs = [];
    for (let i = 0; i < n; i++) {
        sigs[i] = await bls.sign(messages[i], privateKeys[i]);
    }

    const aggsig = bls.aggregateSignatures(sigs);
    const aggpub = bls.aggregatePublicKeys(publicKeys);

    const isAggCorrect = await bls.verifyBatch(aggsig, messages, publicKeys);
    console.log('isAggCorrect', isAggCorrect);

    const isAggCorrect1 = await bls.verify(aggsig, messages.toString(), aggpub); //if this step cannot be done, then aggregatePublicKeys is useless.
    console.log('isAggCorrect1', isAggCorrect1);

    console.log('bls.CURVE.Gx.length', bls.CURVE.Gx.toString(2).length); // length of g1 g2 of bls12381 is 381.
    // console.log('bls.CURVE', bls.CURVE); // same parameter
    // proof: https://github.com/zkcrypto/bls12_381  https://github.com/paulmillr/noble-bls12-381

}

// above is calculation from JS only
// below let's try do it on smart contract

contract("BGLS", async (accounts) =>  {
    let bgls;
    let bglsTest;
    beforeEach(async () => {
        bgls = await BGLS.new();
        bglsTest = await BGLSTestProxy.new();
    })
    it("should verify trivial pairing", async () => {
        assert(await bglsTest.pairingCheckTrivial.call());
    });
    it("should verify scalar multiple pairing", async () => {
        assert(await bglsTest.pairingCheckMult.call());
    });
    it("should add points correctly", async () => {
        assert(await bglsTest.addTest.call());
    })
    it("should do scalar multiplication correctly", async () => {
        assert(await bglsTest.scalarTest.call());
    })
    it("should verify a simple signature correctly", async () => {
        assert(await bglsTest.testSignature.call([12345,54321,10101,20202,30303]));
    })
    it("should sum points correctly", async () => {
        localSign();
        assert(await bglsTest.testSumPoints.call());
    })

    // it("contract should verify locally computed signatures", async () =>{
    //
    // localSign();
    //
    // TODO now we want to pass signatures, message and pubkey to contract for verification. Now we have formatting issue.
    //
    // // Note! these two are required to be implemented by BLS Signatures draft-irtf-cfrg-bls-signature-04
    // // point_to_octets(P) -> ostr
    // // octets_to_point(ostr) -> P
    // // To convert between oct strings (now JS) to points (now contract).
    // bls.PointG1.fromHex();
    // bls.PointG1.BASE.toHex();
    //     assert(await bglsTest.testSignatureInputs.call());
    // })

})
