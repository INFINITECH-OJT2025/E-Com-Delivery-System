import { useState } from "react";
import { Accordion, AccordionItem } from "@heroui/react";
import { X, Mail } from "lucide-react";

const EmailInstructions = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="mb-5" >
    

      <Accordion variant="bordered" showDivider={false} >
        <AccordionItem
          key="email-instructions"
          aria-label="Email Communication Guide"
          title={
            <div className="flex items-center gap-2">
              <Mail className="text-primary" size={20} />
              📧 Email Communication Instructions
            </div>
          }
        >
          <p>
            Clicking on a user’s email will **automatically open** the default email client 
            (Gmail, Outlook, etc.) with a **pre-filled subject and message**.
          </p>

          {/* 📌 Email Content Example */}
          <ul className="list-disc list-inside my-3 text-gray-700 dark:text-gray-300">
            <li>
              <strong>Subject:</strong> 
              <span className="text-gray-900 dark:text-gray-200">
                {" "} "Regarding your support ticket - [Ticket Subject]"
              </span>
            </li>
            <li>
              <strong>Message:</strong>
              <p className="bg-gray-50 dark:bg-gray-800 p-2 rounded-md border border-gray-300 dark:border-gray-600 mt-2 text-gray-800 dark:text-gray-200">
                Hi, this is **E-Com Delivery Service Ticket Department.** <br />
                <br />
                This is regarding your query: 
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {" "} "[Ticket Message]"
                </span> <br />
                <br />
                Please let us know how we can assist you further.
              </p>
            </li>
          </ul>

          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            This allows **quick and seamless communication** with the customer.
          </p>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default EmailInstructions;
