import { Card, CardBody } from "@heroui/react";

export default function StatCard({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <Card className="shadow-sm rounded-2xl w-full transition-all duration-300 bg-white dark:bg-gray-900">
      <CardBody className="p-5">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
          {title}
        </p>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          {value}
        </h2>
      </CardBody>
    </Card>
  );
}
