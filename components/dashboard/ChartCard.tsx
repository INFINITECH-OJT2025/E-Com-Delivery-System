import { Card, CardBody } from "@heroui/react";
import { ReactNode } from "react";

export default function ChartCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Card className="shadow-sm rounded-2xl w-full h-full transition-all duration-300 bg-white dark:bg-gray-900">
      <CardBody className="p-5">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          {title}
        </h3>
        {children}
      </CardBody>
    </Card>
  );
}
