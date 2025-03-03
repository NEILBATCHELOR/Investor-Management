import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Investor } from "./InvestorGrid";
import { getInvestorTypeName, getCategoryForType } from "@/lib/investorTypes";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface CapTableVisualizationProps {
  investors: Investor[];
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FFC658",
  "#8DD1E1",
  "#A4DE6C",
  "#D0ED57",
  "#83A6ED",
  "#8DD1E1",
  "#82CA9D",
  "#A4DE6C",
  "#D0ED57",
];

const CapTableVisualization = ({ investors }: CapTableVisualizationProps) => {
  // Group investors by type
  const investorsByType = React.useMemo(() => {
    const typeGroups: Record<string, { count: number; percentage: number }> =
      {};
    const total = investors.length;

    investors.forEach((investor) => {
      const typeName = getInvestorTypeName(investor.type);
      if (!typeGroups[typeName]) {
        typeGroups[typeName] = { count: 0, percentage: 0 };
      }
      typeGroups[typeName].count += 1;
      typeGroups[typeName].percentage =
        (typeGroups[typeName].count / total) * 100;
    });

    return Object.entries(typeGroups).map(([name, { count, percentage }]) => ({
      name,
      value: count,
      percentage: percentage.toFixed(1),
    }));
  }, [investors]);

  // Group investors by category
  const investorsByCategory = React.useMemo(() => {
    const categoryGroups: Record<
      string,
      { count: number; percentage: number }
    > = {};
    const total = investors.length;

    investors.forEach((investor) => {
      const category = getCategoryForType(investor.type) || "Unknown";
      if (!categoryGroups[category]) {
        categoryGroups[category] = { count: 0, percentage: 0 };
      }
      categoryGroups[category].count += 1;
      categoryGroups[category].percentage =
        (categoryGroups[category].count / total) * 100;
    });

    return Object.entries(categoryGroups).map(
      ([name, { count, percentage }]) => ({
        name,
        value: count,
        percentage: percentage.toFixed(1),
      }),
    );
  }, [investors]);

  // Group investors by KYC status
  const investorsByKYCStatus = React.useMemo(() => {
    const statusGroups: Record<string, { count: number; percentage: number }> =
      {};
    const total = investors.length;

    investors.forEach((investor) => {
      const status = investor.kycStatus;
      const formattedStatus = status
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      if (!statusGroups[formattedStatus]) {
        statusGroups[formattedStatus] = { count: 0, percentage: 0 };
      }
      statusGroups[formattedStatus].count += 1;
      statusGroups[formattedStatus].percentage =
        (statusGroups[formattedStatus].count / total) * 100;
    });

    return Object.entries(statusGroups).map(
      ([name, { count, percentage }]) => ({
        name,
        value: count,
        percentage: percentage.toFixed(1),
      }),
    );
  }, [investors]);

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-md shadow-md">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm">{`Count: ${payload[0].value}`}</p>
          <p className="text-sm">{`Percentage: ${payload[0].payload.percentage}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-white border rounded-lg overflow-hidden">
      <Tabs defaultValue="overview" className="w-full">
        <div className="border-b px-4">
          <TabsList className="w-full justify-start border-b-0 rounded-none px-0 h-auto">
            <TabsTrigger
              value="overview"
              className="py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="by-type"
              className="py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              By Type
            </TabsTrigger>
            <TabsTrigger
              value="by-category"
              className="py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              By Category
            </TabsTrigger>
            <TabsTrigger
              value="by-status"
              className="py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              By KYC Status
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Investor Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-3xl font-bold">{investors.length}</div>
                    <div className="text-sm text-muted-foreground">
                      Total Investors
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xl font-semibold">
                        {investorsByCategory.length}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Categories
                      </div>
                    </div>
                    <div>
                      <div className="text-xl font-semibold">
                        {investorsByType.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Types</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xl font-semibold">
                      {
                        investors.filter((i) => i.kycStatus === "approved")
                          .length
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">
                      KYC Approved
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Distribution Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        {
                          name: "By Category",
                          count: investorsByCategory.length,
                        },
                        { name: "By Type", count: investorsByType.length },
                        {
                          name: "By KYC Status",
                          count: investorsByKYCStatus.length,
                        },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="by-type" className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  Investor Types Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={investorsByType}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percentage }) =>
                          `${name}: ${percentage}%`
                        }
                      >
                        {investorsByType.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  Investor Types Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {investorsByType.map((type, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                        <span className="font-medium">{type.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{type.value}</Badge>
                        <Badge
                          variant="secondary"
                          className="bg-blue-50 text-blue-700 border-blue-200"
                        >
                          {type.percentage}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="by-category" className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  Investor Categories Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={investorsByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percentage }) =>
                          `${name}: ${percentage}%`
                        }
                      >
                        {investorsByCategory.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  Investor Categories Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {investorsByCategory.map((category, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{category.value}</Badge>
                        <Badge
                          variant="secondary"
                          className="bg-blue-50 text-blue-700 border-blue-200"
                        >
                          {category.percentage}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="by-status" className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  KYC Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={investorsByKYCStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percentage }) =>
                          `${name}: ${percentage}%`
                        }
                      >
                        {investorsByKYCStatus.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              entry.name === "Approved"
                                ? "#10b981"
                                : entry.name === "Pending"
                                  ? "#f59e0b"
                                  : entry.name === "Failed"
                                    ? "#ef4444"
                                    : entry.name === "Not Started"
                                      ? "#6b7280"
                                      : entry.name === "Expired"
                                        ? "#7c3aed"
                                        : COLORS[index % COLORS.length]
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">KYC Status Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {investorsByKYCStatus.map((status, index) => {
                    const getStatusColor = (name: string) => {
                      switch (name) {
                        case "Approved":
                          return "bg-green-500";
                        case "Pending":
                          return "bg-yellow-500";
                        case "Failed":
                          return "bg-red-500";
                        case "Not Started":
                          return "bg-gray-500";
                        case "Expired":
                          return "bg-purple-500";
                        default:
                          return "bg-blue-500";
                      }
                    };

                    const getStatusBadgeClass = (name: string) => {
                      switch (name) {
                        case "Approved":
                          return "bg-green-50 text-green-700 border-green-200";
                        case "Pending":
                          return "bg-yellow-50 text-yellow-700 border-yellow-200";
                        case "Failed":
                          return "bg-red-50 text-red-700 border-red-200";
                        case "Not Started":
                          return "bg-gray-50 text-gray-700 border-gray-200";
                        case "Expired":
                          return "bg-purple-50 text-purple-700 border-purple-200";
                        default:
                          return "bg-blue-50 text-blue-700 border-blue-200";
                      }
                    };

                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3 h-3 rounded-full ${getStatusColor(status.name)}`}
                          />
                          <span className="font-medium">{status.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{status.value}</Badge>
                          <Badge
                            variant="secondary"
                            className={getStatusBadgeClass(status.name)}
                          >
                            {status.percentage}%
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CapTableVisualization;
