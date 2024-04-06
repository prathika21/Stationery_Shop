import React, { useState, useEffect } from "react";
import Message from "../../components/Message";
import Loader from "../../components/Loader";
import { Link } from "react-router-dom";
import { useGetOrdersQuery } from "../../redux/api/orderApiSlice";
import AdminMenu from "./AdminMenu";

const OrderList = () => {
  const { data: orders, isLoading, error } = useGetOrdersQuery();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [timeFrame, setTimeFrame] = useState("");
  const [downloadEnabled, setDownloadEnabled] = useState(false); // State to track if download is enabled

  const handleDownload = () => {
    if ((timeFrame !== "custom" && timeFrame !== "") || (timeFrame === "custom" && startDate && endDate)) {
      let start, end;
  
      if (timeFrame === "custom") {
        start = new Date(startDate);
        end = new Date(endDate);
      } else {
        start = new Date();
        end = new Date();
  
        switch (timeFrame) {
          case "lastYear":
            start.setFullYear(start.getFullYear() - 1);
            start.setMonth(0);
            start.setDate(1);
            end.setMonth(0);
            end.setDate(1);
            break;
          case "lastMonth":
            start.setMonth(start.getMonth() - 1);
            start.setDate(1);
            end.setDate(0); // Set end to the last day of the previous month
            break;
          case "last10Days":
            start.setDate(start.getDate() - 10);
            break;
          case "last5Days":
            start.setDate(start.getDate() - 5);
            break;
          case "yesterday":
            start.setDate(start.getDate() - 1);
            break;
          default:
            break;
        }
      }
  
      // Filter orders based on the selected range of dates
      const filteredOrders = orders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= start && orderDate <= end;
      });
  
      // Prepare titles for each column
      const titles = ["ID", "User", "Date", "Total", "Paid", "Delivered"];
  
      // Format filtered orders into CSV format with specific fields and titles
      let csvContent = "data:text/csv;charset=utf-8," + titles.join(",") + "\n";
      csvContent += filteredOrders
        .map((order) => {
          const { _id, user, createdAt, totalPrice, isPaid, isDelivered } = order;
          const date = createdAt ? new Date(createdAt).toLocaleDateString("en-GB") : "N/A";
          const paidStatus = isPaid ? "Completed" : "Pending";
          const deliveredStatus = isDelivered ? "Completed" : "Pending";
          return `${_id},${user ? user.username : "N/A"},${date},${totalPrice},${paidStatus},${deliveredStatus}`;
        })
        .join("\n");
  
      // Create a temporary anchor element and trigger download
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `orders_${start.toISOString().split("T")[0]}_to_${end.toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      setDownloadEnabled(true);
    }
  };
  

  return (
    <>
      <h1 className="text-2xl font-semibold mb-4 text-center">Order details</h1>
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error?.data?.message || error.error}</Message>
      ) : (
        <>
          <table className="container mx-auto">
            <AdminMenu />
            <thead className="w-full border">
              <tr className="mb-[5rem]">
                <th className="text-left pl-1">ITEMS</th>
                <th className="text-left pl-1">ID</th>
                <th className="text-left pl-1">USER</th>
                <th className="text-left pl-1">DATE</th>
                <th className="text-left pl-1">TOTAL</th>
                <th className="text-left pl-1">PAID</th>
                <th className="text-left pl-1">DELIVERED</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>
                    <img src={order.orderItems[0].image} alt={order._id} className="w-[5rem] pt-4" />
                  </td>
                  <td>{order._id}</td>
                  <td>{order.user ? order.user.username : "N/A"}</td>
                  <td>{order.createdAt ? order.createdAt.substring(0, 10) : "N/A"}</td>
                  <td> ₹ {order.totalPrice}</td>
                  <td className="py-2">
                    {order.isPaid ? (
                      <p className="p-1 text-center bg-green-400 w-[6rem] rounded-full">Completed</p>
                    ) : (
                      <p className="p-1 text-center bg-red-400 w-[6rem] rounded-full">Pending</p>
                    )}
                  </td>
                  <td className="px-2 py-2">
                    {order.isDelivered ? (
                      <p className="p-1 text-center bg-green-400 w-[6rem] rounded-full">Completed</p>
                    ) : (
                      <p className="p-1 text-center bg-red-400 w-[6rem] rounded-full">Pending</p>
                    )}
                  </td>
                  <td>
                    <Link to={`/order/${order._id}`}>
                      <button>More</button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-center mt-4">
            <select
              className="bg-gray-200 text-gray-800 border py-2 px-4 rounded"
              value={timeFrame}
              onChange={(e) => {
                setTimeFrame(e.target.value);
                if (e.target.value === "custom") {
                  setStartDate("");
                  setEndDate("");
                }
              }}
            >
              <option value="">Select </option>
              <option value="custom">Custom</option>
              <option value="yesterday">Yesterday</option>
              <option value="last5Days">Last 5 Days</option>
              <option value="last10Days">Last 10 Days</option>
              <option value="lastMonth">Last Month</option>
              <option value="lastYear">Last Year</option>           
            </select>
            {timeFrame === "custom" && (
              <>
                <input
                  type="date"
                  className="bg-gray-200 text-gray-800 border py-2 px-4 rounded ml-4"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]} // Set max date as present date
                />
                <input
                  type="date"
                  className="bg-gray-200 text-gray-800 border py-2 px-4 rounded ml-4"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]} // Set max date as present date
                />
              </>
            )}
            <button
              className="bg-pink-600 text-white py-2 px-4 rounded ml-4"
              onClick={handleDownload}
              disabled={!startDate || !endDate}
            >
              Download Orders
            </button>
          </div>
        </>
      )}
    </>
  );
};

export default OrderList;
