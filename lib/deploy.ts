import { ethers } from "ethers";

export type DeployParams = {
  signer: ethers.Signer;
  bytecode: string;
  abi?: ethers.ContractInterface;
  args?: unknown[];
  gasLimit: number;
  gasPrice?: ethers.BigNumber;
  valueEth: string;
};

export function sanitizeBytecode(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("0x") ? trimmed : `0x${trimmed}`;
}

export function isValidHexBytecode(bytecode: string) {
  return /^0x([0-9a-fA-F]{2})+$/.test(bytecode);
}

export async function estimateDeploymentGas({
  signer,
  bytecode,
  abi,
  args = [],
  gasPrice,
  valueEth
}: Omit<DeployParams, "gasLimit">) {
  const provider = signer.provider;
  if (!provider) throw new Error("Signer provider not found");

  const factory = new ethers.ContractFactory(abi ?? [], bytecode, signer);
  const deployTx = factory.getDeployTransaction(...args, {
    gasPrice,
    value: valueEth ? ethers.utils.parseEther(valueEth) : undefined
  });
  if (!deployTx.data) {
    throw new Error("Failed to generate deployment data");
  }

  const from = await signer.getAddress();

  return provider.estimateGas({
    from,
    data: deployTx.data,
    gasPrice,
    value: valueEth ? ethers.utils.parseEther(valueEth) : undefined
  });
}

export async function deployContract({ signer, bytecode, abi, args = [], gasLimit, gasPrice, valueEth }: DeployParams) {
  if (!isValidHexBytecode(bytecode)) {
    throw new Error("Invalid bytecode. Expected even-length hex string.");
  }

  const contractFactory = new ethers.ContractFactory(abi ?? [], bytecode, signer);
  const contract = await contractFactory.deploy(...args, {
    gasLimit,
    gasPrice,
    value: valueEth ? ethers.utils.parseEther(valueEth) : undefined
  });

  await contract.deployTransaction.wait();

  return {
    address: contract.address,
    txHash: contract.deployTransaction.hash
  };
}
