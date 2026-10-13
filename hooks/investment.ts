"use client";

import {
  listAvailablePlans,
  listMyInvestments,
} from "@/app/(dashboard)/investments/services/investment.service";
import { ALL_PLANS, StatusFilter } from "@/constants/investment";
import {
  cancelInvestment,
  getErrorMessage,
  getPlanOptions,
  listInvestments,
} from "@/services/investment.service";
import { Investment, MyInvestment, Plan } from "@/types/investment";
import { useCallback, useEffect, useMemo, useState } from "react";

export function useInvestments() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await listInvestments();
      setInvestments(data);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const cancel = useCallback(
    async (id: string, reason?: string) => {
      setCancellingId(id);
      try {
        await cancelInvestment(id, reason);
        await refresh();
        return { ok: true as const };
      } catch (err) {
        return { ok: false as const, message: getErrorMessage(err) };
      } finally {
        setCancellingId(null);
      }
    },
    [refresh],
  );

  return { investments, loading, error, cancellingId, cancel, refresh };
}

export function useInvestmentFilters(investments: Investment[]) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [planFilter, setPlanFilter] = useState(ALL_PLANS);

  const plans = useMemo(() => getPlanOptions(investments), [investments]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();

    return investments.filter((investment) => {
      const matchesSearch =
        investment.fullName.toLowerCase().includes(term) ||
        investment.email.toLowerCase().includes(term) ||
        investment.reference.toLowerCase().includes(term) ||
        investment.plan.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "All" || investment.status === statusFilter;
      const matchesPlan =
        planFilter === ALL_PLANS || investment.plan === planFilter;

      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [investments, search, statusFilter, planFilter]);

  return {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    planFilter,
    setPlanFilter,
    plans,
    filtered,
  };
}

export function useMyInvestments() {
  const [investments, setInvestments] = useState<MyInvestment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setInvestments(await listMyInvestments());
      setError(null);
    } catch {
      setError("We couldn't load your investments. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { investments, loading, error, refresh };
}

export function useAvailablePlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listAvailablePlans()
      .then(setPlans)
      .catch(() => setError("We couldn't load the plans. Please refresh."))
      .finally(() => setLoading(false));
  }, []);

  return { plans, loading, error };
}
