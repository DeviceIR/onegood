import { formatToman } from "@/lib/money";

export function Money({
  amount,
  withUnit = true,
  className,
}: {
  amount: number | bigint;
  withUnit?: boolean;
  className?: string;
}) {
  return <span className={className}>{formatToman(amount, { withUnit })}</span>;
}
