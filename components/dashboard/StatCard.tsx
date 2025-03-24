import { Card, CardBody } from "@heroui/react";

export default function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <Card className="shadow-md rounded-xl w-full">
      <CardBody className="p-4">
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <h2 className="text-2xl font-bold text-gray-900">{value}</h2>
      </CardBody>
    </Card>
  );
}
