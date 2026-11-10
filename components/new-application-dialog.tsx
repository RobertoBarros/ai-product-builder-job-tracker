"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ApplicationForm } from "@/components/application-form";
import { ImportApplicationsForm } from "@/components/import-applications-form";
import { createApplication } from "@/app/(tracker)/applications/actions";

export function NewApplicationDialog() {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add application</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add application</DialogTitle>
        </DialogHeader>
        <ApplicationForm
          action={createApplication}
          submitLabel="Add application"
          onSuccess={close}
        />
        <section className="border-t pt-4 flex flex-col gap-4">
          <h3 className="font-semibold">Or import from CSV</h3>
          <ImportApplicationsForm onSuccess={close} />
        </section>
      </DialogContent>
    </Dialog>
  );
}
