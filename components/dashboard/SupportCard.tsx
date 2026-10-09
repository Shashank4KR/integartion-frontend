"use client";

import { useState } from "react";
import Card from "@/components/shared/Card";
import { Headset } from "lucide-react";
import ContactSupportModal from "@/components/shared/ContactSupportModal";

export default function SupportCard() {
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  return (
    <Card>
      <div className="p-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-purple-100 rounded-full">
            <Headset className="w-6 h-6 text-purple-600" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Need Help?
        </h3>
        <p className="text-sm text-slate-600 mb-4">
          Contact our support team for assistance
        </p>
        <button
          type="button"
          onClick={() => setIsSupportOpen(true)}
          className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-2 rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700 transition"
        >
          Contact Support
        </button>
      </div>
      <ContactSupportModal
        open={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />
    </Card>
  );
}

