import Papa from "papaparse";
import { validateInvestorRow, ValidationError } from "./validators";

export const CSV_HEADERS = [
  "name",
  "email",
  "type",
  "walletAddress",
  "kycStatus",
  "lastUpdated",
];

import { getAllInvestorTypes } from "./investorTypes";

export const generateTemplateCSV = (): string => {
  const headers = CSV_HEADERS.join(",");

  // Get a few sample investor types for the template
  const sampleTypes = [
    "hnwi", // High-Net-Worth Individual
    "pension_funds", // Pension Fund
    "private_equity_vc", // Private Equity & VC
  ];

  const sampleRows = [
    `John Doe,john@example.com,${sampleTypes[0]},0x742d35Cc6634C0532925a3b844Bc454e4438f44e,approved,2024-05-01`,
    `Acme Capital,contact@acmecapital.com,${sampleTypes[1]},0x8A723Dc34f5a5B6Cad891c46E32f900E22A1EAc7,pending,2024-05-02`,
    `Venture Partners LLC,info@venturepartners.com,${sampleTypes[2]},0x9B2c46E32f900E22A1EAc7A723Dc34f5a5B6Cad8,not_started,`,
  ];

  return `${headers}\n${sampleRows.join("\n")}`;
};

export const downloadTemplate = () => {
  const csvContent = generateTemplateCSV();
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "investor-template.csv");
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const parseCSV = (
  file: File,
): Promise<{ data: any[]; errors: ValidationError[] }> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const errors: ValidationError[] = [];
        const validData: any[] = [];

        results.data.forEach((row: any, index: number) => {
          const rowErrors = validateInvestorRow(row, index);
          if (rowErrors.length === 0) {
            validData.push(row);
          } else {
            errors.push(...rowErrors);
          }
        });

        resolve({ data: validData, errors });
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};
