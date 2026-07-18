import { ShelbyClient } from '@shelby-protocol/sdk/browser';
import { Network } from '@aptos-labs/ts-sdk';
import type { WalletAccount } from './types';

const client = new ShelbyClient({
  network: Network.TESTNET,
});

export async function uploadToShelby(
  data: Uint8Array,
  account: WalletAccount,
  blobName: string
): Promise<string> {
  // TODO: Replace stub with real ShelbyClient.upload() when wallet provides full Account
  console.log('Uploading to Shelby:', blobName, data.length, 'bytes');
  return `0xstubhash_${Date.now()}`;
}

export async function downloadFromShelby(
  ownerAddress: string,
  blobName: string
): Promise<ReadableStream<Uint8Array>> {
  const blob = await client.download({
    account: ownerAddress,
    blobName,
  });
  return blob.readable;
}
