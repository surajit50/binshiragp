import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Stat {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  value: string | number;
  change: string;
}

interface StatCardProps {
  stat: Stat;
}

const TempleteCart: React.FC<StatCardProps> = ({ stat }) => {
  const isPositive = !stat.change.startsWith("-");
  const changeValue = stat.change.replace(/[+-]/, "");

  return (
    <Card className={cn(
      "relative overflow-hidden hover:shadow-lg transition-all duration-300 group",
      "hover:-translate-y-1 hover:shadow-md dark:hover:shadow-neutral-700"
    )}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">
          {stat.title}
        </CardTitle>
        <div className={cn(
          "p-2 rounded-lg border",
          `bg-${stat.color}/20`,
          `border-${stat.color}/10`,
          `dark:border-${stat.color}/20`
        )}>
          <stat.icon className={cn(
            "h-5 w-5 transform transition-transform duration-300 group-hover:scale-110",
            `text-${stat.color} dark:text-${stat.color}/80`
          )} />
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <div className="text-3xl font-bold text-neutral-800 dark:text-neutral-100">
              {stat.value}
            </div>
            <div className={cn(
              "flex items-center gap-1 text-sm font-medium",
              isPositive ? "text-green-600" : "text-red-600",
              "dark:text-opacity-90"
            )}>
              {isPositive ? (
                <ArrowUpIcon className="h-4 w-4" />
              ) : (
                <ArrowDownIcon className="h-4 w-4" />
              )}
              <span>{changeValue}%</span>
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {isPositive ? "Growth" : "Decline"}
            </span>
            <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
              vs. previous month
            </span>
          </div>
        </div>

        {/* Animated progress bar */}
        <div className="mt-4 relative h-1.5 bg-neutral-200 rounded-full overflow-hidden dark:bg-neutral-800">
          <div
            className={cn(
              "absolute h-full rounded-full transition-all duration-500",
              isPositive ? "bg-green-500" : "bg-red-500"
            )}
            style={{ width: `${Math.min(Math.abs(Number(changeValue)), 100)}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default TempleteCart;
