const nacl = require('libsodium-wrappers')

module.exports = async () => {
    await nacl.ready;
    let keypair = nacl.crypto_sign_keypair();
    console.log("------------------------------------------------------------------");
    console.log(keypair);
    // console.log(keypair.publicKey);
    
    return Object.freeze({
        verifyingKey: keypair.publicKey,
        sign: (msg) => { return nacl.crypto_sign(msg, keypair.privateKey); }
    });
}
