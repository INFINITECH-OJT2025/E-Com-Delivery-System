import { Card, CardBody } from "@heroui/react";
import { ReactNode } from "react";

export default function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="shadow-md rounded-xl w-full h-full">
      <CardBody className="p-4">
        <h3 className="text-lg font-semibold mb-3">{title}</h3>
        {children}
      </CardBody>
    </Card>
  );
}
