export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidEthAddress = (address: string): boolean => {
  const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  return ethAddressRegex.test(address);
};

export interface ValidationError {
  row: number;
  column: string;
  value: string;
  message: string;
}

export const validateInvestorRow = (
  row: any,
  index: number,
): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!row.name?.trim()) {
    errors.push({
      row: index + 1,
      column: "name",
      value: row.name || "",
      message: "Name is required",
    });
  }

  if (!isValidEmail(row.email)) {
    errors.push({
      row: index + 1,
      column: "email",
      value: row.email || "",
      message: "Invalid email format",
    });
  }

  // Import the valid investor type IDs
  const validTypeIds = require("./investorTypes")
    .getAllInvestorTypes()
    .map((t: any) => t.id);

  if (!validTypeIds.includes(row.type)) {
    errors.push({
      row: index + 1,
      column: "type",
      value: row.type || "",
      message: "Invalid investor type",
    });
  }

  if (row.walletAddress && !isValidEthAddress(row.walletAddress)) {
    errors.push({
      row: index + 1,
      column: "walletAddress",
      value: row.walletAddress || "",
      message: "Invalid ETH wallet address",
    });
  }

  return errors;
};
