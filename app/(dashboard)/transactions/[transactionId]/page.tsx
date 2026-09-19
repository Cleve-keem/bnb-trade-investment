"use client";

import { useParams } from "next/navigation";
import DashboardShell from "@/components/bnb/layout/DashBoardShell";

export default function TransactionDetailsPage() {
  const { transactionId } = useParams();

  return <DashboardShell>Transaction {transactionId} details </DashboardShell>;
}
