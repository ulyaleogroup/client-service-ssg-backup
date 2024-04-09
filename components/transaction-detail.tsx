"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatToRupiah } from "@/lib/admin-actions";
import moment from "moment";
import Sharelink from "./sharelink";
import React, { useState } from "react";
import useSWR from "swr";
import { ChevronLeft, ChevronRight } from "lucide-react";

const fetcher = async (...args: Parameters<typeof fetch>) => {
  const res = await fetch(...args);
  return res.json();
};

const TransactionDetail = () => {
  const [page, setPage] = useState(1);

  const { data, error } = useSWR(
    `${window.location.origin}/api/transactions?page=${page}`,
    fetcher
  );

  const transactions = data?.data;
  const totalPages = data?.metadata?.totalPages || 0;

  const nextPage = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const prevPage = () => {
    setPage((prevPage) => prevPage - 1);
  };

  const goToPage = (pageNumber: any) => {
    setPage(pageNumber);
  };

  const renderPageNumbers = () => {
    const range = 2; // Jumlah halaman yang akan ditampilkan sebelum dan sesudah halaman saat ini
    const currentPage = page;
  
    const start = Math.max(1, currentPage - range);
    const end = Math.min(totalPages, currentPage + range);
  
    const pageNumbers = [];
  
    if (start > 1) {
      pageNumbers.push(
        <button key={1} onClick={() => goToPage(1)} className="text-lg p-2">
          1
        </button>
      );
  
      if (start > 2) {
        pageNumbers.push(
          <span key="start-ellipsis" className="p-2">...</span>
        );
      }
    }
  
    for (let i = start; i <= end; i++) {
      pageNumbers.push(
        <button key={i} onClick={() => goToPage(i)} disabled={i === page} className={`text-lg p-2 ${i === currentPage ? 'text-primary' : ''}`}>
          {i}
        </button>
      );
    }
  
    if (end < totalPages) {
      if (end < totalPages - 1) {
        pageNumbers.push(
          <span key="end-ellipsis" className="p-2">...</span>
        );
      }
  
      pageNumbers.push(
        <button key={totalPages} onClick={() => goToPage(totalPages)} className="text-lg p-2">
          {totalPages}
        </button>
      );
    }
  
    return pageNumbers;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="">Transaction Id</TableHead>
            <TableHead className="">Date</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Telegram Id</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">Payment Url</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions?.map((transaction: any) => (
            <TableRow key={transaction.id}>
              <TableCell className="font-medium">{transaction.id}</TableCell>
              <TableCell>
                {moment(transaction.updatedAt).format("DD/MM/YYYY")}
              </TableCell>
              <TableCell>{transaction.user.name}</TableCell>
              <TableCell>{transaction.user.telegramId}</TableCell>
              <TableCell>{formatToRupiah(transaction.price)}</TableCell>
              <TableCell>{transaction.status}</TableCell>
              <TableCell className="text-center">
                <Sharelink link={transaction.snapRedirectUrl as string} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow className="text-end">
            <TableCell colSpan={7}>
              <div className="flex items-center justify-center">
                <button
                  onClick={prevPage}
                  disabled={data?.metadata?.currentPage < 2}
                  className="border rounded-sm p-2"
                >
                  <ChevronLeft />
                </button>
                {renderPageNumbers()}
                <button
                  onClick={nextPage}
                  disabled={
                    data?.metadata?.currentPage > data?.metadata?.totalPages - 1
                  }
                  className="border rounded-sm p-2"
                >
                  <ChevronRight />
                </button>
              </div>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
};

export default TransactionDetail;
