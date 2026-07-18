import { Network, Aptos } from '@aptos-labs/ts-sdk';
import type { WalletAccount } from './types';

const aptos = new Aptos({ network: Network.TESTNET });

export async function connectWallet(): Promise<WalletAccount> {
  if (!window.aptos) {
    throw new Error('Petra wallet not installed');
  }
  const response = await window.aptos.connect();
  return {
    address: response.address,
    publicKey: response.publicKey,
  };
}

export async function signMessage(message: string): Promise<string> {
  if (!window.aptos) {
    throw new Error('Wallet not connected');
  }
  const response = await window.aptos.signMessage({ message });
  return response.signature;
}

declare global {
  interface Window {
    aptos?: any;
  }
}
