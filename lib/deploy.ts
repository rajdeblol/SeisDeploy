import { ethers } from "ethers";

export type DeployParams = {
  signer: ethers.Signer;
  bytecode: string;
  gasLimit: number;
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
  valueEth
}: Omit<DeployParams, "gasLimit">) {
  const provider = signer.provider;
  if (!provider) throw new Error("Signer provider not found");

  const factory = new ethers.ContractFactory([], bytecode, signer);
  const deployTx = factory.getDeployTransaction();
  if (!deployTx.data) {
    throw new Error("Failed to generate deployment data");
  }

  const from = await signer.getAddress();

  return provider.estimateGas({
    from,
    data: deployTx.data,
    value: valueEth ? ethers.utils.parseEther(valueEth) : undefined
  });
}

export async function deployContract({ signer, bytecode, gasLimit, valueEth }: DeployParams) {
  if (!isValidHexBytecode(bytecode)) {
    throw new Error("Invalid bytecode. Expected even-length hex string.");
  }

  const contractFactory = new ethers.ContractFactory([], bytecode, signer);
  const contract = await contractFactory.deploy({
    gasLimit,
    value: valueEth ? ethers.utils.parseEther(valueEth) : undefined
  });

  await contract.deployTransaction.wait();

  return {
    address: contract.address,
    txHash: contract.deployTransaction.hash
  };
}
