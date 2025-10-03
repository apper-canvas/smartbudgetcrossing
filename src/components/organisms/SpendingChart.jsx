import React from "react";
import Chart from "react-apexcharts";
import Card from "@/components/atoms/Card";

const SpendingChart = ({ data, type = "pie" }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const pieChartOptions = {
    chart: {
      type: "pie",
      toolbar: { show: false }
    },
labels: data.map(item => item.category_c?.Name || item.category),
    colors: [
      "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
      "#06b6d4", "#84cc16", "#f97316", "#ec4899", "#6366f1"
    ],
    legend: {
      position: "bottom",
      fontSize: "14px"
    },
    plotOptions: {
      pie: {
        donut: {
          size: "60%"
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function(val) {
        return val.toFixed(1) + "%";
      }
    },
    tooltip: {
      y: {
        formatter: formatCurrency
      }
    },
    responsive: [{
      breakpoint: 768,
      options: {
        legend: {
          position: "bottom"
        }
      }
    }]
  };

  const lineChartOptions = {
    chart: {
      type: "line",
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    colors: ["#3b82f6"],
    stroke: {
      curve: "smooth",
      width: 3
    },
    xaxis: {
categories: data.map(item => item.date_c || item.date),
      labels: {
        style: {
          fontSize: "12px"
        }
      }
    },
    yaxis: {
      labels: {
        formatter: formatCurrency,
        style: {
          fontSize: "12px"
        }
      }
    },
    tooltip: {
      y: {
        formatter: formatCurrency
      }
    },
    grid: {
      borderColor: "#f3f4f6"
    },
    markers: {
      size: 6,
      hover: {
        size: 8
      }
    }
  };

  const chartData = type === "pie" 
? data.map(item => item.amount_c || item.amount)
    : [{
        name: "Spending",
        data: data.map(item => item.amount_c || item.amount)
      }];

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {type === "pie" ? "Spending by Category" : "Spending Trend"}
        </h3>
        <p className="text-sm text-gray-500">
          {type === "pie" ? "This month's expense breakdown" : "Last 30 days spending"}
        </p>
      </div>
      
      {data.length > 0 ? (
        <Chart
          options={type === "pie" ? pieChartOptions : lineChartOptions}
          series={chartData}
          type={type}
          height={type === "pie" ? 400 : 300}
        />
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
          <p className="text-gray-500">
            {type === "pie" 
              ? "Add some transactions to see your spending breakdown"
              : "Add transactions to see your spending trends"
            }
          </p>
        </div>
      )}
    </Card>
  );
};

export default SpendingChart;