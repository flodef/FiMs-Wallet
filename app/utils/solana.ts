import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { createTransfer, createTransferChecked, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { createTransferUrl } from '@solana/pay';

// Configuration
const RPC_ENDPOINT = 'https://api.mainnet-beta.solana.com'; // Or devnet for testing
const connection = new Connection(RPC_ENDPOINT);

// Your app's payer keypair (e.g., from backend; keep private!)
const payer = Keypair.generate(); // Replace with your actual keypair

// Example params - replace with user input
const recipient = new PublicKey('RECIPIENT_PUBLIC_KEY_HERE'); // e.g., ' recipient's wallet address
const tokenMint = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'); // USDC mint
const amount = 1000000n; // 1 USDC (adjust for decimals)
const memoText = 'Thanks for the purchase!'; // Optional memo
const reference = Keypair.generate().publicKey; // Optional: Track the tx (e.g., order ID)

async function generateTokenTransferDeeplink(): Promise<string> {
  // Get sender's ATA (your app's token account)
  const senderTokenAccount = await getAssociatedTokenAddress(tokenMint, payer.publicKey);

  // Get recipient's ATA
  const recipientTokenAccount = await getAssociatedTokenAddress(tokenMint, recipient);

  // Create the transfer instruction
  // Use createTransferChecked if you want to enforce decimals; otherwise createTransfer
  const transferInstruction = createTransferChecked({
    connection,
    payer: payer.publicKey, // Actually payer is the fee payer, but tx will be signed by user
    mint: tokenMint,
    source: senderTokenAccount,
    dest: recipientTokenAccount,
    owner: payer.publicKey, // Sender's owner (your app wallet)
    amount,
    decimals: 6, // Token decimals (e.g., 6 for USDC)
    signers: [], // No extra signers needed
  });

  // Optional: Add a memo instruction
  const memoInstruction = {
    programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
    keys: [],
    data: Buffer.from(memoText, 'utf8'),
  };

  // Build the full transaction
  const transaction = new Transaction().add(memoInstruction, transferInstruction);

  // Serialize for the deeplink (recent blockhash will be fetched by the wallet)
  const transactionRequest = {
    transaction: transaction.serialize({
      requireAllSignatures: false, // User signs it
      verifySignatures: false,
    }),
    message: 'Please approve this token transfer',
    options: { skipPreflight: false }, // Optional
  };

  // Generate the solana: URL
  const url = createTransferUrl(
    {
      recipient: recipientTokenAccount, // ATA as recipient for token transfers
      amount,
      splToken: tokenMint,
      reference, // Optional
      label: 'Token Transfer', // Optional: UI label
      message: 'Confirm transfer of 1 USDC', // Optional
      memo: memoText, // Optional
    },
    transactionRequest.transaction, // Embed the serialized tx
  );

  return url.toString();
}

// Usage in your web app
export async function handleTransfer() {
  try {
    const deeplink = await generateTokenTransferDeeplink();
    console.log(deeplink); // e.g., "solana:transfer?recipient=...&amount=..."

    // Option 1: Open directly (prompts wallet)
    window.open(deeplink, '_self');

    // Option 2: Generate QR code for scanning (using a lib like qrcode)
    // QRCode.toCanvas(canvasElement, deeplink);
  } catch (error) {
    console.error('Error generating deeplink:', error);
  }
}
