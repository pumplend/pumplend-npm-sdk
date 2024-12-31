import { Pumplend } from "../src";

import { Keypair,LAMPORTS_PER_SOL, PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
  Connection,
  clusterApiUrl,
  TransactionInstruction,
  Struct,
  SendTransactionError,
} from "@solana/web3.js";
import {
mintTo,
TOKEN_PROGRAM_ID,
TOKEN_2022_PROGRAM_ID,
ASSOCIATED_TOKEN_PROGRAM_ID,
createAssociatedTokenAccount,
getAssociatedTokenAddressSync,
getAssociatedTokenAddress,
createInitializeMintInstruction,
getMintLen,
getOrCreateAssociatedTokenAccount,
getAccount,
createAssociatedTokenAccountInstruction

} from "@solana/spl-token";


const connection = new Connection('https://api.devnet.solana.com');
//init
jest.setTimeout(36000000)

test("🍺 Test Pumplend SDK", async () => {
  const testUser = new PublicKey("AmRqRwRAZzesXSWbXbdifDAWAytVmQJoYBzhWCynGCuR");

  let lend = new Pumplend()

  console.log(
    "Get some data ::",
    await lend.tryGetUserStakingData(connection,testUser),
    await lend.tryGetSystemConfigData(connection),
    await lend.tryGetPoolStakingData(connection),
    lend.tryGetUserAccounts(testUser),
  )
})